var globalCache = require("../../../../../var/globalCache.js"),
    abstractSort = require("../../../../../func/abstractSort.js");

module.exports = globalCache.add("file.*.content.*.sort", 
    function(contents, cfg, doc, itemsType) {
        return abstractSort(contents, cfg.contentSort, doc, {
            typeFilter: true,
            levelFilter: false,
            itemType: itemsType
        });
    });