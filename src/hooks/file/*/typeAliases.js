

var globalCache = require("../../../var/globalCache.js");

/**
 * @group hook
 * @var {object}
 * Key:value map that shows how to normalize data type. Like
 * bool=>boolean
 */
module.exports = globalCache.add("file.*.typeAliases", {

    "{}": "object",
    "Object": "object",

    "[]": "array",
    "Array": "array",

    "bool": "boolean",
    "Bool": "boolean",
    "Boolean": "boolean",

    "String": "string",

    "Function": "function"
});