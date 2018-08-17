
var isArray = require("metaphorjs/src/func/isArray.js");

module.exports = function(items, cfg, doc, options){
    if (!cfg) {
        return items;
    }
    if (!isArray(cfg)) {
        cfg = [cfg];
    }

    cfg.forEach(function(sortCfg) {

        if (options.typeFilter && sortCfg.itemType) {
            if (typeof sortCfg.itemType === "string" && 
                sortCfg.itemType != options.itemType)
                    return;
            if (isArray(sortCfg.itemType) && 
                sortCfg.itemType.indexOf(options.itemType) === -1)
                    return;
        }

        if (options.levelFilter && sortCfg.level) {
            var level = sortCfg.level,
                clevel = options.level;

            if (typeof level === "number" && 
                clevel != level) 
                    return;

            var fc = level.substr(0,1),
                sc = level.substr(1,1);
            
            level = parseInt(level.substr(sc === "=" ? 2 : 1));
            sc === "=" && (fc = fc + sc);
            
            if (fc === '<' && clevel >= level) 
                return;
            if (fc === '<=' && clevel > level) 
                return;
            if (fc === '>' && clevel <= level) 
                return;
            if (fc === '>=' && clevel < level) 
                return;
        }

        var sortType = sortCfg.type,
            fn = doc.pget("sort." + sortType);

        if (fn) {
            items = fn.call(null, items, sortCfg, doc);
        }
    });

    return items;
};