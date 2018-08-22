
var globalCache = require("../../../../../../var/globalCache.js");

module.exports = globalCache.add("file.*.item.*.group.add", 
    function(flag, content, item){
        if (content != item.type) {
            item.setGroup(content);
        }
        return false;
    });