
module.exports = function createFunctionContext(commentPart, comment) {

    var res = comment.file.pcall("item.?.extractTypeAndName",
        comment.file, comment.endIndex, true, false);

    if (res) {
        return {flag: res[0], content: res[1], sub: []};
    }
};