var globalCache = require("../../var/globalCache.js"),
    abstractSort = require("../../func/abstractSort.js");

/**
 * @group hook
 * @function
 * Sorts items that is being exported. Applies configured sorters from
 * <code>cfg.export.sort = []</code>. Items 
 * are given to this function regardless of their type - they
 * are already sorted by type and then concatenated into 
 * one array.
 * @param {array} items
 * @param {object} cfg
 * @param {Documentor} doc
 * @returns {array}
 */
module.exports = globalCache.add("export.sortItems", 
    function(items, cfg, doc){
        return abstractSort(items, cfg.export.sort, doc, {
            typeFilter: false,
            levelFilter: false
        });
    });