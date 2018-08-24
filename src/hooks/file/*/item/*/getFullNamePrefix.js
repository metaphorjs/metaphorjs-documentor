var globalCache = require("../../../../../var/globalCache.js");

/**
 * @group hook
 * @function
 * Returns prefix that separates current item from its parent.
 * @param {Item} item
 * @returns {string}
 */
module.exports = globalCache.add("file.*.item.*.getFullNamePrefix", 
function(item){
    if (item.isRoot()) {
        return "";
    }
    if (item.level === 1 && item.name) {
        return item.type + ':';
    }
    if (item.level > 1) {
        return "/";
    }
    return "";
});