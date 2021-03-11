"use strict";

const _ = require("lodash");
const term = require("terminal-kit").terminal;
const ExcelJS = require("exceljs");

class ExcelServiceFactory {
  constructor() {
    this.config;

    this.workbook = new ExcelJS.Workbook();

    this.worksheet = null;

    this.lastRowNumber = null;

    this.pathColumns = [];

    this.keyRowTexts = null;

    this.insertCount = 0;

    this.updateCount = 0;

    this.ignoreCount = 0;

    this.originalExcelTranslations = [];
  }

  async init(config) {
    this.config = config;

    const worksheets = await this.workbook.xlsx.readFile(config.excelPath);
    this.worksheet = worksheets.worksheets[config.excelWorksheetIndex];

    this.readFromExcel();
  }

  /**
   * 读取 Excel 中的数据
   */
  readFromExcel() {
    const columns = this.worksheet.getColumn(this.config.excelKeyColumnIndex);
    this.lastRowNumber = columns.values.length;

    columns.eachCell((cell, rowNumber) => {
      const row = this.worksheet.getRow(rowNumber);
      const item = {};
      if (this.config.excelKeyColumnIndex) {
        item.rawKey = row.getCell(this.config.excelKeyColumnIndex).text;
      }
      if (this.config.excelLangColumnIndex) {
        item.text = row.getCell(this.config.excelLangColumnIndex).text;
      }
      if (this.config.excelFileColumnIndex) {
        item.shortFile = row.getCell(this.config.excelFileColumnIndex).text;
      }
      this.originalExcelTranslations.push(item);
    });
  }

  execute(translations) {
    translations.forEach((n, i) => {
      const findIndex = _.findIndex(this.originalExcelTranslations, {
        rawKey: n.rawKey,
      });
      if (findIndex === -1) {
        this.insetRow(n);
      } else {
        this.updateRow(n, findIndex + 1);
      }
    });
    term.brightYellow.bold(
      `=> Excel: insert ${this.insertCount} update ${this.updateCount} ignore ${this.ignoreCount}`
    );
    term("\n");
  }

  /**
   * 插入数据到 Excel 中
   */
  insetRow(translation) {
    this.worksheet.insertRow(this.lastRowNumber, this.combineRow(translation));
    this.lastRowNumber++;
    this.insertCount++;
  }

  /**
   * 更新数据到 Excel 中
   */
  updateRow(translation, rowNumber) {
    const row = this.worksheet.getRow(rowNumber);
    const langColumn = row.getCell(this.config.excelLangColumnIndex);
    if (langColumn.value === translation.text) {
      this.ignoreCount++;
      return;
    } else {
      langColumn.value = translation.text;
      langColumn.fill = {
        type: "gradient",
        gradient: "angle",
        degree: 0,
        stops: [
          { position: 0, color: { argb: "FF1493" } },
          { position: 0.5, color: { argb: "FF1493" } },
          { position: 1, color: { argb: "FF1493" } },
        ],
      };

      this.updateCount++;
    }
  }

  /**
   * 组合新 Row 的数据
   */
  combineRow(n) {
    const rowValues = [];
    rowValues[this.config.excelKeyColumnIndex] = n.rawKey;
    rowValues[this.config.excelLangColumnIndex] = n.text;
    rowValues[this.config.excelFileColumnIndex] = n.shortFile;
    return rowValues;
  }

  // getColumnNumberByKey(key) {
  //   const columns = this.worksheet.getColumn(this.config.excelKeyColumnIndex);
  //   const index = _.findIndex(columns, (o) => {
  //     return o.text === key;
  //   });
  //   return index + 1;
  // }

  async exportToFile() {
    await this.workbook.xlsx.writeFile(this.config.excelPath, this.workbook);
  }
}

module.exports = new ExcelServiceFactory();
