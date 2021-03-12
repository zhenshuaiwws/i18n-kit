"use strict";

const fs = require("fs");
const fse = require("fs-extra");
const _ = require("lodash");
const term = require("terminal-kit").terminal;
const singleLineLog = require("single-line-log").stdout;
const utils = require("./utils");

class JsonServiceFactory {
  constructor() {
    this.config;
  }

  init(config) {
    term("=> Json...\n");

    this.config = config;
    this.langObject = {};
    this.checkFilePath();
    this.readJsonAndParse();
  }

  checkFilePath() {
    term(`=> Json: check file.\n`);

    try {
      fse.statSync(this.config.jsonPath);
    } catch (error) {
      utils.commandLogError(
        false,
        `=> Json Error: ${this.config.jsonPath} no such file.\n`
      );
      process.exit();
    }
  }

  readJsonAndParse() {
    const jsonContent = fs.readFileSync(this.config.jsonPath, {
      encoding: "utf-8",
    });
    if (jsonContent.length > 0) {
      let _langObject;
      try {
        _langObject = JSON.parse(`${jsonContent}`);
      } catch (error) {
        utils.commandLogError(
          true,
          `=> Json Error: JSON syntax error in ${this.config.jsonPath}`
        );
      }
      this.langObject = _langObject;
    }
  }

  translationsMergeToLangJsonObject(translationObject) {
    const diff = this.deepDiff(this.langObject, translationObject);
    const addCount = diff.filter(([k, n]) => !!n.to && !n.from).length;
    const updateCount = diff.filter(([k, n]) => !!n.to && !!n.from).length;

    term.bgBlack.brightYellow.bold(
      `=> Json: add ${addCount} items, update ${updateCount} items. \n`
    );
    utils.writeDebugLog("jsonDiff", diff);

    _.merge(this.langObject, translationObject);
  }

  saveToJson() {
    term(`=> Json: saving to json file.\n`);
    fs.writeFileSync(
      this.config.jsonPath,
      JSON.stringify(this.langObject, "", 2),
      { encoding: "utf-8" }
    );
    term(`=> Json: save done.\n`);
  }

  /**
   * 深度对比两个对象
   * @param  {Object} fromObject
   * @param  {Object} toObject
   * @return {Array}
   */
  deepDiff(fromObject, toObject) {
    const changes = {};
    const changeList = [];

    const buildPath = (path, obj, key) =>
      _.isUndefined(path) ? key : `${path}.${key}`;

    const walk = (fromObject, toObject, path) => {
      for (const key of _.keys(fromObject)) {
        const currentPath = buildPath(path, fromObject, key);
        if (!_.has(toObject, key)) {
          changes[currentPath] = { from: _.get(fromObject, key) };
          changeList.push([currentPath, { from: _.get(fromObject, key) }]);
        }
      }

      for (const [key, to] of _.entries(toObject)) {
        const currentPath = buildPath(path, toObject, key);
        if (!_.has(fromObject, key)) {
          changes[currentPath] = { to };
          changeList.push([currentPath, { to }]);
        } else {
          const from = _.get(fromObject, key);
          if (!_.isEqual(from, to)) {
            if (_.isObjectLike(to) && _.isObjectLike(from)) {
              walk(from, to, currentPath);
            } else {
              changes[currentPath] = { from, to };
              changeList.push([currentPath, { from, to }]);
            }
          }
        }
      }
    };

    walk(fromObject, toObject);

    return changeList;
  }
}

module.exports = new JsonServiceFactory();
