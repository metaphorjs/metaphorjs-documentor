
var globalCache = require("../../var/globalCache.js"),
    extend = require("../../../../metaphorjs/src/func/extend.js");

module.exports = globalCache.add("*.getFlagAliases", function(ext){

    var all = this.pget(ext + ".flagAliases", true),
        aliases = {},
        i, l;

    for (i = 0, l = all.length; i < l; i++) {
        extend(aliases, all[i]);
    }

    return aliases;
});