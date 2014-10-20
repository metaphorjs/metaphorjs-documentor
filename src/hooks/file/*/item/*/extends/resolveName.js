
var globalCache = require("../../../../../../var/globalCache.js"),
    resolveExtendableName = require("../../../../../../func/flag/resolveExtendableName.js");

module.exports = globalCache.add("file.*.item.*.extends.resolveName", resolveExtendableName);