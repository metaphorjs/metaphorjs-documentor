
var marked = require("marked"),
    globalCache = require("../../var/globalCache.js");



module.exports = globalCache.add("content.markdown", function(content){

    return marked(content, {
        gfm: true,
        breaks: false,
        tables: true
    });
});