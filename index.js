#!/usr/bin/env node
"use strict";

const { ArgumentParser } = require("argparse");
const { version } = require("./package.json");
const tasks = require("./src/main");


const args = combineProcessArgs();
args.processCwd = process.cwd();

console.log("==> k18n start!!!");
// console.table(args);

switch (args.command) {
  case "c2e":
    tasks.taskCodeToExcel(args).then();
    break;
}

function combineProcessArgs() {
  const parser = new ArgumentParser({
    description: "k18n cli",
  });
  parser.add_argument("command", { help: "c2j,j2e" });
  parser.add_argument("-v", { action: "version", version });
  parser.add_argument("-c", "--code", { help: "code dir" });
  parser.add_argument("-e", "--excel", {
    help: "excel file",
    nargs: 5,
    metavar: ["PATH", "WORKSHEET", "KEY", "LANG", "FILE"],
  });
  parser.add_argument("-j", "--json", { help: "i18n json file" });

  const result = parser.parse_args();
  result.excel = result.excel.map((n, i) => {
   return i > 0 ? Number(n) : n;
  });

  return result;
}
