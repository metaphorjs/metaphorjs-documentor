
var globalCache = require("../../../../var/globalCache.js");

/**
 * @group hook
 * @var {object}
 * Automatically rename flag as specified in this map.
 */
module.exports = globalCache.add("file.*.comment.flagAliases", {

    "type": "var",
    "return": "returns",
    "extend": "extends",
    "implement": "implements",
    "emit": "emits",
    "throw": "throws",
    "constructor": "method"

});