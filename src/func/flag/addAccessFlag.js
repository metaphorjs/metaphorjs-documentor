

module.exports = function(flag, content, item) {
    item.addFlag("access", flag);
    return false;
};