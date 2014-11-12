
var fs = require("fs");

var parseComment = require("./src/func/parseComment.js"),
    sortParts = require("./src/func/sortParts.js"),
    flagSort = require("./src/Extension.js").flagSort;

var tree = parseComment(fs.readFileSync("comment.txt").toString());

sortParts(tree, flagSort);

console.log(JSON.stringify(tree, null, 4));

//fs.writeFileSync("tmp.txt", JSON.stringify(tree, null, 4))