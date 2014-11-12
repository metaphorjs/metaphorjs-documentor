
var globalCache = require("../../../var/globalCache.js"),
    sortArray = require("../../../../../metaphorjs/src/func/array/sortArray.js");


module.exports = globalCache.add("file.*.sortItems", function(item, cfg){

    var by = cfg ? cfg.by : null,
        dir = cfg ? (cfg.direction || null) : "asc",
        hook,
        key;

    for (key in item.items) {

        if (key != "param") {

            hook = item.isRoot() ? item.items[key][0].file.pget("sort-" + key) :
                                    item.file.pget("sort-" + key);

            if (hook) {
                hook(item.items[key], item, cfg);
            }
            else if (cfg) {
                item.items[key] = sortArray(item.items[key], by, dir);
            }

            item.items[key].forEach(function (item) {
                item.file.pcall("sortItems", item, cfg);
            });
        }
    }

});