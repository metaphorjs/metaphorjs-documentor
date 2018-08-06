var nsAdd = require("metaphorjs-namespace/src/func/nsAdd.js"),
    toJsonTemplate = require("metaphorjs-documentor/src/func/toJsonTemplate.js");

nsAdd("filter.presentAsJson", function(input, scope, prop) {
    return toJsonTemplate(input);
});