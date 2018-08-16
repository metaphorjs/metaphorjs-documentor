var globalCache = require("../../../../../var/globalCache.js");

module.exports = globalCache.add("file.html.content.?.parse", 
    function(file){
        var match = file.getContent().match(/<!--({.+?})-->/m)
        if (match) {
            return JSON.parse(match[1]);
        }
    });