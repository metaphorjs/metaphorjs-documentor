
var MetaphorJs = require("metaphorjs/src/MetaphorJs.js"),
    prismClass = require("metaphorjs-documentor/src/func/prismClass.js");

MetaphorJs.filter.prismClass = function(input, scope, where) {
    return prismClass(input);
};