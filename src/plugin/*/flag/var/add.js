var globalCache = require("../../../../var/globalCache.js");

module.exports = (function(){

    var fn = function(flag, content, item) {

        if (item.type == flag) {

            var res = this.pcall(item.file.ext + ".flag." + flag + ".parse", flag, content, item.comment, item);

            if (res.name) {
                item.name = res.name;
            }
            if (res.description) {
                item.addFlag("description", res.description);
            }
            if (res.type) {
                item.addFlag("type", res.type);
            }

            return false;
        }
    };

    globalCache.add("*.flag.var.add", fn);
    globalCache.add("*.flag.property.add", fn);
    globalCache.add("*.flag.param.add", fn);

    return fn;

}());