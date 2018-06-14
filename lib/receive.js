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
  var connections = [];

  channel.on("peer", function(key, peer) {
    var has_securitycode = false;
    var has_filename = false;
    var received_filename = "";
    var received_securitycode = "";
    var first = true;
    var connection = (useUTP ? utp : net).connect(
      peer.port,
      peer.host
    );
    connections.push(connection);
    log_debug("Connecting to peer...", peer);
    connection.on("data", function(dat) {
      log_debug("data:" + dat.length);
      if (!has_securitycode) {
        for (var i = 0; i < dat.length; i++) {
          if (dat[i] !== 10) {
            received_securitycode += String.fromCharCode(dat[i]);
          } else {
            has_securitycode = true;
            log_debug(`received security code: >>${received_securitycode}<<`);
            if (received_securitycode !== securitycode) {
              log("INVALID SECURITY CODE! Closing connection...");
              connection.end();
              return;
            }
            log("VALID SECURITY CODE! Continuing...");
            dat = dat.slice(i + 1);
            break;
          }
        }
      }

      if (has_securitycode) {
        if (!has_filename) {
          for (var i = 0; i < dat.length; i++) {
            if (dat[i] !== 10) {
              received_filename += String.fromCharCode(dat[i]);
            } else {
              has_filename = true;
              log_debug(`received filename: >>${received_filename}<<`);
              dat = dat.slice(i + 1);
              break;
            }
          }
        }
      }

      if (has_securitycode && has_filename) {
        if (first) {
          log_debug("FIRSTBUFFER:" + dat.length);
          fs.writeFileSync(received_filename, dat);
          first = false;
        } else {
          log_debug("BUFFER:" + dat.length);
          fs.appendFileSync(received_filename, dat);
        }
      }
    });
    connection.on("end", function() {
      log(`File ${received_filename} written!`);
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
