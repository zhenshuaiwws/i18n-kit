"use strict";

const fs = require("fs");
const _ = require("lodash");
const term = require("terminal-kit").terminal;
const singleLineLog = require("single-line-log").stdout;

const utils = require("./utils");

class JsonServiceFactory {
  constructor() {
    this.config;
  }

  init(config) {
    this.config = config;
    this.checkFilePath();
  }

  checkFilePath() {
    const result = fs.statSync(this.config.jsonPath);
    console.log("");
  }
}

module.exports = new JsonServiceFactory();
