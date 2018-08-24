var globalCache = require("../../../../../../var/globalCache.js");

/**
 * @group hook 
 * @function
 * Function called when flag is being added to an item.
 * <code>file.*ext.item.*itemType.*flagName.add</code>.
 * For example: a hook <code>file.js.item.function.param.add</code>
 * would be called when processing param flag and adding it to 
 * already identified function.<br>
 * This hook is also called with flagName equal to item type:
 * <code>file.js.item.function.function.add</code>. In its
 * generic version this hook sets item name from the content of this flag.
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

