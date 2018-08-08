var globalCache = require("../../../../../var/globalCache.js");

module.exports = globalCache.add("file.*.item.*.getStructurePath", 
    function(item) {
        if (item.structurePath) {
            return item.structurePath;
        }
        var path = item.name.split("/");
        if (path.length > 1) {
            item.addToStructExport("nameInPath", path.pop());
            return path;
        }
        return null;
    }
);