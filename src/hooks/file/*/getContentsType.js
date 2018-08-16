
var globalCache = require("../../../var/globalCache.js");

module.exports = globalCache.add("file.*.getContentsType", function(type, file) {

    var types = file.pget("contents"),
        i, l;

    if (types) {
        for (i = 0, l = types.length; i < l; i++) {
            if (types[i].type == type) {
                return types[i];
            }
        }
    }

    return null;
});