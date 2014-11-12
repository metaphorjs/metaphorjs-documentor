
var globalCache = require("../../../../var/globalCache.js");

module.exports = globalCache.add("*.flag.returns.prepare", function(flag, content, item) {

    if (!item.file) {
        return content;
    }

    var ext = item.file.ext,
        getCurly = this.pget(ext + ".getCurly"),
        normalizeType = this.pget(ext + ".normalizeType");

    if (content.charAt(0) == '{') {

        var curly = getCurly(content);
        content = content.replace('{' + curly + '}', '').trim();

        if (content) {
            item.addFlag("returnDescription", content);
        }

        return normalizeType(curly, ext);
    }
    else {
        return normalizeType(content, ext);
    }

});