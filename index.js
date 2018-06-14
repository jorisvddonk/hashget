#!/usr/bin/env node

var argv = require("yargs").argv;
const crypto = require("crypto");
const fs = require("fs");
const hash = crypto.createHash("sha256");
const debug = require("debug");
const path = require("path");

const serve = require('./lib/serve');
const receive = require('./lib/receive');

debug.enable("hashget");
if (argv.debug) {
  debug.enable("hashget,hashget:*");
}

if (argv.serve) {
  var filepath = argv._[0];
  var filename = path.basename(filepath);
  const input = fs.createReadStream(filepath);
  input.pipe(hash);
  hash.on("readable", () => {
    const data = hash.read();
    if (data) {
      var hex = data.toString("hex");
      serve(hex, filepath, filename);
    }
  });
} else {
  receive(argv._[0], argv._[1]);
}