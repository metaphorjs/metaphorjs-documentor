
var globalCache = require("../../../../var/globalCache.js"),
    resolveExtendableName = require("../../../../func/flag/resolveExtendableName.js");

module.exports = globalCache.add("*.flag.extends.resolveName", resolveExtendableName);