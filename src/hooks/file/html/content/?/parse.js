var globalCache = require("../../../../../var/globalCache.js");

/**
 * @group hook
 * @function
 * Extracts meta information from html document stored in 
 * leading comment with json object inside
 * @param {File} file
 * @returns {object}
 */
module.exports = globalCache.add("file.html.content.?.parse", 
    function(file){
        var match = file.getContent().match(/<!--({.+?})-->/m)
        if (match) {
            return JSON.parse(match[1]);
        }
    });