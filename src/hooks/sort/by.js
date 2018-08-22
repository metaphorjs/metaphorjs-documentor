
var globalCache = require("../../var/globalCache.js"),
    sortArray = require("metaphorjs/src/func/array/sortArray.js");

/**
 * @group hook
 * @function
 * Sort items by function
 * @param {array} items
 * @param {object} cfg
 * @param {Documentor} doc
 * @returns {array}
 */
module.exports = globalCache.add("sort.by", function(items, cfg, doc){

    var by = cfg.by,
        dir = cfg.direction || "asc";

    return sortArray(items, by, dir);
});