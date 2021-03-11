var term = require("terminal-kit").terminal;

async function test() {
  var spinner = await term.spinner("unboxing-color");
  term(" Loading... ");
}

test();
