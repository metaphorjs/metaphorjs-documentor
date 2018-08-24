
var globalCache = require("../../../../../../var/globalCache.js");

/**
 * @group hook 
 * @function
 * Prepare flag content if it needs preparing. For example flags
 * with no content become boolean flags, so if <code>content == null</code>
 * we return <code>true</code>.
 * @param {string} flagName 
 * @param {string} flagContent
 * @param {Item} item
 * @returns {string} (un)Modified flag content
 */
module.exports = globalCache.add("file.*.item.*.*.prepare", 
    function(flag, content, item) {

        if (content === null) {
            return true;
        }
    });