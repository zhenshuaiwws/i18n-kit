"use strict";

const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const term = require("terminal-kit").terminal;
const ExcelJS = require("exceljs");
const utils = require("./src/utils");

class CodeServiceFactory {
  constructor() {
    this.config;
    this.allFiles = [];
    this.fuzzyCount = 0;
    this.allTranslations = [];
    this.translationObject = {};
    this.matchErrorTranslations = [];
    this.combineErrorTranslations = [];
  }

  init(config) {
    this.config = config;
    this.findAllFiles();
  }

  findAllFiles() {
    this.allFiles = utils.findDirFiles(this.config.codePath);
    term(`=> Code find: ${this.allFiles.length} files(.ts,.js) \n`);
  }

  findAllTranslation() {
    this.allFiles.forEach((file) => {
      const fileContent = fs.readFileSync(file, {
        encoding: "utf-8",
      });
      const shortFile = file.replace(this.config.codePath, "");

      const fuzzyCount = (fileContent.match(/i18nTranslate\(/g) || []).length;
      this.fuzzyCount += fuzzyCount;

      const rawItems =
        fileContent.replace(/\n/g, "").match(/i18nTranslate\(([^\(\)]*)\)/g) ||
        [];
      // .match(/(i18nTranslate\()(\s*)('|").*?\}?\)/g)

      if (fuzzyCount !== rawItems.length) {
        utils.writeDebugLog("fileContent", fileContent.replace(/\n/g, ""));
        utils.commandLogError(
          this.config.dart,
          `=> Code parser miss: ${shortFile} ${
            fuzzyCount - rawItems.length
          } miss`
        );
      }

      rawItems.forEach((current) => {
        const n = current.match(/('|"|'\\|"\\|`).+?('|"|'\\|"\\|`)/g);
        if (n && n.length === 2) {
          const rawKey = n[0].replace(/'|"|'\\|"\\/g, "");
          const text = n[1].replace(/'|"|'\\|"\\/g, "");
          this.allTranslations.push({
            rawKey,
            text,
            file,
            shortFile,
          });
        } else {
          this.matchErrorTranslations.push({
            content: current,
            file,
            shortFile,
          });
          utils.commandLogError(
            this.config.dart,
            `=> Code parser error: ${file} ${current}`
          );
        }
      });
    });

    // 按照rawKey长度排序，以此用来判断“key冲突”的错误
    this.allTranslations = _.reverse(
      _.sortBy(this.allTranslations, (n) => n.rawKey.length)
    );

    term.bold.brightYellow(
      `=> Code parser: ${this.fuzzyCount} pass / ${
        this.fuzzyCount - this.allTranslations.length
      } miss / ${this.matchErrorTranslations.length} error.`
    );
    term(`\n`);
    utils.writeDebugLog(
      "code-match-error",
      this.matchErrorTranslations.map(
        (n) => `${n.content.replace(/ /g, "")}\n${n.file}\n`
      )
    );
  }

  combineTranslationObject() {
    this.allTranslations.forEach((n) => {
      const find = _.get(this.translationObject, n.rawKey);
      if (_.isObject(find)) {
        n.error = "key冲突(类似的key会导致覆盖丢失其他翻译)";
        this.combineErrorTranslations.push(n);
        utils.commandLogError(
          this.config.dart,
          `=> Code traverse error: ${n.rawKey} ${n.error}`
        );
        return;
      }
      if (find && find !== n.text) {
        n.error = "同key不同翻译";
        this.combineErrorTranslations.push(n);
        utils.commandLogError(
          this.config.dart,
          `=> Code traverse error: ${n.rawKey} ${n.error}`
        );
        return;
      }
      _.set(this.translationObject, n.rawKey, n.text);
    });

    term.bgBlack.brightYellow.bold(
      `=> Code traverse: ${
        this.allTranslations.length - this.combineErrorTranslations.length
      } success, ${this.combineErrorTranslations.length} error. \n`
    );
    utils.writeDebugLog("code-match-translations", this.allTranslations);
    utils.writeDebugLog("code-combine-error", this.combineErrorTranslations);

    return this.translationObject;
  }
}

module.exports = new CodeServiceFactory();
