
var globalCache = require("../../var/globalCache.js");

/**
 * @group hook 
 * @function
 * Sort items by name. Uses item's getSortableName(). 
 * Called from various places where configured sorters
 * are applied. 
 * @param {array} items
 * @param {object} cfg
 * @param {Documentor} doc
 * @returns {array}
 */
module.exports = globalCache.add("sort.name", function(items, cfg, doc){

    items.sort(function(a, b) {
        var aName = typeof a === "string" ? a : a.getSortableName(),
            bName = typeof b === "string" ? b : b.getSortableName();

        if (aName == bName) {
            return 0;
        }
        return aName < bName ? -1 : 1;
    });

    return items;
});

