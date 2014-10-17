
var globalCache = require("../../../../var/globalCache.js");

module.exports = globalCache.add("*.flag.*.prepare", function(flag, content, item) {

    if (content === null) {
        return true;
    }
});