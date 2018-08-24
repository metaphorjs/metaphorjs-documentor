var globalCache = require("../../var/globalCache.js"),
    abstractSort = require("../../func/abstractSort.js");

/**
 * @group hook
 * @function
 * Calls all configured sorters for all items (api and content).
 * Sorters are configured in <code>cfg.export.sortAll = []</code>
 * @param {array} items
 * @param {object} cfg Documentor config
 * @param {Documentor} doc
 * @returns {array}
 */
module.exports = globalCache.add("export.sortAll", 
    function(items, cfg, doc){
        return abstractSort(items, cfg.export.sortAll, doc, {
            typeFilter: false,
            levelFilter: false
        });
    });