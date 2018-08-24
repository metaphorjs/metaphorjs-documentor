var globalCache = require("../../../../../var/globalCache.js"),
    abstractSort = require("../../../../../func/abstractSort.js");

/**
 * @group hook
 * @function
 * Calls all configured content sorters. Sorters are configured in 
 * <code>cfg.contentSort = []</code>. This function sorts
 * items within each content type separately.
 * @param {array} contents list of content items of specific type
 * @param {object} cfg Documentor config
 * @param {Documentor} doc
 * @param {string} itemsType type of content items being sorted
 * @returns {array}
 */
module.exports = globalCache.add("file.*.content.*.sort", 
    function(contents, cfg, doc, itemsType) {
        return abstractSort(contents, cfg.contentSort, doc, {
            typeFilter: true,
            levelFilter: false,
            itemType: itemsType
        });
    });