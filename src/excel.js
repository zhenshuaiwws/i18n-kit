"use strict";

const fs = require("fs");
const path = require("path");
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
  }

  async init(config) {
    this.config = config;

    const worksheets = await this.workbook.xlsx.readFile(config.excelPath);
    this.worksheet = worksheets.worksheets[config.excelWorksheetIndex];
  }

  getLastRowNumber() {
    let last = 0;
    this.worksheet
      .getColumn(this.config.excelKeyColumnIndex)
      .eachCell((n, i) => {
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
        rowValues[this.config.excelKeyColumnIndex] = n.rawKey;
        rowValues[this.config.excelLangColumnIndex] = n.text;
        rowValues[this.config.excelFileColumnIndex] = n.shortFile;
        this.worksheet.insertRow(this.lastRowNumber + i + 1, rowValues);

        this.insertCount++;
      } else {
        const row = this.worksheet.getRow(findIndex + 1);
        const langColumn = row.getCell(this.config.excelLangColumnIndex);
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
    term.brightYellow.bold(
      `=> Excel: insert ${this.insertCount} update ${this.updateCount} ignore ${this.ignoreCount}`
    );
    term("\n");
  }

  async outToFile() {
    await this.workbook.xlsx.writeFile(this.config.excelPath, this.workbook);
  }
}

module.exports = new ExcelServiceFactory();
