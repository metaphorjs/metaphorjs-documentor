
var globalCache = require("../../../../../../var/globalCache.js");

/**
 * @group hook 
 * @function
 * Some flags may require specific parsing. 
 * @param {string} flagName 
 * @param {string} flagContent
 * @param {Comment} comment
 * @param {Item} item
 * @returns {object} {
 *  @type {string} name
 *  @type {string} description
 *  @type {string} type
 * }
 */
module.exports = globalCache.add("file.*.item.*.*.parse", 
    function(type, content, comment, item){
        return null;
});
