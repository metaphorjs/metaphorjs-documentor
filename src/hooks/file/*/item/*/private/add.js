
var globalCache = require("../../../../../../var/globalCache.js"),
    addAccessFlag = require("../../../../../../func/flag/addAccessFlag.js");

module.exports = globalCache.add("file.*.item.*.private.add", addAccessFlag);