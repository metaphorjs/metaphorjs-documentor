
var globalCache = require("../../var/globalCache.js");

module.exports = globalCache.add("*.getItemType", function(type, file) {

    var ext = file ? file.ext : "*",
        types = this.pget(ext + ".items"),
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