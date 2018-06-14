const discoveryServer = require("discovery-server");
const debug = require("debug");
const log = debug("hashget:serve");
const log_debug = debug("hashget:serve:debug");
const fs = require("fs");
const getPort = require("get-port");
var natUpnp = require("nat-upnp");
var upnpclient = natUpnp.createClient();
var argv = require("yargs").argv;

var punchPortUPNP = argv.upnp || false;
var useUTP = argv.utp || false;

module.exports = function serve(hex, filepath, filename) {
  log(`Serving! (with utp ${useUTP ? "enabled" : "disabled"})`);
  getPort().then(function(port) {
    log("Open port:", port);
    if (punchPortUPNP) {
      log("Punching port via UPNP...");
      upnpclient.portMapping(
        {
          public: port,
          private: port,
          ttl: 999999,
          protocol: "UDP"
        },
        function(err) {
          if (!err) {
            log("Punched port UDP!");
          } else {
            log("Could not punch UDP port via UPNP:", err);
          }
        }
      );
      upnpclient.portMapping(
        {
          public: port,
          private: port,
          ttl: 999999,
          protocol: "TCP"
        },
        function(err) {
          if (!err) {
            log("Punched port TCP!");
          } else {
            log("Could not punch TCP port via UPNP:", err);
          }
        }
      );
    }
    serve_(hex, port, filepath, filename);
  });
};

function serve_(hex, port, filepath, filename) {
  var swarm_name = "hashget:" + hex;
  var opts = require("dat-swarm-defaults")();
  opts.utp = useUTP;
  var server = discoveryServer(opts, function(connection, details) {
    log_debug(`Connected to peer via ${details.type}!`);
    var readstream = fs.createReadStream(filepath);
    readstream.on("end", function() {
      log("Done!");
      connection.end();
    });
    connection.write(filename);
    connection.write("\n");
    readstream.pipe(connection);
    connection.on("close", function() {
      process.exit();
    });
  });
  server.listen(swarm_name, port, function() {
    log("Now listening!");
    log(arguments);
  });
}
