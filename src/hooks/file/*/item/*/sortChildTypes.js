var globalCache = require("../../../../../var/globalCache.js");

/**
 * @group hook
 * @function
 * Sorts child types (keys of object)
 * @param {object} items type=>[items]
 * @param {object} cfg Documentor config
 * @returns {object}
 */
module.exports = globalCache.add("file.*.item.*.sortChildTypes", 
    function(items, cfg) {
        return items;
    });