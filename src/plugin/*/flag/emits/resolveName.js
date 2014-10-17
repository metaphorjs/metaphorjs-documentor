
var globalCache = require("../../../../var/globalCache.js");

module.exports = globalCache.add("*.flag.emits.resolveName", function(item, flag, content){

    var parents = item.getParents(),
        items = [],
        i, l,
        trg;

    parents.forEach(function(parent){
        items.push(parent);
        items = items.concat(parent.getInheritedParents());
    });

    items.unshift(item);

    for (i = 0, l = items.length; i < l; i++) {

        trg = items[i].findItem(content, "event", true);

        if (trg.length) {
            return trg[0].createRef(content);
        }
    }

    return content;
});