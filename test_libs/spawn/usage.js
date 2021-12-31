const spawn = require("./index");

// spawn.spawnWithString("touch /tmp/perro");
spawn.spawnWithWrappedString({command: "touch /tmp/perro"});
