var nopt = require("nopt"),
  Stream = require("stream").Stream,
  path = require("path"),
  knownOpts = {
    foo: [String, null],
    bar: [Stream, Number],
    baz: path,
    bloo: ["big", "medium", "small"],
    flag: Boolean,
    pick: Boolean,
    many1: [String, Array],
    many2: [path, Array],
  },
  shortHands = {
    foofoo: ["--foo", "Mr. Foo"],
    b7: ["--bar", "7"],
    m: ["--bloo", "medium"],
    p: ["--pick"],
    f: ["--flag"],
  },
  // everything is optional.
  // knownOpts and shorthands default to {}
  // arg list defaults to process.argv
  // slice defaults to 2
  parsed = nopt(knownOpts, shortHands, process.argv, 2);

console.log(parsed);
