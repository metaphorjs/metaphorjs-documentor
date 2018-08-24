
var globalCache = require("../../../../../var/globalCache.js");

/**
 * @group hook
 * @var {object}
 * Key:value map specifying what context should be created
 * for given item type if no compatible context already found.
 * <code>param: [function, method]</code>
 */
module.exports = globalCache.add("file.*.item.?.requiredContext", {
    "param": ["function", "method"],
    "returns": ["function", "method"],
    "constructor": ["method"]
});