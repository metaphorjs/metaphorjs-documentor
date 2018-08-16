
var fs = require("fs"),
    path = require("path"),
    File = require("../File.js");

module.exports = File.$extend({

    $class: "file.Root",

    $init: function() {
        // skip all init
    }
});