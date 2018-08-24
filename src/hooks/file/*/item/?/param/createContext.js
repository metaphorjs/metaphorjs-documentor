
var globalCache = require("../../../../../../var/globalCache.js"),
    createFunctionContext = require("../../../../../../func/item/createFunctionContext.js");

/**
 * @group hook
 * @function
 * Generates comment part (as returned from <code>comment.parseComment()</code>)
 * based on results from <code>item.?.extractTypeAndName()</code>.
 * @param {object} commentPart the part holding param definition
 * @param {Comment} comment
 * @returns {object}
 */
module.exports = globalCache.add("file.*.item.?.param.createContext", createFunctionContext);