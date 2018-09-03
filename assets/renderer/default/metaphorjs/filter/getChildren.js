var nsAdd = require("metaphorjs-namespace/src/func/nsAdd.js");

nsAdd("filter.getChildren", function(item, scope, type) {
    var i, l;
    for (i = 0, l = item.children.length; i < l; i++) {
        if (item.children[i].type == type) {
            return item.children[i].items;
        }
    }
    return [];
});