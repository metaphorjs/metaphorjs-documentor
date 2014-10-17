
var globalCache = require("../../var/globalCache.js");

module.exports = globalCache.add("js.extractTypeAndName", function(file, startIndex, checkFunctions, checkVars) {

    var content         = file.getContent(),
        part            = content.substr(startIndex, 200),
        lines           = part.split("\n"),
        rVar            = /var\s+([^\s]+)\s*=\s*([^\s(,;]+)/,
        rProp           = /\s*(['"$a-zA-Z0-9\-_]+)\s*:\s*([^\s(,;]+)/,
        rFunc           = /(return|;|=)\s*function\s+([^(]+)/,
        rNamedFunc      = /(['"$a-zA-Z0-9\-_\.]+)\s*[=:]\s*function\s*(\(|[$a-zA-Z0-9_]+)/,
        isFunc          = typeof checkFunctions != "undefined" ? checkFunctions : null,
        isVar           = typeof checkVars != "undefined" ? checkVars : null,
        name, type,
        match,
        inx,
        i, l;

    inx = part.indexOf('/**');
    if (inx > -1) {
        part = part.substr(0, inx);
    }

    for (i = 0, l = lines.length; i < l; i++) {

        part = lines.slice(0, i).join("\n");

        if ((isFunc === null || isFunc === true) && (match = part.match(rFunc))) {
            name = match[2].trim();
            type = "function";
        }
        else if ((isFunc === null || isFunc === true) && (match = part.match(rNamedFunc))) {
            name = match[2].trim();
            if (name == '(') {
                name = match[1].trim();
                name = name.replace(/['"]/g, "");
                var tmp = name.split(".");
                name = tmp.pop();
            }
            type = "function";
        }
        else if ((isVar === null || isVar === true) && (match = part.match(rVar))) {
            name = match[1].trim();
            type = match[2].trim();
        }
        else if ((isVar === null || isVar === true) && (match = part.match(rProp))) {
            name = match[1].trim();
            type = match[2].trim();
        }

        if (type && name) {
            return [type, name];
        }
    }
});