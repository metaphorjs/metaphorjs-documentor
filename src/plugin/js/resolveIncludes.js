
var globalCache = require("../../var/globalCache.js");

module.exports = globalCache.add("js.resolveIncludes", function(file) {

    var content     = file.getContent(),
        base        = file.dir + "/",
        rInclude    = /require\(['|"]([^)]+)['|"]\)/,
        start       = 0,
        list        = [],
        required,
        match;

    while (match = rInclude.exec(content.substr(start))) {

        required = match[1];
        start += match.index + required.length;

        if (required.indexOf(".js") == -1) {
            continue;
        }

        required = path.normalize(base + required);
        list.push(required);
    }

    return list;
});