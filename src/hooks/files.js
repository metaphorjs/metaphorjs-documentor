
var globalCache = require("../var/globalCache.js");

/**
 * @group hook 
 * @var {array} {
 *  List of file extension properties. 
 *  @type {object} {
 *      @type {string|regexp} ext File extension
 *      @type {string} class File class name
 *  }
 * }
 */
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