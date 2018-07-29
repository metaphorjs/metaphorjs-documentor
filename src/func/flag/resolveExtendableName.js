
module.exports = function resolveExtendableName(item, flag, content) {

    //if (content.indexOf(".") != -1) {
    //    return content;
    //}

    var find = {
        "extends": "class",
        "implements": "interface",
        "mixes": ["mixin", "trait"],
        "md-extend": null
    };

    if (find.hasOwnProperty(flag)) { 
        var type = find[flag],
            ns = item.getParentNamespace(),
            refs = ns.findItem(content, type);
            
        return refs.length ? refs[0].fullName : null;
    }

    return null;
};