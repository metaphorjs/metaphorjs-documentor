var globalCache = require("../../var/globalCache.js"),
    abstractSort = require("../../func/abstractSort.js");

/**
 * @group hook
 * @function
 * Sorts content that is being exported. Applies configured sorters from
 * <code>cfg.export.contentSort = []</code>. Contents 
 * are given to this function regardless of their type - they
 * are already sorted by type and then concatenated into 
 * one array.
 * @param {array} contents
 * @param {object} cfg
 * @param {Documentor} doc
 * @returns {array}
 */
module.exports = globalCache.add("export.sortContent", 
    function(contents, cfg, doc){
        return abstractSort(contents, cfg.export.contentSort, doc, {
            typeFilter: false,
            levelFilter: false
        });
    });