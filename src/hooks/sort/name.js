
var globalCache = require("../../var/globalCache.js"),
sortArray = require("metaphorjs/src/func/array/sortArray.js");

module.exports = globalCache.add("sort.name", function(item, cfg){

    items.sort(function(a, b) {
        if (a.getSortName() == b.getSortName()) {
            return 0;
        }
        return a.getSortName() < b.getSortName() ? -1 : 1;
    });

    return items;
});