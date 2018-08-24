
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
module.exports = globalCache.add("sort.name", function(item, cfg, doc){

    items.sort(function(a, b) {
        if (a.getSortableName() == b.getSortableName()) {
            return 0;
        }
        return a.getSortableName() < b.getSortableName() ? -1 : 1;
    });

    return items;
});

