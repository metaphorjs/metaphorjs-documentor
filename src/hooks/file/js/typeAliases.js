

var globalCache = require("../../../var/globalCache.js");

module.exports = globalCache.add("file.js.typeAliases", {

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