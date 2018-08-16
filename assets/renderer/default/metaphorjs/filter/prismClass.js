
var nsAdd = require("metaphorjs-namespace/src/func/nsAdd.js"),
    prismClass = require("metaphorjs-documentor/src/func/prismClass.js");

nsAdd("filter.prismClass", function(input, scope, where) {
    return prismClass(input);
});