

var Extension = require("../Extension.js"),
    trim = require("../../../metaphorjs/src/func/trim.js");

module.exports = Extension.$extend({

    resolveIncludes: function(file) {

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
    },

    getTypeAndName: function(file, startIndex, context, itemType) {

        var classLike = context ? context.constructor.classLike : false,
            content = file.getContent(),
            part = content.substr(startIndex, 200),
            rVar = /var\s+([^\s]+)\s*=\s*([^\s(,;]+)/,
            rProp = /\s*(['"a-zA-Z0-9\-_]+)\s*:\s*([^\s(,;]+)/,
            rFunc = /;\s*function\s+([^(]+)/,
            rNamedFunc = /(['"a-zA-Z0-9\-_\.]+)\s*[=:]\s*function\s*(\(|[a-zA-Z0-9_]+)/,
            isFunc = null,
            isProp = null,
            name, type,
            match;

        if (itemType) {
            isFunc = itemType == "function" || itemType == "method";
            isProp = itemType == "type" || itemType == "property" || itemType == "var" || itemType == "param";
        }

        if ((isFunc === null || isFunc === true) && (match = part.match(rFunc))) {
            name = trim(match[1]);
            type = "function";
        }
        else if ((isFunc === null || isFunc === true) && (match = part.match(rNamedFunc))) {
            name = trim(match[2]);
            if (name == '(') {
                name = trim(match[1]);
                name = name.replace('"', "");
                name = name.replace("'", "");
                var tmp = name.split(".");
                name = tmp.pop();
            }
            type = "function";
        }
        else if ((isProp === null || isProp === true) && (match = part.match(rVar))) {
            name = trim(match[1]);
            type = trim(match[2]);
        }
        else if ((isProp === null || isProp === true) && (match = part.match(rProp))) {
            name = trim(match[1]);
            type = trim(match[2]);
        }


        if (type && name) {
            if (type == "function") {
                type = classLike ? "method" : "function";
            }
            else {
                type = classLike ? "property" : "var";
            }
            return {type: type, name: name, content: ""};
        }
    }

});