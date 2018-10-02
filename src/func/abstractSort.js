
var isArray = require("metaphorjs-shared/src/func/isArray.js"),
    isPlainObject = require("metaphorjs-shared/src/func/isPlainObject.js");

module.exports = function(items, cfg, doc, options) {

    if (!cfg) {
        return items;
    }

    if (!isArray(cfg)) {
        cfg = [cfg];
    }

    var objMode = false,
        k,
        all = [],
        sortItems = [];

    if (!isArray(items) && isPlainObject(items)) {
        objMode = true;
        for (k in items) {
            all.push({
                key: k,
                item: items[k]
            });
            sortItems.push(options.sortByKey ? k : items[k]);
        }
    }
    else {
        sortItems = items;
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
            sortItems = fn.call(null, sortItems, sortCfg, doc);
        }
    });

    if (objMode) {
        var res = {};
        sortItems.forEach(function(item){
            var i, l = all.length;
            for (i = 0; i < l; i++) {
                if (options.sortByKey && all[i].key === item) {
                    res[all[i].key] = all[i].item;
                }
                else if (all[i].item === item) {
                    res[all[i].key] = item;
                }
            }
        });

        return res;
    }

    return sortItems;
};