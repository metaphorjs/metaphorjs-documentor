
var globalCache = require("../../../var/globalCache.js");


module.exports = globalCache.add("file.*.items", [
    {
        name: "root",
        children: ["*", "!param"]
    }
]);