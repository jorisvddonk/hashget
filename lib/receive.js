const discoveryChannel = require("discovery-channel");
const debug = require("debug");
const log = debug("hashget:receive");
const log_debug = debug("hashget:receive:debug");
var utp = require("utp-native");
var net = require("net");
const fs = require("fs");
var argv = require("yargs").argv;
var useUTP = argv.utp || false;

module.exports = function receive(hex, securitycode) {
  log(`Receiving! (using ${useUTP ? "utp" : "tcp"})`);
  var swarm_name = "hashget:" + hex;
  var channel = discoveryChannel(require("dat-swarm-defaults")());
  var has_filename = false;
  var filename = "";
  var connections = [];
  channel.on("peer", function(key, peer) {
    var connection = (useUTP ? utp : net).connect(
      peer.port,
      peer.host
    );
    connections.push(connection);
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
    });
    connection.on("error", function(err) {
      log(`Connection error: ${err}`);
    });
    connection.on("connect", function() {
      connection.write(securitycode);
    });
  });
  channel.join(swarm_name);
};
