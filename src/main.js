"use strict";

const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const ExcelJS = require("exceljs");

const excelService = require("./excel");
const codeService = require("./code");

async function taskCheckCode() {}

/**
 * 从Code中查找翻译项，输出到Excel中
 */
async function taskCodeToExcel(args) {
  codeService.init(args);
  codeService.findAllTranslation();
  codeService.combineTranslationObject();

  await excelService.init(args);
  excelService.execute(
    _.sortBy(_.uniqBy(codeService.allTranslations, "rawKey"), "file")
  );
  if (!args.dart) {
    await excelService.exportToFile();
  }
}

function taskCodeToJson() {}

function taskExcelToJson() {}

async function taskJsonToCode() {}

module.exports = {
  taskCodeToExcel,
};
