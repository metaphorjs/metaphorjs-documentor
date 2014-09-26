
var Item = require("../Item.js");

module.exports = Item.$extend({

    $class: "item.Function",
    type: "function"

}, {

    priority: 30,
    stackable: true,
    onePerComment: true,
    parents: ["param", "property", "class", "interface", "mixin", "trait", "namespace", "root"]

});