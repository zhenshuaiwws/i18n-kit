module.exports = {
  code: {
    customeCallExpression: (path, { file, shortFile }, callback, errorCallback) => {
      if (path.node.callee.name === 'i18nTranslate') {
        const args = path.node.arguments;
        let text;

        if (!args[0]) {
          errorCallback({
            text,
            file,
            shortFile,
            error: '翻译不能为空'
          });
          return;
        }
        if (args[0].type !== 'StringLiteral') {
          errorCallback({
            text,
            file,
            shortFile,
            error: '非法格式，必须为字符'
          });
          return;
        }

        text = args[1].value;

        callback({
          text,
          file,
          shortFile
        });
      }
    }
  },
  excel: { insetCheckMode: 'lang' }
};
