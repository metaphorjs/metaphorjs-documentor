
var globalCache = require("../../../var/globalCache.js");



module.exports = (function(){

    var classes = function(name) {
        return {
            name: name,
            children: ["method", "property", "const", "event", "!param"],
            extendable: true,
            transform: {
                "function": "method",
                "var":      "property"
            }
        };
    };

    var funcs = function(name) {
        return {
            name: name,
            onePerComment: true,
            multiple: name != "event",
            children: ["param"],
            transform: {}
        }
    };

    var vars = function(name) {

        var children = ["!param"];

        if (name == "var" || name == "property") {
            children.push("event");
        }

        return {
            name: name,
            stackable: name != "param",
            onePerComment: true,
            children: children,
            transform: {
                "var": "property"
            }
        };
    };


    return globalCache.add("file.js.items", [
        {
            name: "root",
            namespace: true,
            children: ["*", "!param"]
        },
        {
            name: "namespace",
            namespace: true,
            children: ["*", "!namespace", "!param"],
            transform: {
                "method": "function"
            }
        },
        {
            name: "module",
            namespace: true,
            children: ["*", "!namespace", "!module", "!param"],
            transform: {
                "method": "function"
            }
        },
        classes("class"),
        classes("interface"),
        classes("mixin"),
        funcs("function"),
        funcs("method"),
        funcs("event"),
        vars("param"),
        vars("var"),
        vars("property"),
        vars("const")
    ]);

}());