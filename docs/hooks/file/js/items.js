
var globalCache = require("metaphorjs-documentor/src/var/globalCache.js");


module.exports = globalCache.add("file.js.items", 
    globalCache.get("file.js.items").concat([
    
    {
        name: "hook",
        children: ["param", "property", "*", "!hook"],
        displayName: "Hook",
        groupName: "Hooks",
        multiple: true,
        transform: {
            "var": "property",
            "type": "property"
        },
        stackable: true
    },

    {
        name: "template",
        children: [],
        displayName: "Template",
        groupName: "Templates"
    }

]));