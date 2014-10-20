
module.exports = function resolveExtendableName(item, flag, content) {

    if (content.indexOf(".") != -1) {
        return content;
    }

    var find = {
        "extends": "class",
        "implements": "interface",
        "mixes": ["mixin", "trait"]
    };

    find = find.hasOwnProperty(flag) ? find[flag] : null;

    if (find) {
        var ns = item.getParentNamespace(),
            refs = ns.findItem(content, find);

        return refs.length ? refs[0].fullName : null;
    }

    return null;
};