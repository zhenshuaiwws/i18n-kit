#!/usr/bin/env node

const path = require("path");
const { Command, Option } = require("commander");
const term = require("terminal-kit").terminal;
const { version } = require("./package.json");
const tasks = require("./src/main");

const program = new Command();
program.version(version);

const dartOption = new Option("-d, --dart");

program
  .command("c2e")
  .addOption(dartOption)
  .requiredOption("-cp, --code-path <path>", "")
  .requiredOption("-ep, --excel-path <path>", "")
  .requiredOption("-ew, --excel-worksheet-index <number>", "")
  .requiredOption("-ek, --excel-key-column-index <number>", "")
  .option("-el, --excel-lang-column-index <number>", "")
  .option("-ef, --excel-file-column-index <number>", "")
  .action((args) => {
    term.bold("░░░░░░ i18n-kit run!!!");
    term(`\n`);
    tasks.taskCodeToExcel(formatArgs(args)).then(() => {
      term.bold("░░░░░░ done.\n");
    });
  });
program.parse(process.argv);

function formatArgs(args) {
  const needConvertToNumberKey = [
    "excelWorksheetIndex",
    "excelKeyColumnIndex",
    "excelLangColumnIndex",
    "excelFileColumnIndex",
  ];
  needConvertToNumberKey.forEach((n) => {
    if (args[n] === undefined) {
      return;
    }
    args[n] = Number(args[n]);
  });

  const needConvertToBooleanKey = ["logError"];
  needConvertToBooleanKey.forEach((n) => {
    args[n] = !(args[n] === "false");
  });

  const processCwd = process.cwd();
  args.processCwd = processCwd;

  if (!path.isAbsolute(args.codePath)) {
    args.codePath = path.resolve(processCwd, args.codePath);
  }

  return args;
}
