const discoveryServer = require("discovery-server");
const debug = require("debug");
const log = debug("hashget:serve");
const log_debug = debug("hashget:serve:debug");
const fs = require("fs");

module.exports = function serve(hex, filepath, filename) {
  log("Serving!");
  var swarm_name = "hashget:" + hex;
  var opts = require("dat-swarm-defaults")();
  opts.utp = true;
  var server = discoveryServer(opts, function(
    connection, details
  ) {
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
  server.listen(swarm_name, function() {
    log("Now listening!");
  });
};
