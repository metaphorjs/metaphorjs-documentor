
var globalCache = require("../../../../var/globalCache.js"),
    resolveExtendableName = require("../../../../func/flag/resolveExtendableName.js");

module.exports = globalCache.add("*.flag.mixes.resolveName", resolveExtendableName);