
var globalCache = require("../../../var/globalCache.js"),
    path = require("path"),
    fs = require("fs"),
    os = require("os");

module.exports = globalCache.add("file.js.resolveIncludes", function(file) {

    var content     = file.getContent(),
        base        = file.dir + "/",
        rInclude    = /require\(['|"]([^)]+)['|"]\)/,
        start       = 0,
        list        = [],
        i, l, fc,
        required,
        match;

    var roots = (process.env.NODE_PATH||"").split(path.delimiter);

    while (match = rInclude.exec(content.substr(start))) {

        required = match[1];
        start += match.index + required.length;
        fc = required[0];

        if (required.indexOf(".js") == -1) {
            continue;
        }

        if (fc === '.') {
            required = path.normalize(base + required);
        }
        else if (required.indexOf('/') === -1) {
            continue;
        }
        else if (roots.length) {
            for (i = 0, l = roots.length; i < l; i++) {
                if (fs.existsSync(roots[i] +'/'+ required)) {
                    required = roots[i] +'/'+ required;
                    break;
                }
            }
        }
        
        list.push(required);
    }

    return list;
});