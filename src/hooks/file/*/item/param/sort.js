var globalCache = require("../../../../../var/globalCache.js");

module.exports = globalCache.add("file.*.item.param.sort", 
    function(items, cfg) {
        return items;
    });