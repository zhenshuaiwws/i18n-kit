const _ = require('lodash');
const term = require('terminal-kit').terminal;
const ExcelJS = require('exceljs');
const utils = require('./utils');

class ExcelServiceFactory {
  constructor() {
    this.workbook = new ExcelJS.Workbook();

    this.worksheet = null;

    this.lastRowNumber = null;

    this.insertCount = 0;

    this.updateCount = 0;

    this.ignoreCount = 0;

    this.translations = [];

    this.translationObject = {};

    this.errorTranslations = [];
  }

  async init(config) {
    term('=> Excel...\n');

    this.config = config;

    const worksheets = await this.workbook.xlsx.readFile(config.excelPath);
    this.worksheet = worksheets.worksheets[config.excelWorksheetIndex];

    this.readFromExcel();
  }

  /**
   * 读取 Excel 中的数据
   */
  readFromExcel() {
    term('=> Excel: read file\n');
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
      this.translations.push(item);
    });
  }

  execute(translations) {
    translations.forEach((n) => {
      const findIndex = _.findIndex(this.translations, {
        rawKey: n.rawKey
      });
      if (findIndex === -1) {
        this.insetRow(n);
      } else {
        // this.updateRow(n, findIndex + 1);
      }
    });
    term.brightYellow.bold(
      `=> Excel: insert ${this.insertCount} update ${this.updateCount} ignore ${this.ignoreCount}`
    );
    term('\n');
  }

  /**
   * 插入数据到 Excel 中
   */
  insetRow(translation) {
    this.worksheet.insertRow(this.lastRowNumber, this.combineRow(translation));
    this.lastRowNumber += 1;
    this.insertCount += 1;
  }

  /**
   * 更新数据到 Excel 中
   */
  updateRow(translation, rowNumber) {
    const row = this.worksheet.getRow(rowNumber);
    const langColumn = row.getCell(this.config.excelLangColumnIndex);
    if (langColumn.value === translation.text) {
      this.ignoreCount += 1;
      return;
    }

    langColumn.value = translation.text;
    langColumn.fill = {
      type: 'gradient',
      gradient: 'angle',
      degree: 0,
      stops: [
        { position: 0, color: { argb: 'FF1493' } },
        { position: 0.5, color: { argb: 'FF1493' } },
        { position: 1, color: { argb: 'FF1493' } }
      ]
    };

    this.updateCount += 1;
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

  combineToTranslationObject() {
    this.translations = this.translations.map((item) => {
      const n = item;
      const find = _.get(this.translationObject, n.rawKey);
      if (_.isObject(find)) {
        n.error = 'key冲突(类似的key会导致覆盖丢失其他翻译)';
        this.errorTranslations.push(n);
        utils.commandLogError(
          this.config.dryRun,
          `=> Excel traverse error: ${n.rawKey} ${n.error}`
        );
      } else if (find && find !== n.text) {
        n.error = '同key不同翻译';
        this.errorTranslations.push(n);
        utils.commandLogError(
          this.config.dryRun,
          `=> Excel traverse error: ${n.rawKey} ${n.error}`
        );
      } else {
        _.set(this.translationObject, n.rawKey, n.text);
      }
      return n;
    });
  }

  async exportToFile() {
    await this.workbook.xlsx.writeFile(this.config.excelPath, this.workbook);
  }
}

module.exports = new ExcelServiceFactory();
