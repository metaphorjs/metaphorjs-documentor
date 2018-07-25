
var globalCache = require("../../../var/globalCache.js");



module.exports = (function(){

    var classes = function(name, displayName, groupName) {
        return {
            name: name,
            children: ["property", "const", "method", 
                        "constructor", "event", "!param"],
            extendable: true,
            transform: {
                "function": "method",
                "var":      "property"
            },
            displayName: displayName,
            groupName: groupName
        };
    };

    var funcs = function(name, displayName, groupName) {
        return {
            name: name,
            onePerComment: true,
            multiple: name != "event",
            children: ["param"],
            transform: {},
            displayName: displayName,
            groupName: groupName
        }
    };

    var vars = function(name, displayName, groupName) {

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
            },
            displayName: displayName,
            groupName: groupName
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
            },
            displayName: "Namespace",
            groupName: "Namespaces"
        },
        {
            name: "module",
            namespace: true,
            children: ["*", "!namespace", "!module", "!param"],
            transform: {
                "method": "function"
            },
            displayName: "Module",
            groupName: "Modules"
        },
        classes("class", "Class", "Classes"),
        classes("interface", "Interface", "Interfaces"),
        classes("mixin", "Mixin", "Mixins"),
        classes("plugin", "Plugin", "Plugins"),
        funcs("function", "Function", "Functions"),
        funcs("method", "Method", "Methods"),
        funcs("event", "Event", "Events"),
        vars("param"),
        vars("var", "Variable", "Variables"),
        vars("property", "Property", "Properties"),
        vars("const", "Constant", "Constants")
    ]);

}());