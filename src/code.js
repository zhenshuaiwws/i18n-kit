const fs = require('fs');
const _ = require('lodash');
const term = require('terminal-kit').terminal;
const singleLineLog = require('single-line-log').stdout;
const babelParse = require('@babel/parser').parse;
const babelGenerator = require('@babel/generator').default;
const babelTraverse = require('@babel/traverse').default;

const utils = require('./utils');

class CodeServiceFactory {
  constructor() {
    // 所有文件路径
    this.files = [];
    // 所有 i18nTranslate 翻译项
    this.translations = [];
    // 所有 i18nTranslate 翻译项的对象
    this.translationObject = {};
    // 转化为对象时的错误
    this.errorTranslations = [];
  }

  init(config) {
    term('=> Code...\n');
    this.config = config;
    this.findAllFile();
    this.findTranslationsInAllFiles();
    this.combineToTranslationObject();
    // 按照rawKey长度排序，以此用来判断“key冲突”的错误
    this.translations = _.reverse(
      _.sortBy(_.uniqBy(this.translations, 'rawKey'), (n) => n.rawKey.length)
    );
    term.bgBlack.brightYellow.bold(
      `=> Code: ${this.translations.length} pass, ${this.errorTranslations.length} error.\n`
    );
  }

  findAllFile() {
    this.files = utils.findDirFiles(this.config.codeFolderPath);
    if (this.config.codeExcluded) {
      this.files = this.files.filter((path) => {
        let isIncludes;
        this.config.codeExcluded.forEach((k) => {
          if (isIncludes) {
            return false;
          }
          if (path.includes(k)) {
            isIncludes = true;
          }
          return true;
        });
        return !isIncludes;
      });
    }
    term(`=> Code find: ${this.files.length} files(.ts,.js).\n`);
    utils.writeDebugLog('files', this.files);
  }

  findTranslateInFile(file) {
    const fileContent = fs.readFileSync(file, {
      encoding: 'utf-8'
    });

    const shortFile = file.replace(this.config.codeFolderPath, '');

    const ast = babelParse(fileContent, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy'],
      presets: ['@babel/preset-typescript']
    });

    babelTraverse(ast, {
      CallExpression: (path) => {
        if (path.node.callee.name === 'i18nTranslate') {
          const args = path.node.arguments;
          let rawKey = args[0].value;
          let text;

          if (args[1].type !== 'StringLiteral') {
            text = babelGenerator(args[1]).code;
          } else {
            text = args[1].value;
          }

          if (args[0].type === 'StringLiteral') {
            rawKey = args[0].value;
          } else {
            this.errorTranslations.push({
              rawKey,
              text,
              file,
              shortFile,
              error: 'key必须为基本String类型'
            });
            return;
          }

          this.translations.push({
            rawKey,
            text,
            file,
            shortFile
          });
        }
      }
    });
  }

  findTranslationsInAllFiles() {
    this.files.forEach((file) => {
      singleLineLog(`${file}\n`);
      this.findTranslateInFile(file);
      singleLineLog('');
    });
  }

  combineToTranslationObject() {
    this.translations.forEach((n) => {
      const find = _.get(this.translationObject, n.rawKey);
      if (_.isObject(find)) {
        n.error = 'key冲突(类似的key会导致覆盖丢失其他翻译)';
        this.errorTranslations.push(n);
        utils.commandLogError(this.config.dryRun, `=> Code traverse error: ${n.rawKey} ${n.error}`);
      } else if (find && find !== n.text) {
        n.error = '同key不同翻译';
        this.errorTranslations.push(n);
        utils.commandLogError(this.config.dryRun, `=> Code traverse error: ${n.rawKey} ${n.error}`);
      } else {
        _.set(this.translationObject, n.rawKey, n.text);
      }
    });
  }
}

module.exports = new CodeServiceFactory();
