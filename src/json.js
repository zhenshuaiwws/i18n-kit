const fs = require('fs');
const fse = require('fs-extra');
const _ = require('lodash');
const term = require('terminal-kit').terminal;
const utils = require('./utils');

class JsonServiceFactory {
  constructor() {
    this.config = {};
  }

  init(config) {
    term('=> Json...\n');

    this.config = config;
    this.langObject = {};
    this.checkFilePath();
    this.readJsonAndParse();
  }

  checkFilePath() {
    term('=> Json: check file.\n');

    try {
      fse.statSync(this.config.jsonPath);
    } catch (error) {
      utils.commandLogError(`=> Json Error: ${this.config.jsonPath} no such file.\n`);
      process.exit();
    }
  }

  readJsonAndParse() {
    const jsonContent = fs.readFileSync(this.config.jsonPath, {
      encoding: 'utf-8'
    });
    if (jsonContent.length > 0) {
      let langObject;
      try {
        langObject = JSON.parse(`${jsonContent}`);
      } catch (error) {
        utils.commandLogError(`=> Json Error: JSON syntax error in ${this.config.jsonPath}`);
      }
      this.langObject = langObject;
    }
  }

  translationsMergeToLangJsonObject(translationObject) {
    const diff = utils.deepDiff(this.langObject, translationObject);
    const addCount = diff.filter(([k, n]) => !!n.to && !n.from).length;
    const updateCount = diff.filter(([k, n]) => !!n.to && !!n.from).length;

    term.bgBlack.brightYellow.bold(
      `=> Json: add ${addCount} items, update ${updateCount} items. \n`
    );
    utils.writeLog(this.config, 'i18n-kit-json-diff-log', diff);

    _.merge(this.langObject, translationObject);
  }

  saveToJson() {
    term('=> Json: saving to json file.\n');
    fs.writeFileSync(this.config.jsonPath, JSON.stringify(this.langObject, '', 2), {
      encoding: 'utf-8'
    });
    term('=> Json: save done.\n');
  }
}

module.exports = new JsonServiceFactory();
