const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const ExcelJS = require("exceljs");

const workbook = new ExcelJS.Workbook();
workbook.xlsx.readFile(path.resolve(__dirname, "test.xlsx")).then((wb) => {
  const ws = wb.worksheets[0];

  ws.getCell("B2").fill = {
    type: "gradient",
    gradient: "angle",
    degree: 0,
    stops: [
      { position: 0, color: { argb: "FF1493" } },
      { position: 0.5, color: { argb: "FF1493" } },
      { position: 1, color: { argb: "FF1493" } },
    ],
  };

  workbook.xlsx.writeFile(path.resolve(__dirname, "test.xlsx"), wb);
});
