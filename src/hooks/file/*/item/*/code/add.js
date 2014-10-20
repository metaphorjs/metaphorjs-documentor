
var globalCache = require("../../../../../../var/globalCache.js");

globalCache.add("file.*.item.*.code.add", function(flag, content, item) {

    var f = item.file.resolveFlagFile(content);

    if (f === false) {
        item.addFlag("description", {
            type: "code",
            content: content
        });
    }
    else {
        item.addFlag("description", {
            type: "file",
            contentType: "code",
            content: f
        });
    }

    return false;
});