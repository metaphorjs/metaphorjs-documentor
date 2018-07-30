var globalCache = require("../../../../../var/globalCache.js");

module.exports = globalCache.add("file.js.item.*.getFullNamePrefix", 
function(item){
    if (item.isRoot()) {
        return "";
    }
    if (item.level === 1 && item.name) {
        return item.type + ':';
    }
    if (item.level > 1) {
        switch (item.type) {
            case "param":
                return '/';
            case "event":
                return "@";
            default:
                return ".";
        }
    }
    return "";
});