#!/usr/bin/env node
"use strict";

const { ArgumentParser } = require("argparse");
const { version } = require("./package.json");

const parser = new ArgumentParser({
  description: "k18n cli",
});

parser.add_argument("command", { help: "c2j,j2e" });
parser.add_argument("-v", { action: "version", version });
parser.add_argument("-c", "--code", { help: "code dir" });
parser.add_argument("-e", "--excel", {
  help: "excel file",
  nargs: 3,
  metavar: ["PATH", "WORKSHEET", "COLUMN"],
});
parser.add_argument("-j", "--json", { help: "i18n json file" });

const processArgv = parser.parse_args();
console.dir(processArgv);

// k18n c2j -e ./ B2
