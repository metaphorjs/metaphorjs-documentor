
var marked = require("marked"),
    globalCache = require("../var/globalCache.js");



module.exports = globalCache.add("markdown", function(content){

    return marked(content, {
        gfm: true,
        breaks: false,
        tables: true
    });
});