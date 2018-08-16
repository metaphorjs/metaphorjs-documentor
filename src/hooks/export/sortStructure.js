var globalCache = require("../../var/globalCache.js");

module.exports = globalCache.add("export.sortStructure", function(doc, structure){

    var byName = function(a, b){
        if (a.name == b.name) {
            return 0;
        }
        return a.name < b.name ? -1 : 1;
    };

    var cmp = function(a, b){
        if (a.isGroup === b.isGroup) {
            return byName(a, b);
        }
        return a.isGroup ? -1 : 1;
    };

    var sort = function(struct) {
        struct.children.sort(cmp);
        struct.children.forEach(function(item) {
            if (item.isGroup) {
                sort(item);
            }
        });
    };

    var k;
    for (k in structure) {
        sort(structure[k]);
    }

    return structure;
});