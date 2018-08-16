
var globalCache = require("../var/globalCache.js");

module.exports = globalCache.add("files", [
    {
        ext: /html|md|txt/,
        class: "file.Content"
    },
    {
        ext: "*",
        class: "file.Source"
    }
]);