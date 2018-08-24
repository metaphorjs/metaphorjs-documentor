var globalCache = require("../../../../../var/globalCache.js"),
    abstractSort = require("../../../../../func/abstractSort.js");

/**
 * @group hook
 * @function
 * Calls all configured item sorters. Sorters are configured in 
 * <code>cfg.sort = []</code>. This function sorts
 * items within each item type separately.
 * @param {array} items list of items of specific type
 * @param {object} cfg Documentor config
 * @param {Item} parentItem
 * @param {string} itemsType type of items being sorted
 * @returns {array}
 */
module.exports = globalCache.add("file.*.item.*.sort", 
    function(items, cfg, parentItem, itemsType) {
        return abstractSort(items, cfg.sort, parentItem.doc, {
            typeFilter: true,
            levelFilter: true,
            level: parentItem.level + 1,
            itemType: itemsType
        });
    });