const cp = require("child_process");

module.exports.spawnWithString = function (command) {
  console.log("Type of command: %s", typeof command);
  cp.exec(command);
}

module.exports.spawnWithWrappedString = function (wrappedCommand) {
  console.log("Type of command: %s", typeof wrappedCommand);
  cp.exec(wrappedCommand.command);
}
