
var globalCache = require("../../../../../var/globalCache.js");

module.exports = globalCache.add("file.*.item.function.finish", 
    function(item){
        item.addToExport("isFunction", true);
    });