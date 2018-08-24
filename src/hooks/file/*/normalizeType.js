
var globalCache = require("../../../var/globalCache.js");

/**
 * @group hook
 * @function
 * Uses <code>typeAliases</code> to normalize given data type.
 * @param {string} type
 * @param {File} file
 * @returns {string}
 */
module.exports = globalCache.add("file.*.normalizeType", function(type, file){

    var aliases = file.pget("typeAliases"),
        ret = [],
        tmp = type.split("|");

    if (aliases) {
        tmp.forEach(function(type){
            ret.push(aliases[type] || type);
        });
    }
    else {
        ret.push(type);
    }

    return ret;
});