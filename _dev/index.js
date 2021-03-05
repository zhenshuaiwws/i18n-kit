"use strict";

const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const ExcelJS = require("exceljs");

const utils = require("./utils");

const args = utils.getProcessArgv();
console.log(`==>args:`, args);

const files = utils.findDirFiles(path.resolve(__dirname, args[1]));
writeDebugLog("1filesPath", files.join("\n"));

let translationRawItems = [];
const translationItems = [];

files.forEach((filePath) => {
  const fileText = fs.readFileSync(filePath, {
    encoding: "utf-8",
  });

  // 在一个文件中，查找匹配 i18nTranslate
  const items =
    fileText.replace(/\n/g, "").match(/i18nTranslate\(('|").*?\}?\)/g) || [];
  // console.log(`==>${filePath}找到${translateItems.length}个翻译项`);
  translationRawItems = translationRawItems.concat(items);

  items.forEach((current) => {
    const n = current.match(/('|"|'\\|"\\)\S+('|"|'\\|"\\)/g);
    if (n && n.length === 2) {
      const key = n[0].replace(/'|"|'\\|"\\/g, "");
      const text = n[1].replace(/'|"|'\\|"\\/g, "");
      translationItems.push([key, text]);
    } else {
      console.log("==>Error:", current);
    }
  });
});
console.log(`==>共计匹配出翻译项${translationRawItems.length}个`);
writeDebugLog("2translationRawItems", translationRawItems.join("\n"));
writeDebugLog("3translationItems", translationItems.join("\n"));

function formatToTranslateObject(items) {
  const result = {};

  items.forEach((n) => {
    _.set(result, n[0], n[1]);
  });

  return result;
}

const translationObject = formatToTranslateObject(translationItems);
outLangI18nJsonFile("zh", translationObject);

outLangExcel();

function outLangI18nJsonFile(lang, payload) {
  fs.writeFileSync(
    path.resolve(__dirname, "./out/" + lang + ".json"),
    JSON.stringify(payload, null, 2),
    { encoding: "utf-8" }
  );
}

function outLangExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.xlsx.readFile(path.resolve(__dirname, "test.xlsx")).then((wb) => {
    const ws = wb.worksheets[1];

    translationItems.forEach((n, i) => {
      const rowValues = [];
      rowValues[5] = n[0];
      rowValues[6] = n[1];
      ws.insertRow(2 + i, rowValues);
    });

    workbook.xlsx.writeFile(path.resolve(__dirname, "test-modify.xlsx"), wb);
  });
}

function writeDebugLog(fileName, data) {
  fs.writeFileSync(path.resolve(__dirname, "./out/", fileName), data, {
    encoding: "utf-8",
  });
}

// ============================

// console.table(fileText.match(/(i18nTranslate\(".*)\)/gi));

// const text1 = fileText.replace(/(i18nTranslate\(".*)\)/gi,'').replace(/\n/g, "")

// console.table(fileText.match(/(i18nTranslate\(".*)\)/gi));
// const result = ast.StylesheetParser(fileText)
// // const result = babel.transform(fileText, {
// //     presets: ["@babel/preset-env"],
// //   });
// console.log(result);

// const files = fs.readdirSync(codeDirPath, {
//   encoding: "utf-8",
//   withFileTypes: true,
// });
// console.table(files);
// console.log(files[0].isDirectory());

/**
 * 读取参数
 * 读取目录文件
 * 遍历查找
 * 输出json
 * 输出excel
 * excel输出json
 *
 */
// TODO: 带括号 i18nTranslate('job.edit.salaryMax', '最高月薪(k)')
// TODO: key错误 job.edit.interviewers 简历初筛面试官 job.edit.interviewers.tips 能直接参与本职位的简历初筛
