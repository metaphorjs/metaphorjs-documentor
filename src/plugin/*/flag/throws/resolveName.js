
var globalCache = require("../../../../var/globalCache.js"),
    resolveTypeName = require("../../../../func/flag/resolveTypeName.js");

module.exports = globalCache.add("*.flag.throws.resolveName", resolveTypeName);