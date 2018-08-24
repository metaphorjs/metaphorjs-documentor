
var marked = require("marked"),
    globalCache = require("../../var/globalCache.js");


/**
 * @group hook
 * @function
 * Markdown processor. Currently uses <code>marked</code> package.
 * @param {string} content
 * @returns {string}
 */
module.exports = globalCache.add("content.markdown", function(content){

    return marked(content, {
        gfm: true,
        breaks: false,
        tables: true
    });
});