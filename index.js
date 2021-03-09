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
  .requiredOption("-cp, --code-path <path>", "Directory path of code.")
  .requiredOption("-ep, --excel-path <path>", "Translate excel file path.")
  .requiredOption(
    "-ew, --excel-worksheet-index <number>",
    "Excel worksheet number."
  )
  .requiredOption(
    "-ek, --excel-key-column-index <number>",
    "Translation key column number."
  )
  .requiredOption(
    "-el, --excel-lang-column-index <number>",
    "Column number of translated text."
  )
  .option(
    "-ef, --excel-file-column-index <number>",
    "File path of translation item."
  )
  .action((args) => {
    const config = formatArgs(args);
    if (config.dart) {
      main();
    } else {
      term.bgBlack.bold("当前非模拟运行(建议做好备份)，是否继续？ [Y|n]\n");
      term.yesOrNo(
        { yes: ["y", "ENTER"], no: ["n"] },
        function (error, result) {
          if (result) {
            main();
          } else {
            process.exit();
          }
        }
      );
    }

    function main() {
      term.clear();
      term.bold("░░░░░░ i18n-kit run!!!");
      term(`\n`);
      tasks.taskCodeToExcel(config).then(() => {
        term.bold("░░░░░░ done.\n");
      });
    }
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

    // 异常参数处理
    if (args[n] < 1) {
      term("=> Error: ${n} starts with 1 !");
      process.exit(0);
    }

    // 兼容处理，工作表顺序从1开始
    if (n === "excelWorksheetIndex") {
      args[n]--;
    }
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
