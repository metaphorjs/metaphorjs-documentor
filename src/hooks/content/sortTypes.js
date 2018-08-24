var globalCache = require("../../var/globalCache.js");

/**
 * @group hook
 * @function
 * Sorts content types (keys of the object)
 * @param {object} contents type=>[list of items]
 * @param {object} cfg Documentor config
 * @returns {object}
 */
module.exports = globalCache.add("content.sortTypes", 
    function(contents, cfg) {
        return contents;
    });