
var globalCache = require("../../../../../var/globalCache.js");

module.exports = globalCache.add("file.js.item.*.getFullName", function(item) {

    var parents = item.getParents().reverse(),
        name = item.name,
        fullName = "";

    if (!name) {
        return null;
    }

    var getPrefix = function(item) {
        switch (item.type) {
            case "param":
                return '/';
            case "event":
                return "@";
            default:
                return ".";
        }
    };

    if (parents.length > 1) { // excluding root
        parents.forEach(function(parent) {
            if (parent.name) {
                if (fullName) {
                    fullName += getPrefix(parent);
                }
                else {
                    fullName = parent.type + ":";
                }
                fullName += parent.name;
            }
        });

        fullName = fullName + getPrefix(item) + item.name;
    }
    else {
        fullName = item.type + ":" + item.name;
    }
    
    

    if (item.file.options.namePrefix) {
        fullName = item.file.options.namePrefix + fullName;
    }

    return fullName;
});