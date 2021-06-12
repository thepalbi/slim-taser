const spawn = require("../index");

describe("Test suite", function () {
  it("Execute simple spawn command", function () {
    spawn("touch /tmp/perro");
  })
})