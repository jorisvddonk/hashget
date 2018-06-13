#!/usr/bin/env node

var argv = require("yargs").argv;
const crypto = require("crypto");
const swarm = require("discovery-swarm");
const fs = require("fs");
const hash = crypto.createHash("sha256");
const debug = require("debug");
const log = debug("hashget");
const log_debug = debug("hashget:debug");
const path = require("path");
debug.enable("hashget");

if (argv.debug) {
  debug.enable("hashget,hashget:debug");
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
      console.log("hashget " + hex);
      log("Serving!");
      serve(hex, fs.createReadStream(filepath), filename);
    }
  });
} else {
  log("Listening!");
  read(argv._[0]);
}

var sw = swarm(require('dat-swarm-defaults')());

function serve(hex, readstream, filename) {
  sw.listen();
  var swarm_name = "hashget:" + hex;
  sw.join(swarm_name);

  sw.on("connection", function(connection, info) {
    readstream.on("end", function() {
      log("Done!");
    });
    connection.on("end", function() {
      sw.close();
    });
    log_debug("Connected to peer!", info);
    connection.write(filename);
    connection.write("\n");
    readstream.pipe(connection);
  });
}

function read(hex) {
  sw.listen();
  var swarm_name = "hashget:" + hex;
  sw.join(swarm_name);

  var has_filename = false;
  var filename = "";
  sw.on("connection", function(connection, info) {
    log_debug("Connected to peer!", info);
    connection.on("data", function(dat) {
      log_debug("data:" + dat.length);
      var resbuf = null;
      if (!has_filename) {
        for (var i = 0; i < dat.length; i++) {
          if (dat[i] !== 10) {
            filename += String.fromCharCode(dat[i]);
          } else {
            has_filename = true;
            log_debug(`>>${filename}<<`);
            resbuf = dat.slice(i + 1);
            break;
          }
        }
      } else {
        log_debug("BUFFER:" + dat.length);
        fs.appendFileSync(filename, dat);
      }
      if (resbuf) {
        log_debug("INITBUFFER:" + resbuf.length);
        fs.writeFileSync(filename, resbuf);
      }
    });
    connection.on("end", function() {
      log(`File ${filename} written!`);
      //sw.leave(swarm_name)
    });
  });
}
