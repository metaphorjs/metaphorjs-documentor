#!/usr/bin/env node

var args = require("minimist")(process.argv.slice(2), {
    boolean: true
});


if (process.env['METAPHORJS_DEV'] || args.dev) {

    require("../../metaphorjs/dev/mockery.js");

    var getFileList = require("metaphorjs/src/func/fs/getFileList.js");
    var Runner = require("../src/Runner.js");

    getFileList(process.env['METAPHORJS_PATH'] + 
                "/metaphorjs-documentor/src/renderer/**", "js")
                .forEach(function(f) {
                    require(f);
                });
    getFileList(process.env['METAPHORJS_PATH'] + 
                "/metaphorjs-documentor/src/hooks/**", "js")
                .forEach(function(f) {
                    require(f);
                });

    Runner.run();
}
else {
    var Documentor = require("../dist/metaphorjs.documentor.npm.js");
    Documentor.Runner.run();
}

