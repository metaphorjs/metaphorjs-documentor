var globalCache = require("../../../../../var/globalCache.js"),
    isArray = require("metaphorjs/src/func/isArray.js");

module.exports = globalCache.add("file.*.item.*.sort", 
    function(items, cfg, doc) {

        if (cfg.sort) {
            if (!isArray(cfg.sort)) {
                cfg.sort = [cfg.sort];
            }

            cfg.sort.forEach(function(sortCfg){
                var sortType = sortCfg.type,
                    fn = doc.pget("sort." + sortType);

                items = fn.call(null, items, sortCfg, doc);
            });
        }

        return items;
    });