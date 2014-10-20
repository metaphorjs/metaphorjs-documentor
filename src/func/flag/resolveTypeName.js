
module.exports = function resolveTypeName(item, flag, content) {

    if (!content) {
        return null;
    }

    if (content.indexOf(".") != -1) {
        return content;
    }

    if (content == item.name) {
        return item.fullName;
    }

    var ns = item.getParentNamespace(),
        refs = ns ? ns.findItem(content) : [];

    return refs.length ? refs[0].fullName : null;
};