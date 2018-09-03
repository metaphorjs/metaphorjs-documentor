
var globalCache = require("../../../../../../var/globalCache.js");

globalCache.add("file.*.item.*.description.add", function(flag, content, item) {


    if (typeof content == "string") {
        content = {
            type: "string",
            content: content
        };
    }

    if (content.type != "string") {
        return;
    }

    var text = content.content,
        files = [];

    text = text.replace(/\[#code\s+([^\[]+)\]/, function(match, file){

        var f = item.file.resolveFlagFile(file);

        if (f === false) {
            return match;
        }

        if (f) {
            files.push(f);
        }
        return "--#--";
    });

    if (!files.length) {
        return;
    }

    text = text.split('--#--');

    var pushTextPart = function(inx) {
        var txt = text[inx].trim();

        if (txt) {
            item.addFlag("description", {
                type: "string",
                content: txt
            });
        }
    };

    files.forEach(function(file, inx) {

        pushTextPart(inx);

        item.addFlag("description", {
            type: "file",
            content: file,
            contentType: "code"
        });
    });

    pushTextPart(text.length - 1);

    return false;
});