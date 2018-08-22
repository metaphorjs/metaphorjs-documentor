var globalCache = require("../../../../../../var/globalCache.js");

/**
 * @group hook 
 * @function
 * @param {string} flagName 
 * @param {string} flagContent
 * @param {Item} item
 * @returns {bool} Return false to cancel adding this flag
 */
module.exports = globalCache.add("file.*.item.*.*.add", function(flag, content, item) {
    
    if (item.type == flag && typeof content == "string" && content) {
        item.setName(content.trim());
        // stop cycle
        return false;
    }
});

