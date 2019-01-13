#!/usr/bin/env node

var path = require("path");

var args = require("minimist")(process.argv.slice(2), {
    boolean: true
});


if (process.env['METAPHORJS_DEV'] || args.dev) {

    require("../../metaphorjs/dev/env.js");

    var getFileList = require("metaphorjs-build/src/func/getFileList.js");
    var Runner = require("../src/Runner.js");
    var docRoot = path.normalize(__dirname +"/../");

    getFileList(docRoot + "/src/renderer/**", "js")
        .forEach(function(f) {
            require(f);
        });

    getFileList(docRoot + "/src/hooks/**", "js")
        .forEach(function(f) {
            require(f);
        });

    Runner.run();
}
else {
    var Documentor = require("../dist/metaphorjs.documentor.npm.js");
    Documentor.Runner.run();
}

