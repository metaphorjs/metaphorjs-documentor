
var Item = require("../Item.js");

module.exports = Item.$extend({

    $class: "item.Namespace",
    type: "namespace"

}, {

    priority: 10,
    stackable: true,
    parents: ["root"]

});