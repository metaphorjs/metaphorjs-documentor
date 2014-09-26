
var Item = require("../Item.js");

module.exports = Item.$extend({

    $class: "item.Class",
    type: "class"

}, {

    priority: 20,
    stackable: true,
    classLike: true,
    parents: ["namespace", "root"]

});