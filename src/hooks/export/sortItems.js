var globalCache = require("../../var/globalCache.js"),
    abstractSort = require("../../func/abstractSort.js");

module.exports = globalCache.add("export.sortItems", 
    function(items, cfg, doc){
        return abstractSort(items, cfg.export.sort, doc, {
            typeFilter: false,
            levelFilter: false
        });
    });