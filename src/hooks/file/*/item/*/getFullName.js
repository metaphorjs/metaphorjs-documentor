
var globalCache = require("../../../../../var/globalCache.js");

/**
 * @group hook
 * @function
 * Returns item's full name - unique name among all items.<br>
 * It consists of prefix taken from <code>getFullNamePrefix()</code>,
 * current item name and all parent's names.
 * @param {Item} item
 * @returns {string}
 */
module.exports = globalCache.add("file.*.item.*.getFullName", 
function(item) {

    var parent = item.getParent(),
        names = [],
        getPrefix = item.pget("getFullNamePrefix"),
        fullName;

    if (parent) {
        names.push(parent.getFullName());
    }

    names.push(getPrefix(item));
    if (!item.isRoot()) {
        names.push(item.name || item.type || "");
    }

    fullName = names.join("");

    if (item.file.options.namePrefix) {
        fullName = item.file.options.namePrefix + fullName;
    }

    return fullName;
});