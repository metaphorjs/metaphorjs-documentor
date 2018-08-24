
var globalCache = require("../../var/globalCache.js"),
    sortArray = require("metaphorjs/src/func/array/sortArray.js");

/**
 * @group hook
 * @function
 * Sort items by function. Called from various places where configured sorters
 * are applied.
 * @param {array} items
 * @param {object} cfg {
 *  @type {string|function} by {
 *      Either a field name to take value from or function that takes item as argument
 *      and returns some value. Items will be sorted by this value.
 *  }
 *  @type {string} direction {
 *      @default asc
 *  }
 * }
 * @param {Documentor} doc
 * @returns {array}
 */
module.exports = globalCache.add("sort.by", function(items, cfg, doc){

    var by = cfg.by,
        dir = cfg.direction || "asc";

    return sortArray(items, by, dir);
});