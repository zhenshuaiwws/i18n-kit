"use strict";

const _ = require("lodash");
const codeService = require("./code");
const jsonService = require("./json");
const excelService = require("./excel");

/**
 * 从 Code 中查找翻译项，输出到 Json 中
 */
async function taskCodeToJson(args) {
  codeService.init(args);

  jsonService.init(args);
  jsonService.translationsMergeToLangJsonObject(codeService.translationObject);
  if (!args.dryRun) {
    jsonService.saveToJson();
  }
}

/**
 * 从 Code 中查找翻译项，输出到 Excel 中
 */
async function taskCodeToExcel(args) {
  codeService.init(args);

  await excelService.init(args);
  excelService.execute(_.sortBy(codeService.translations, "file"));
  if (!args.dryRun) {
    await excelService.exportToFile();
  }
}

/**
 * 把 Excel 中的翻译项，输出到 Json 中
 */
async function taskExcelToJson(args) {
  await excelService.init(args);
  excelService.combineToTranslationObject();

  jsonService.init(args);
  jsonService.translationsMergeToLangJsonObject(excelService.translationObject);
  if (!args.dryRun) {
    await jsonService.saveToJson();
  }
}

/**
 * 把 Json 中的翻译项，同步到 Code 中
 */
async function taskJsonToCode(args) {}

module.exports = {
  taskCodeToJson,
  taskCodeToExcel,
  taskExcelToJson,
  taskJsonToCode,
};
