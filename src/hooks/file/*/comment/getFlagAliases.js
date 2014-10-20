
var globalCache = require("../../../../var/globalCache.js"),
    extend = require("../../../../../../metaphorjs/src/func/extend.js");

module.exports = globalCache.add("file.*.comment.getFlagAliases", function(file){

    var all = file.pget("comment.flagAliases", true),
        aliases = {},
        i, l;

    for (i = 0, l = all.length; i < l; i++) {
        extend(aliases, all[i]);
    }

    return aliases;
});