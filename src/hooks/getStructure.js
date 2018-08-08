var globalCache = require("../var/globalCache.js"),
    extend = require("metaphorjs/src/func/extend.js");

module.exports = globalCache.add("getStructure", function(doc, items){
    
    var structure = {};

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

        var typeProps   = item.getTypeProps(),
            path        = item.pcall("getStructurePath", item),
            type        = item.type,
            target;

        if (!structure[type]) {
            structure[type] = {
                type: type,
                groupName: typeProps.groupName,
                children: []
            };
        }

        target = path ? getTargetByPath(structure[type], path.slice()) : 
                        structure[type].children;
    
        target.push(extend(
            {}, 
            item.exportToStructure(), 
            {
                isItem: true
            }, 
            true, false
        ));
    });

    return doc.pcall("sortStructure", doc, structure);
});