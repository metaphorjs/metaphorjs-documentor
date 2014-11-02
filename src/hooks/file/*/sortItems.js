
var globalCache = require("../../../var/globalCache.js"),
    sortArray = require("../../../../../metaphorjs/src/func/array/sortArray.js");


module.exports = globalCache.add("file.*.sortItems", function(item, cfg){

    if (!cfg) {
        return;
    }

    var by = cfg.by,
        dir = cfg.direction || "asc",
        key;

    for (key in item.items) {

        if (key != "param") {

            item.items[key] = sortArray(item.items[key], by, dir);

            item.items[key].forEach(function (item) {
                item.file.pcall("sortItems", item, cfg);
            });
        }
    }

});