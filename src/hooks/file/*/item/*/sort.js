var globalCache = require("../../../../../var/globalCache.js"),
    abstractSort = require("../../../../../func/abstractSort.js");

module.exports = globalCache.add("file.*.item.*.sort", 
    function(items, cfg, parentItem, itemsType) {
        return abstractSort(items, cfg.sort, parentItem.doc, {
            typeFilter: true,
            levelFilter: true,
            level: parentItem.level + 1,
            itemType: itemsType
        });
    });