
var globalCache = require("../../../../../../var/globalCache.js");

module.exports = globalCache.add("file.*.item.*.md-set-var.parse", 
    function(flag, content, comment, item) {

        var name, value, inx = content.indexOf(" ");

        name = content.substr(0, inx);
        value = content.substr(inx + 1);

        return {
            name: name,
            value: value
        };
});