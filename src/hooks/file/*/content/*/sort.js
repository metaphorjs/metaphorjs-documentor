var globalCache = require("../../../../../var/globalCache.js"),
    isArray = require("metaphorjs/src/func/isArray.js");

module.exports = globalCache.add("file.*.content.*.sort", 
    function(contents, cfg, doc) {

        if (cfg.sort) {
            if (!isArray(cfg.sort)) {
                cfg.sort = [cfg.sort];
            }

            cfg.sort.forEach(function(sortCfg){
                var sortType = sortCfg.type,
                    fn = doc.pget("sort." + sortType);

                contents = fn.call(null, contents, sortCfg, doc);
            });
        }

        return contents;
    });