
var globalCache = require("../../../../../../var/globalCache.js");

globalCache.add("file.*.item.*.description.prepare", function(flag, content, item) {

    if (typeof content != "string") {
        return content;
    }

    var f = item.file.resolveFlagFile(content);

    if (f === false) {
        return {
            type: "string",
            content: content
        }
    }
    else {
        return {
            type: "file",
            content: f
        };
    }

});