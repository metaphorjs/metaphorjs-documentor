#!/usr/bin/env node --expose-gc

var args = require("minimist")(process.argv.slice(2), {
    boolean: true
});

if (args.dev) {
    require("../../metaphorjs/dev/mockery.js");
}

var Documentor = require("../dist/metaphorjs.documentor.npm.js");

Documentor.Runner.run();