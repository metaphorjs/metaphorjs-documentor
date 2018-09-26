var globalCache = require("../../var/globalCache.js"),
    abstractSort = require("../../func/abstractSort.js");

/**
 * @group hook
 * @function
 * Sorts menu groups. Applies configured sorters from
 * <code>cfg.export.sortGroups = []</code>.
 * By default sorts by name
 * @param {array} items
 * @param {object} cfg
 * @param {Documentor} doc
 * @returns {array}
 */
module.exports = globalCache.add("export.sortGroups", 
    function(items, cfg, doc, options) {
        options = options || {};
        options.typeFilter = false;
        options.levelFilter = false;
        return abstractSort(items, cfg.export.sortGroups || ["name"], doc, options);
    });