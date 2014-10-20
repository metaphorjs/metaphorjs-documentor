
var globalCache = require("../../../../../../var/globalCache.js"),
    createFunctionContext = require("../../../../../../func/item/createFunctionContext.js");

module.exports = globalCache.add("*.item.?.returns.createContext", createFunctionContext);