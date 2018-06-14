#!/usr/bin/env node

var argv = require("yargs").argv;
const crypto = require("crypto");
const discoveryServer = require("discovery-server");
const discoveryChannel = require("discovery-channel");
const net = require('net');
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
      serve(hex, filepath, filename);
    }
  });
} else {
  log("Listening!");
  read(argv._[0]);
}


function serve(hex, filepath, filename) {
  var swarm_name = "hashget:" + hex;
  log("Serving!");
  var server = discoveryServer(require('dat-swarm-defaults')(), function(connection) {
    log_debug("Connected to peer!");
    var readstream = fs.createReadStream(filepath);
    readstream.on("end", function() {
      log("Done!");
      connection.end();
    });
    connection.write(filename);
    connection.write("\n");
    readstream.pipe(connection);
    connection.on('close', function() {
      process.exit();
    })
  });
  server.listen(swarm_name, function(){
    log("Now listening!");
  });
}

function read(hex) {
  var swarm_name = "hashget:" + hex;
  var channel = discoveryChannel(require('dat-swarm-defaults')());
  var has_filename = false;
  var filename = "";
  channel.on('peer', function(key, peer) {
    var connection = net.connect(peer.port, peer.host);
    log_debug("Connecting to peer...", peer);
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
  channel.join(swarm_name);

}
