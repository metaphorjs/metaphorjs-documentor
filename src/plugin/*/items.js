
var globalCache = require("../../var/globalCache.js");


module.exports = globalCache.add("*.items", [
    {
        name: "root",
        children: ["*", "!param"]
    }
]);