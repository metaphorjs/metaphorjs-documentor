
var isArray = require("metaphorjs/src/func/isArray.js"),
    copy = require("metaphorjs/src/func/copy.js"),
    toBool = require("metaphorjs/src/func/toBool.js"),
    nextUid = require("metaphorjs/src/func/nextUid.js");

module.exports = (function() {

    var LINE_SIZE = 80;

    var defaults = {
        "int": 0,
        "string": "",
        "object": {},
        "array": [],
        "bool": true,
        "boolean": true,
        "float": 0.0
    };

    var childrenToObject = function(o, item, cache) {
        item.children.forEach(function(grp){
            grp.items.forEach(function(child){

                var name = child.name,
                    type = child.plainFlags.type,
                    def = child.plainFlags.default,
                    key, descr,
                    id;
                
                if (!name) {
                    return;
                }

                type && (type = type[0]);
                def && (def = def[0]);

                if (!type) {
                    return;
                }

                id = nextUid();
                key = name +"_"+ id;

                if (!def) {
                    def = defaults[type];   
                }
                
                switch (type) {
                    case "bool":
                    case "boolean": {
                        def = toBool(def);
                        break;
                    }
                    case "int": {
                        def = parseInt(def);
                        break;
                    }
                    case "float": {
                        def = parseFloat(def);
                        break;
                    }
                }

                o[key] = def;

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
            d, line, w, descr,
            pad = " ".repeat(offset);

        if (!item.descr || !item.descr.length) {
            
        }
        else {
            
            descr = item.descr;
            line = "";

            while (descr.length > 0) {
                d = descr.shift().content;
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

        return lines.join("\n");
    };

    var putComments = function(json, o, cache, lineSize) {
        var key, item, r, comment, type;

        for (key in cache) {
            item = cache[key];
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
                return comment + pref +'"'+ item.name +'": '+ rest;
            });
        }

        return json;
    };

    return function(item) {

        if (item.$$jsonPresentation) {
            return item.$$jsonPresentation;
        }

        var type = item.plainFlags.type,
            o = {},
            cache = {};

        type && (type = type[0]);
    
        if (type === "array") {
            o = [{}];
            childrenToObject(o[0], item, cache);
        }
        else {
            childrenToObject(o, item, cache);
        }

        var json = JSON.stringify(o, null, 2);

        json = putComments(json, o, cache, LINE_SIZE);

        item.$$jsonPresentation = json;
        return json;
    };
}());