var globalCache = require("../../var/globalCache.js"),
    abstractSort = require("../../func/abstractSort.js");

module.exports = globalCache.add("export.sortAll", 
    function(items, cfg, doc){
        return abstractSort(items, cfg.export.sortAll, doc, {
            typeFilter: false,
            levelFilter: false
        });
    });