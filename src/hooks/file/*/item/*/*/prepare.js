
var globalCache = require("../../../../../../var/globalCache.js");

/**
 * @group hook 
 * @function
 * @param {string} flagName 
 * @param {string} flagContent
 * @param {Item} item
 * @returns {string} (un)Modified flag content
 */
module.exports = globalCache.add("file.*.item.*.*.prepare", function(flag, content, item) {

    if (content === null) {
        return true;
    }
});