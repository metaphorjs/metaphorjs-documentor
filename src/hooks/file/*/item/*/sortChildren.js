var globalCache = require("../../../../../var/globalCache.js"),
    isArray = require("metaphorjs/src/func/isArray.js");

module.exports = globalCache.add("file.*.item.*.sortChildren", 
    function(item, cfg) {

        var fn;

        fn = item.pget("sortChildTypes");
        item.items = fn.call(null, item.items, cfg);

        for (childType in item.items) {
            fn = item.items[childType][0].pget("sort");
            item.items = fn.call(null, item.items, cfg, item.doc);
        }
    });

