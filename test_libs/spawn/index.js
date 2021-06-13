const cp = require("child_process");

module.exports = function (command) {
  console.log("Type of command: %s", typeof command);
  cp.exec(command);
}