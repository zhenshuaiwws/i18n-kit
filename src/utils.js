const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const term = require('terminal-kit').terminal;

function findDirFiles(parentDirPath) {
  const allFilePaths = [];
  function loopDir(parent) {
    const items = fs.readdirSync(parent, { withFileTypes: true });

    items.forEach((n) => {
      if (n.isDirectory()) {
        loopDir(path.resolve(parent, n.name));
      } else if (n.isFile() && (n.name.includes('.ts') || n.name.includes('.js'))) {
        allFilePaths.push(path.resolve(parent, n.name));
      }
    });
  }
  loopDir(parentDirPath);
  return allFilePaths;
}

function writeLog(config, fileName, data) {
  term(config.log);
  term('\n');
  if (!config.log) {
    return;
  }

  let content;
  if (_.isArray(data)) {
    content = data
      .map((n) => {
        if (_.isObject(n)) {
          return JSON.stringify(n);
        }
        return n;
      })
      .join('\n');
  } else if (_.isObject(data)) {
    content = JSON.stringify(data, '', 2);
  } else {
    content = data;
  }
  fs.writeFileSync(path.resolve(process.cwd(), './', fileName), content, {
    encoding: 'utf-8'
  });
}

function commandLogError(content) {
  term.brightRed(content);
  term('\n');
}

function dryRunConfirm(args, callback) {
  function main() {
    term.clear();
    term.bgBlack.white.underline.bold('i18n-kit running...');
    term('\n');
    try {
      callback(() => {
        term.bgBlack.white.underline.bold('done.\n');
        process.exit();
      });
    } catch (error) {
      term(error);
      process.exit();
    }
  }

  if (!args.dryRun) {
    main();
  } else {
    term.bgBlack.white.underline.bold('current non dry run, continue? [y|n]\n');
    term.yesOrNo({ yes: ['y', 'ENTER'], no: ['n'] }, (error, result) => {
      if (result) {
        main();
      } else {
        process.exit();
      }
    });
  }
}

function formatArgs(args) {
  const result = _.cloneDeep(args);
  const needConvertToNumberKey = [
    'excelWorksheetIndex',
    'excelKeyColumnIndex',
    'excelLangColumnIndex',
    'excelFileColumnIndex'
  ];
  needConvertToNumberKey.forEach((n) => {
    if (result[n] === undefined) {
      return;
    }
    result[n] = Number(result[n]);

    // 异常参数处理
    if (result[n] < 1) {
      term(`=> Error: ${n} starts with 1 !`);
      process.exit(0);
    }

    // 兼容处理，工作表顺序从1开始
    if (n === 'excelWorksheetIndex') {
      result[n] -= 1;
    }
  });

  const needConvertToBooleanKey = ['logError'];
  needConvertToBooleanKey.forEach((n) => {
    result[n] = !(result[n] === 'false');
  });

  const processCwd = process.cwd();
  result.processCwd = processCwd;

  const needConvertToAbsolutePathKey = ['codeFolderPath', 'excelPath', 'jsonPath'];
  needConvertToAbsolutePathKey.forEach((n) => {
    if (result.codeFolderPath && !path.isAbsolute(result.codeFolderPath)) {
      result.codeFolderPath = path.resolve(processCwd, result.codeFolderPath);
    }
  });

  return result;
}

/**
 * 深度对比两个对象
 * @param  {Object} from
 * @param  {Object} to
 * @return {Array}
 */
function deepDiff(from, to) {
  const changes = {};
  const changeList = [];

  const buildPath = (path, obj, key) => (_.isUndefined(path) ? key : `${path}.${key}`);

  const walk = (fromObject, toObject, path) => {
    for (const key of _.keys(fromObject)) {
      const currentPath = buildPath(path, fromObject, key);
      if (!_.has(toObject, key)) {
        changes[currentPath] = { from: _.get(fromObject, key) };
        changeList.push([currentPath, { from: _.get(fromObject, key) }]);
      }
    }

    for (const [key, to] of _.entries(toObject)) {
      const currentPath = buildPath(path, toObject, key);
      if (!_.has(fromObject, key)) {
        changes[currentPath] = { to };
        changeList.push([currentPath, { to }]);
      } else {
        const from = _.get(fromObject, key);
        if (!_.isEqual(from, to)) {
          if (_.isObjectLike(to) && _.isObjectLike(from)) {
            walk(from, to, currentPath);
          } else {
            changes[currentPath] = { from, to };
            changeList.push([currentPath, { from, to }]);
          }
        }
      }
    }
  };

  walk(from, to);

  return changeList;
}

module.exports = {
  dryRunConfirm,
  commandLogError,
  formatArgs,
  findDirFiles,
  deepDiff,
  writeLog
};
