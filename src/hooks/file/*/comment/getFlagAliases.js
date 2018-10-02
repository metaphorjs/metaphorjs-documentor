
var globalCache = require("../../../../var/globalCache.js"),
    extend = require("metaphorjs-shared/src/func/extend.js");

/**
 * @group hook
 * @function
 * Collect flag aliases from built-in hooks and project hooks
 * @param {File} file
 * @returns {object}
 */
module.exports = globalCache.add("file.*.comment.getFlagAliases", function(file){

    var all = file.pget("comment.flagAliases", true),
        aliases = {},
        i, l;

    for (i = 0, l = all.length; i < l; i++) {
        extend(aliases, all[i]);
    }

    return aliases;
});