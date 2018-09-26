var globalCache = require("../../var/globalCache.js"),
    extend = require("metaphorjs/src/func/extend.js");

/**
 * @group hook
 * @function
 * Returns navigational structure with all items - api and content.
 * @param {Documentor} doc
 * @param {array} items
 * @returns {object}
 */
module.exports = globalCache.add("export.getStructure", function(doc, items){
    
    var structure = {},
        typePos = doc.cfg.export.typePosition || {};

    var findGroupAmongChildren = function(children, groupName) {
        var i, l, child;
        for (i = 0, l = children.length; i < l; i++) {
            child = children[i];
            if (child.isGroup && child.name == groupName) {
                return child;
            }
        }
    };

    var getTargetByPath = function(struct, path) {

        var name, grp, target = struct.children, newGrp;

        if (path.length > 0) {
            name = path.shift();
            grp = findGroupAmongChildren(struct.children, name);

            if (!grp) {
                newGrp = {
                    isGroup: true,
                    name: name,
                    children: []
                };
                struct.children.push(newGrp);
                return getTargetByPath(newGrp, path.slice());
            }
            else {
                return getTargetByPath(grp, path.slice());
            }
        }
        
        return target;
    };

    items.forEach(function(item){

        var grpProps    = item.getGroupProps(),
            path        = item.pcall("getStructurePath", item),
            group       = item.group,
            target;

        if (!grpProps) {
            console.log("Group " + group + " not found");
        }

        if (!structure[group]) {
            structure[group] = {
                type: group,
                groupName: grpProps.groupName,
                where: typePos[group] || "top-menu",
                children: []
            };
        }

        target = path ? getTargetByPath(structure[group], path.slice()) : 
                        structure[group].children;
    
        target.push(extend(
            {}, 
            item.exportToStructure(), 
            {
                isItem: true
            }, 
            true, false
        ));
    });

    structure = doc.pcall("export.sortGroups", structure, doc.cfg, doc, {
        sortByKey: true
    });
    return doc.pcall("export.sortStructure", doc, structure);
});