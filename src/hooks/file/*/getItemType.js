
var globalCache = require("../../../var/globalCache.js");

/**
 * @group hook
 * @function
 * Get item type definition by type
 * @param {string} type
 * @param {File} file
 * @returns {object}
 */
module.exports = globalCache.add("file.*.getItemType", function(type, file) {

    var types = file.pget("items"),
        i, l;

    if (types) {
        for (i = 0, l = types.length; i < l; i++) {
            if (types[i].name == type) {
                return types[i];
            }
        }
    }

    return null;
});