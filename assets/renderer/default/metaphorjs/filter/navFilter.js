var nsAdd = require("metaphorjs-namespace/src/func/nsAdd.js"),
    isArray = require("metaphorjs/src/func/isArray.js");

nsAdd("filter.navFilter", function(input, scope, where) {
    if (isArray(input)) {
        return input.filter(function(nav){
            return nav.value.where == where;
        });
    }
    return [];
});