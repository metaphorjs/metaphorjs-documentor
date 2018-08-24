var globalCache = require("../../../../../var/globalCache.js");

/**
 * @group hook
 * @function
 * When generating navigational structure, each item generates
 * its own structure path - breadcrumbs. 
 * @param {Item} item
 * @returns {array}
 */
module.exports = globalCache.add("file.*.item.*.getStructurePath", 
    function(item) {
        if (item.structurePath) {
            return item.structurePath;
        }
        if (item.name) {
            var path = item.name.split("/");
            if (path.length > 1) {
                item.addToStructExport("nameInPath", path.pop());
                return path;
            }
        }
        return null;
    }
);