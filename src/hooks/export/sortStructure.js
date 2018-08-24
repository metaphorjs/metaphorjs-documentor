var globalCache = require("../../var/globalCache.js");

/**
 * @group hook
 * @function
 * Sorts exported structure by moving groups higher than items
 * and sorting items and groups by name.
 * @param {Documentor} doc
 * @param {object} structure
 * @returns {object}
 */
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