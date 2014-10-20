
module.exports = function(flag, content, item) {

    if (item.type == flag) {

        var res = item.pcall(flag + ".parse", flag, content, item.comment, item);

        if (res.name) {
            item.name = res.name;
        }
        if (res.description) {
            item.addFlag("description", res.description);
        }
        if (res.type) {
            item.addFlag("type", res.type);
        }

        return false;
    }
};