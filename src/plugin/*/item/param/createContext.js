
var globalCache = require("../../../../var/globalCache.js");

module.exports = (function(){

    var createFunctionContext = function createFunctionContext(commentPart, comment) {

        var res = this.pcall(comment.file.ext + ".extractTypeAndName",
            comment.file, comment.endIndex, true, false);

        if (res) {
            return {flag: res[0], content: res[1], sub: []};
        }
    };


    globalCache.add("*.item.param.createContext", createFunctionContext);
    globalCache.add("*.item.returns.createContext", createFunctionContext);

    return createFunctionContext;
}());