#!/usr/bin/env node

const path = require("path");
const { Command, Option, requiredOption } = require("commander");
const term = require("terminal-kit").terminal;
const { version } = require("./package.json");
const tasks = require("./src/main");
const utils = require("./src/utils");

const program = new Command();
program.version(version);

const dryRunOption = new Option(
  "--dry-run",
  "Run command without saving the changes to the file system"
);

const codeOptionMap = {
  codeFolderPath: new Option(
    "-cp, --code-folder-path <path>",
    "Code folder path.",
    true
  ),
  codeExcluded: new Option(
    "-ce, --code-excluded <path...>",
    "Excluded code folder path."
  ),
};

const excelOptionMap = {
  excelPath: new Option(
    "-ep, --excel-path <path>",
    "Translate excel file path.",
    true
  ),
  excelWorksheetIndex: new Option(
    "-ew, --excel-worksheet-index <number>",
    "Excel worksheet number.",
    true
  ),
  excelKeyColumnIndex: new Option(
    "-ek, --excel-key-column-index <number>",
    "Translation key column number.",
    true
  ),
  excelLangColumnIndex: new Option(
    "-el, --excel-lang-column-index <number>",
    "Column number of translated text.",
    true
  ),
  excelFileColumnIndex: new Option(
    "-ef, --excel-file-column-index <number>",
    "File path of translation item."
  ),
};

const jsonOptionMap = {
  jsonPath: new Option("-jp, --json-path <path>", "Lang JSON file path.", true),
};

program
  .command("c2e")
  .description(
    "Code to Excel, find translation items from the code and output them to excel file."
  )
  .addOption(dryRunOption)
  .addOption(codeOptionMap.codeFolderPath)
  .addOption(codeOptionMap.codeExcluded)
  .addOption(excelOptionMap.excelPath)
  .addOption(excelOptionMap.excelWorksheetIndex)
  .addOption(excelOptionMap.excelKeyColumnIndex)
  .addOption(excelOptionMap.excelLangColumnIndex)
  .addOption(excelOptionMap.excelFileColumnIndex)
  .action((args) => {
    utils.commandRunBefore(args, (cb) => {
      tasks.taskCodeToExcel(utils.formatArgs(args)).then(() => {
        cb();
      });
    });
  });

program
  .command("c2j")
  .description(
    "Code to JSON, find translation items from the code and output them to lang JSON file."
  )
  .addOption(dryRunOption)
  .addOption(codeOptionMap.codeFolderPath)
  .addOption(codeOptionMap.codeExcluded)
  .addOption(jsonOptionMap.jsonPath)
  .action((args) => {
    utils.commandRunBefore(args, (cb) => {
      tasks.taskCodeToJson(utils.formatArgs(args)).then(() => {
        cb();
      });
    });
  });

program
  .command("e2j")
  .description(
    "Excel to JSON, read the translation items in excel file and output to JSON."
  )
  .addOption(dryRunOption)
  .addOption(excelOptionMap.excelPath)
  .addOption(excelOptionMap.excelWorksheetIndex)
  .addOption(excelOptionMap.excelKeyColumnIndex)
  .addOption(excelOptionMap.excelLangColumnIndex)
  .addOption(jsonOptionMap.jsonPath)
  .action((args) => {
    utils.commandRunBefore(args, (cb) => {
      tasks.taskExcelToJson(utils.formatArgs(args)).then(() => {
        cb();
      });
    });
  });

program.parse(process.argv);
