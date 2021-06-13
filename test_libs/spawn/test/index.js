const spawn = require("../index");

describe("Test suite", function () {
  it("Execute simple spawn command", function () {
    spawn.spawnWithString("touch /tmp/perro");
  });

  it("Execute simple spawn command - wrapped", function () {
    spawn.spawnWithWrappedString({command: "touch /tmp/perro"});
  })
})