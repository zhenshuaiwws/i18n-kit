"use strict";

const _ = require("lodash");
const excelService = require("./excel");
const codeService = require("./code");

/**
 * 从 Code 中查找翻译项，输出到 Json 中
 */
async function taskCodeToJson() {}

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
async function taskExcelToJson() {}

/**
 * 把 Json 中的翻译项，同步到 Code 中
 */
async function taskJsonToCode() {}

module.exports = {
  taskCodeToJson,
  taskCodeToExcel,
  taskExcelToJson,
  taskJsonToCode,
};
