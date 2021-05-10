# i18n-kit

Help you deal with I18N internationalization, extraction from code based on Babel, import and export excel, generate translation JSON file.

- dry-run option, run command without saving the changes to the file system.
- Error message
  - Different text from key.
  - Father son conflict.
- Extract from code, matching paradigm `i18nTranslate(langKey, langText, langTextOptions)`

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

# All commands

## Code to excel command

code2excel: Code to Excel, find translation items from the code and output them to excel file.

### Options

```
-cp, --code-folder-path <path>           Code folder path.
-ce, --code-excluded <path...>           Excluded code folder path.
-ep, --excel-path <path>                 Translate excel file path.
-ew, --excel-worksheet-index <number>    Excel worksheet number, start with 1 .
-ek, --excel-key-column-index <number>   Translation key column number, start with 1 .
-el, --excel-lang-column-index <number>  Column number of translated text, start with 1 .
-ef, --excel-file-column-index <number>  File path of translation item, start with 1 .
```

## Code to json command

code2json: Code to JSON, find translation items from the code and output them to lang JSON file.

### Options

```
-cp, --code-folder-path <path>  Code folder path.
-ce, --code-excluded <path...>  Excluded code folder path.
-jp, --json-path <path>         Lang JSON file path.
```

## Excel to json command

excel2json: Excel to JSON, read the translation items in excel file and output to JSON.

### Options

```
-ep, --excel-path <path>                 Translate excel file path.
-ew, --excel-worksheet-index <number>    Excel worksheet number, start with 1 .
-ek, --excel-key-column-index <number>   Translation key column number, start with 1 .
-el, --excel-lang-column-index <number>  Column number of translated text, start with 1 .
-jp, --json-path <path>                  Lang JSON file path.
```
