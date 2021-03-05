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
  const params = {
    excel: {
      path: path.resolve(args.processCwd, args.excel[0]),
      worksheetNumber: args.excel[1],
      pathColumnKey: args.excel[2],
      langColumnKey: args.excel[3],
      fileColumnKey: args.excel[4],
    },
    code: {
      path: path.resolve(args.processCwd, args.code),
    },
  };

  await codeService.check();

  codeService.init(params.code);
  codeService.findAllTranslation();
  codeService.combineTranslationObject();

  await excelService.init(params.excel);
  excelService.getLastRowNumber();
  excelService.insetRow(_.uniqBy(codeService.allTranslations, "rawKey"));
  await excelService.outToFile();

  console.log("==> Success!!!");
}

function taskCodeToJson() {}

function taskExcelToJson() {}

async function taskJsonToCode() {}

module.exports = {
  taskCodeToExcel,
};
