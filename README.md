# i18n-kit

Help you deal with I18N internationalization, extraction from code based on Babel, import and export excel, generate translation JSON file.

- dry-run option, run command without saving the changes to the file system\
- extract from code, matching paradigm `i18nTranslate(langKey, langText, langOptions)`

# All commands

## Code to excel command

c2e: Code to Excel, find translation items from the code and output them to excel file.

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

c2j: Code to JSON, find translation items from the code and output them to lang JSON file.

### Options

```
-cp, --code-folder-path <path>  Code folder path.
-ce, --code-excluded <path...>  Excluded code folder path.
-jp, --json-path <path>         Lang JSON file path.
```

## Excel to json command

e2j: Excel to JSON, read the translation items in excel file and output to JSON.

### Options

```
-ep, --excel-path <path>                 Translate excel file path.
-ew, --excel-worksheet-index <number>    Excel worksheet number, start with 1 .
-ek, --excel-key-column-index <number>   Translation key column number, start with 1 .
-el, --excel-lang-column-index <number>  Column number of translated text, start with 1 .
-jp, --json-path <path>                  Lang JSON file path.
```
