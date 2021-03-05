const fs = require("fs");
const path = require("path");

function getProcessArgv() {
  return process.argv.slice(2);
}

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

  console.log(`==>共计${allFilePaths.length}个文件`);
  return allFilePaths;
}

module.exports = {
  getProcessArgv,
  findDirFiles,
};
