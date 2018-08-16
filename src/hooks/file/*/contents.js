var globalCache = require("../../../var/globalCache.js");

module.exports = globalCache.add("file.*.contents", [
    {
        type: "tutorial",
        displayName: "Tutorial",
        groupName: "Tutorials"
    },
    {
        type: "article",
        displayName: "Article",
        groupName: "Articles"
    }
]);