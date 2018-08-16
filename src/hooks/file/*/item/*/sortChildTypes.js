var globalCache = require("../../../../../var/globalCache.js");

module.exports = globalCache.add("file.*.item.*.sortChildTypes", 
    function(items, cfg) {
        return items;
    });