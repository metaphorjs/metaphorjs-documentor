
var globalCache = require("../../../var/globalCache.js");

module.exports = globalCache.add("file.*.normalizeType", function(type, file){

    var aliases = file.pget("typeAliases"),
        ret = [],
        tmp = type.split("|");

    if (aliases) {
        tmp.forEach(function(type){
            ret.push(aliases[type] || type);
        });
    }

    return ret;
});