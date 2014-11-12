
var globalCache = require("../../../../var/globalCache.js");

module.exports = (function(){

    var fn = function(flag, content, comment, item) {

        var ext = comment ? comment.file.ext : (item ? item.file.ext : null);

        if (!ext) {
            return {};
        }

        var getCurly = this.pget(ext + ".getCurly"),
            normalizeType = this.pget(ext + ".normalizeType"),
            type, name,
            description,
            inx;

        if (content.charAt(0) == '{') {
            var curly = getCurly.call(this, content);
            type = normalizeType.call(this, curly, ext);
            content = content.replace('{' + curly + '}', "").trim();
        }

        inx = content.indexOf(" ", 0);

        if (inx > -1) {
            name = content.substr(0, inx).trim();
            content = content.substr(inx).trim();

            if (content) {
                description = content;
            }
        }
        else if (content) {
            if (!type) {
                type = content;
            }
            else {
                name = content;
            }
        }


        return {
            name: name,
            type: type,
            description: description
        };
    };

    globalCache.add("*.flag.var.parse", fn);
    globalCache.add("*.flag.property.parse", fn);
    globalCache.add("*.flag.param.parse", fn);

    return fn;
}());