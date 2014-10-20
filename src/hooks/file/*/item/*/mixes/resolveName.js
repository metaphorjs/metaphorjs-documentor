
var globalCache = require("../../../../../../var/globalCache.js"),
    resolveExtendableName = require("../../../../../../func/flag/resolveExtendableName.js");

module.exports = globalCache.add("file.*.item.*.mixes.resolveName", resolveExtendableName);