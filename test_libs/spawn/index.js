const cp = require("child_process");

module.exports = function (command) {
  cp.exec(command);
}