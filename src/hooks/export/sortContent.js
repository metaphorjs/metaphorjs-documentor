var globalCache = require("../../var/globalCache.js"),
    abstractSort = require("../../func/abstractSort.js");

module.exports = globalCache.add("export.sortContent", 
    function(contents, cfg, doc){
        return abstractSort(contents, cfg.export.contentSort, doc, {
            typeFilter: false,
            levelFilter: false
        });
    });