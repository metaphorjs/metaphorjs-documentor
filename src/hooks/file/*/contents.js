var globalCache = require("../../../var/globalCache.js");

/**
 * @group hook
 * @var {array} {
 *  Content type definitions
 *  @type {string} type
 *  @type {string} displayName
 *  @type {string} groupName
 * }
 */
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