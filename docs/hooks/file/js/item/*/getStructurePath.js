var globalCache = require("metaphorjs-documentor/src/var/globalCache.js");

module.exports = globalCache.add("file.*.item.*.getStructurePath", 
    function(item) {
        if (item.structurePath) {
            return item.structurePath;
        }
        
        if (item.name) {
            if (item.group == "hook") {
                var parts = item.name.split("."),
                    path = [];

                if (parts[0] === "file") {
                    path.push(parts.shift() + "." + parts.shift());
                }

                if ((parts[0] === "item" || parts[0] === "content") &&
                    parts.length > 2) {
                    path.push(parts.shift() + "." + parts.shift());
                }

                item.addToStructExport("nameInPath", parts.pop());

                path = path.concat(parts);
                return path;
            }
            else {
                var path = item.name.split("/");
                if (path.length > 1) {
                    item.addToStructExport("nameInPath", path.pop());
                    return path;
                }
            }
        }
        return null;
    }
);