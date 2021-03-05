"use strict";

const fs = require("fs");
const path = require("path");
const _ = require("lodash");
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
  }

  async init(config) {
    this.config = config;

    const worksheets = await this.workbook.xlsx.readFile(config.path);
    this.worksheet = worksheets.worksheets[config.worksheetNumber];
  }

  getLastRowNumber() {
    let last = 0;
    this.worksheet.getColumn(this.config.pathColumnKey).eachCell((n, i) => {
      this.pathColumns.push(n.text);
      last++;
    });
    this.lastRowNumber = last;
    return last;
  }

  insetRow(translations) {
    translations.forEach((n, i) => {
      const findIndex = this.pathColumns.indexOf(n.rawKey);
      if (findIndex === -1) {
        const rowValues = [];
        rowValues[this.config.pathColumnKey] = n.rawKey;
        rowValues[this.config.langColumnKey] = n.text;
        rowValues[this.config.fileColumnKey] = n.shortFile;
        this.worksheet.insertRow(this.lastRowNumber + i + 1, rowValues);

        this.insertCount++;
      } else {
        const row = this.worksheet.getRow(findIndex + 1);
        const langColumn = row.getCell(this.config.langColumnKey);
        if (langColumn.value === n.text) {
          this.ignoreCount++;
          return;
        } else {
          langColumn.value = n.text;
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
    });
    console.log(
      `==> Excel: insert ${this.insertCount} update ${this.updateCount} ignore ${this.ignoreCount}`
    );
  }

  async outToFile() {
    await this.workbook.xlsx.writeFile(this.config.path, this.workbook);
  }
}

module.exports = new ExcelServiceFactory();

// const rowValues = [];
// rowValues[5] = "xxx";
// rowValues[6] = "哈哈哈";
//   ws.insertRow(2, rowValues);
