
var globalCache = require("../../var/globalCache.js");

module.exports = globalCache.add("*.normalizeType", function(type, ext){

    if (!this.pget) {
        console.trace();
    }

    var aliases = this.pget(ext + ".typeAliases"),
        ret = [],
        tmp = type.split("|");

    if (aliases) {
        tmp.forEach(function(type){
            ret.push(aliases[type] || type);
        });
    }

    return ret;
});