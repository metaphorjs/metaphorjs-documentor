var MetaphorJs = require("metaphorjs/src/MetaphorJs.js"),
    toJsonTemplate = require("metaphorjs-documentor/src/func/toJsonTemplate.js");

MetaphorJs.filter.presentAsJson = function(input, scope, withFolding) {
    return toJsonTemplate(input, {
        withFolding: withFolding || false
    });
};