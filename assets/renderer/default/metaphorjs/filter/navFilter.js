var MetaphorJs = require("metaphorjs/src/MetaphorJs.js"),
    isArray = require("metaphorjs/src/func/isArray.js");

MetaphorJs.filter.navFilter = function(input, scope, where) {
    if (isArray(input)) {
        return input.filter(function(nav){
            return nav.value.where == where;
        });
    }
    return [];
};