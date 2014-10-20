
var globalCache = require("../../../../../../var/globalCache.js");

module.exports = globalCache.add("file.*.item.*.returns.prepare", function(flag, content, item) {

    if (!item.file) {
        return content;
    }

    var getCurly = item.file.pget("comment.getCurly"),
        normalizeType = item.file.pget("normalizeType");

    if (content.charAt(0) == '{') {

        var curly = getCurly(content);
        content = content.replace('{' + curly + '}', '').trim();

        if (content) {
            item.addFlag("returnDescription", content);
        }

        return normalizeType(curly, item.file);
    }
    else {
        return normalizeType(content, item.file);
    }

});