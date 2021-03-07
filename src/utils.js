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

module.exports = {
  commandLogError,
  findDirFiles,
  writeDebugLog,
};
