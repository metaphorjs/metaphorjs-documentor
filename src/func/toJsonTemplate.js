
var toBool = require("metaphorjs-shared/src/func/toBool.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    getCurly = require("../hooks/file/*/comment/getCurly.js");

module.exports = (function() {

    var LINE_SIZE = 80;

    var defaults = {
        "int": 1,
        "string": "",
        "object": {},
        "array": [],
        "bool": true,
        "boolean": true,
        "float": 0.5,
        "datetime": "0000-00-00T00:00:00+00:00"
    };

    var childrenToObject = function(o, item, cache) {
        item.children.forEach(function(grp){
            grp.items.forEach(function(child){

                var name = child.name,
                    type = child.plainFlags.type,
                    val = child.plainFlags.value || 
                            child.plainFlags.default,
                    key, descr,
                    id;
                
                if (!name) {
                    return;
                }

                type && (type = type[0]);
                val && (val = val[0]);

                if (!type) {
                    return;
                }

                id = nextUid();
                key = name +"_"+ id;

                if (!val) {
                    val = defaults[type];   
                }
                
                switch (type) {
                    case "bool":
                    case "boolean": {
                        val = toBool(val);
                        break;
                    }
                    case "int": {
                        val = parseInt(val);
                        break;
                    }
                    case "float": {
                        val = parseFloat(val);
                        break;
                    }
                }

                o[key] = val;

                cache[key] = {
                    id: id,
                    name: name,
                    type: type,
                    descr: null
                };

                if (child.hasOwnProperty("description")) {
                    cache[key].descr = child.description;
                }

                if (child.children.length) {
                    if (type === "object") {
                        o[key] = {};
                        childrenToObject(o[key], child, cache);
                    }
                    else if (type === "array") {
                        o[key] = [{}];
                        childrenToObject(o[key][0], child, cache);
                    }
                }
            });
        });
    };

    var buildComment = function(item, offset, lineSize) {
        var lines = [],
            d, line, w, descr, descrContent,
            pad = " ".repeat(offset);

        if (!item.descr || !item.descr.length) {
            
        }
        else {
            
            descr = item.descr;
            line = "";

            while (descr.length > 0) {
                descrContent = descr.shift().content.split(/[\r\n]/);
                while (descrContent.length > 0) {
                    d = descrContent.shift();
                    d = d.split(" ");

                    while (d.length > 0) {
                        w = d.shift();
                        if (offset + 3 + w.length + 1 <= lineSize) {
                            line += w + " ";
                        }
                        else {
                            lines.push(pad + '// ' + line);
                            line = "";
                        }
                    }

                    if (line.length > 0) {
                        lines.push(pad + '// ' + line);
                        line = "";

                    }
                }
            }
        }

        return lines.join("\n");
    };

    var putComments = function(json, o, cache, lineSize, withFolding) {
        var key, item, r, comment, type, fold;

        if (!json) {
            return "";
        }

        for (key in cache) {
            item = cache[key];
            type = item.type;

            r = new RegExp('^(\\s+)"' + key + '":\\s(.+)$', 'im');

            json = json.replace(r, function(match, pref, rest) {
                var comment = buildComment(
                    item, 
                    //match.length - item.id.length - 1, 
                    pref.length,
                    lineSize
                );
                if (comment) {
                    comment += "\n";
                }
                return comment + pref +'"'+ key +'": '+ rest;
            });

            fold = null;

            if (type === "array" || type === "object") {
                json = json.replace(r, function(match, pref, rest) {

                    var inx = json.indexOf(key) + key.length,
                        brakets = type === "array" ? "[]" : "{}",
                        inxs = getCurly(json, inx, false, true, brakets),
                        part = json.substring(inxs[0], inxs[1]);

                    if (part.trim().length > 50) {
                        fold = {
                            inxs: inxs,
                            part: part
                        };
                    }

                    return pref +'"'+ key +'": '+ rest;
                });
            }

            if (withFolding && fold) {
                json = json.substring(0, fold.inxs[0]) + 
                         '/*fold-start '+key+'*/' +
                            fold.part + 
                        '/*fold-end '+key+'*/' +
                        json.substr(fold.inxs[1]);
            }
            
            json = json.replace(key, item.name);
        }

        return json;
    };

    return function(item, opt) {

        if (item.$$jsonPresentation) {
            return item.$$jsonPresentation;
        }

        var type = item.plainFlags.type,
            o = {},
            cache = {};

        opt = opt || {};
        type && (type = type[0]);

        if (type === "array") {
            o = [{}];
            childrenToObject(o[0], item, cache);
        }
        else {
            childrenToObject(o, item, cache);
        }

        var json = JSON.stringify(o, null, 2);

        json = putComments(json, o, cache, LINE_SIZE, opt.withFolding);

        item.$$jsonPresentation = json;
        return json;
    };
}());