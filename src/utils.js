const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const term = require("terminal-kit").terminal;

function findDirFiles(parentDirPath) {
  const allFilePaths = [];
  function loopDir(parentDirPath) {
    const items = fs.readdirSync(parentDirPath, { withFileTypes: true });

    items.forEach((n) => {
      if (n.isDirectory()) {
        loopDir(path.resolve(parentDirPath, n.name));
      } else if (
        n.isFile() &&
        (n.name.includes(".ts") || n.name.includes(".js"))
      ) {
        allFilePaths.push(path.resolve(parentDirPath, n.name));
      }
    });
  }
  loopDir(parentDirPath);
  return allFilePaths;
}

function writeDebugLog(fileName, data) {
  let content;

  if (_.isArray(data)) {
    content = data
      .map((n) => {
        if (_.isObject(n)) {
          return JSON.stringify(n);
        } else {
          return n;
        }
      })
      .join("\n");
  } else if (_.isObject(data)) {
    content = JSON.stringify(data, "", 2);
  } else {
    content = data;
  }

  fs.writeFileSync(path.resolve(process.cwd(), "./log/", fileName), content, {
    encoding: "utf-8",
  });
}

function commandLogError(isShow, content) {
  if (!isShow) {
    return;
  }
  term.brightRed(content);
  term("\n");
}

function commandRunBefore(args, callback) {
  if (args.dryRun) {
    main();
  } else {
    term.bgBlack.white.underline.bold(
      "当前非模拟运行(建议做好备份)，是否继续？ [Y|n]\n"
    );
    term.yesOrNo({ yes: ["y", "ENTER"], no: ["n"] }, function (error, result) {
      if (result) {
        main();
      } else {
        process.exit();
      }
    });
  }

  function main() {
    term.clear();
    term.bgBlack.white.underline.bold("i18n-kit run!!!");
    term(`\n`);
    callback(() => {
      term.bgBlack.white.underline.bold("done.\n");
    });
  }
}

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

  if (!path.isAbsolute(args.codeFolderPath)) {
    args.codeFolderPath = path.resolve(processCwd, args.codeFolderPath);
  }

  return args;
}

module.exports = {
  commandRunBefore,
  commandLogError,
  formatArgs,
  findDirFiles,
  writeDebugLog,
};
