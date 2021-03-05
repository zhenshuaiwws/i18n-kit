"use strict";

const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const ExcelJS = require("exceljs");
const utils = require("./utils");

class CodeServiceFactory {
  constructor() {
    this.config;
    this.allFiles = [];
    this.allTranslations = [];
    this.translationObject = {};
    this.matchErrorTranslations = [];
    this.combineErrorTranslations = [];
  }

  init(config) {
    this.config = config;
    this._findAllFiles();
  }

  async check() {}

  findAllTranslation() {
    this.allFiles.forEach((file) => {
      const fileContent = fs.readFileSync(file, {
        encoding: "utf-8",
      });

      const rawItems =
        fileContent.replace(/\n/g, "").match(/i18nTranslate\(('|").*?\}?\)/g) ||
        [];

      rawItems.forEach((current) => {
        const n = current.match(/('|"|'\\|"\\)\S+('|"|'\\|"\\)/g);
        if (n && n.length === 2) {
          const rawKey = n[0].replace(/'|"|'\\|"\\/g, "");
          const text = n[1].replace(/'|"|'\\|"\\/g, "");
          this.allTranslations.push({
            rawKey,
            text,
            file: file.replace(this.config.path, ""),
          });
        } else {
          this.matchErrorTranslations.push({
            content: current,
            file,
          });
        }
      });
    });

    // 按照rawKey长度排序，以此用来判断“key冲突”的错误
    this.allTranslations = _.reverse(
      _.sortBy(this.allTranslations, (n) => n.rawKey.length)
    );

    console.log(
      `==> Code match: ${this.allTranslations.length} found, ${this.matchErrorTranslations.length} errors.`
    );

    if (this.matchErrorTranslations.length > 0) {
    //   process.exit(1);
    }
  }

  combineTranslationObject() {
    this.allTranslations.forEach((n) => {
      const find = _.get(this.translationObject, n.rawKey);
      if (_.isObject(find)) {
        n.error = "key冲突，已经存在类似，会导致覆盖其他翻译";
        this.combineErrorTranslations.push(n);
        return;
      }
      if (find && find !== n.text) {
        n.error = "同key不同翻译";
        this.combineErrorTranslations.push(n);
        return;
      }
      _.set(this.translationObject, n.rawKey, n.text);
    });

    console.error(
      `==> Code generator: ${
        this.allTranslations.length - this.combineErrorTranslations.length
      } success, ${this.combineErrorTranslations.length} errors.`
    );
    utils.writeDebugLog("code.allTranslations", this.allTranslations);
    utils.writeDebugLog(
      "code.combineErrorTranslations",
      this.combineErrorTranslations
    );
    if (this.combineErrorTranslations.length > 0) {
    //   process.exit(1);
    }

    return this.translationObject;
  }

  _findAllFiles() {
    this.allFiles = utils.findDirFiles(this.config.path);
    console.log(`==> Code: ${this.allFiles.length} files found.`);
  }
}

module.exports = new CodeServiceFactory();
