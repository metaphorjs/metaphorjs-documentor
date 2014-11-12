

var globalCache = require("../../var/globalCache.js");

module.exports = globalCache.add("js.typeAliases", {

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