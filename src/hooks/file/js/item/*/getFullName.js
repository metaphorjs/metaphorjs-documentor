
var globalCache = require("../../../../../var/globalCache.js");

module.exports = globalCache.add("file.js.item.*.getFullName", function(item) {

    var parents = item.getParents().reverse(),
        name = item.name,
        fullName = "";

    if (!name) {
        return null;
    }



    parents.push(item);

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

    parents.forEach(function(parent) {
        if (parent.name) {
            if (fullName) {
                fullName += getPrefix(parent);
            }
            fullName += parent.name;
        }
    });

    if (item.file.options.namePrefix) {
        fullName = item.file.options.namePrefix + fullName;
    }

    return fullName;
});