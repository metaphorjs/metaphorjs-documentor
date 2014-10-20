
var globalCache = require("../../../var/globalCache.js");

module.exports = globalCache.add("file.*.getItemType", function(type, file) {

    var types = file.pget("items"),
        i, l;

    if (types) {
        for (i = 0, l = types.length; i < l; i++) {
            if (types[i].name == type) {
                return types[i];
            }
        }
    }

    return null;
});