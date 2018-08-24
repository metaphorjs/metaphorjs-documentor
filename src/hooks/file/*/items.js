
var globalCache = require("../../../var/globalCache.js");

/**
 * @group hook
 * @var {array} {
 *  List of item type definitions and their relation to each other
 *  @type {string} name
 *  @type {array} children {
 *      List of possible children: "*" - all, "name" - specific names, 
 *      "!name" - not name
 *  }
 * }
 */
module.exports = globalCache.add("file.*.items", [
    {
        name: "root",
        children: ["*", "!param"]
    }
]);