
var globalCache = require("../../var/globalCache.js");


module.exports = globalCache.add("*.requiredContext", {
    "param": ["function", "method"],
    "returns": ["function", "method"],
    "constructor": ["method"]
});