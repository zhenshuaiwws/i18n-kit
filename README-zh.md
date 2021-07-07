# i18n-kit

帮助你处理 i18n 的工具，可以提取代码的翻译项，可以导入导出到 excel 文件，可以生成 json 翻译资源。

- `--dry-run` 演习运行，用来效验和发现错误，如下。
  - 翻译同 key 不同翻译
  - 翻译 key 父子冲突
- `--log` 打印日志，输出错误的详细记录。
- 工具会匹配代码格式为`i18nTranslate(langKey, langText, langTextOptions)`

```javascript
import React from 'react';
import i18n from 'i18next';

function i18nTranslate(key: string, text: string, option: {}) {
  // your code
  // ...
  return i18n.t(key);
}

export default function BatchSendPage() {
  return <div>{i18nTranslate('common.name', '我的名字{name}', { name: 'xiaohong' })}</div>;
}
```

# 支持的命令

## 命令`code2excel`

从代码中筛选出翻译项，然后输入到 excel 文件中（多次导出到 excel，新增项会追加到最后）。

### 参数

```
-cp, --code-folder-path <path>           代码目录路径
-ce, --code-excluded <path...>           要忽略的目录
-ep, --excel-path <path>                 excel 文件路径
-ew, --excel-worksheet-index <number>    excel 文件工作簿的序号（从 1 开始）
-ek, --excel-key-column-index <number>   翻译 key 对应的列序号（从 1 开始）
-el, --excel-lang-column-index <number>  翻译内容对应列序号（从 1 开始）
-ef, --excel-file-column-index <number>  翻译所在的文件路径对应的列序号（从 1 开始）
```

## 命令`code2json`

从代码中筛选出翻译项，然后输入到 json 文件中。

### 参数

```
-cp, --code-folder-path <path>  代码目录路径
-ce, --code-excluded <path...>  要忽略的目录
-jp, --json-path <path>         json 文件路径
```

## 命令`excel2json`

读取 Excel 中翻译好的内容，输出到 json 文件。

### 参数

```
-ep, --excel-path <path>                 excel 文件路径
-ew, --excel-worksheet-index <number>    excel 文件工作簿的序号（从 1 开始）
-ek, --excel-key-column-index <number>   翻译 key 对应的列序号（从 1 开始）
-el, --excel-lang-column-index <number>  翻译内容对应列序号（从 1 开始）
-jp, --json-path <path>                  json 文件路径
```

# 常见问题
