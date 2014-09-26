
var cs = require("../var/cs.js");

module.exports = cs.define({

    $class: "item.Property",
    $extends: "item.Var",
    type: "property",

    addFlag: function(flag, content) {

        switch (flag) {
            case "type":
                this.processOwnFlag(content);
                break;
            default:
                this.$super(flag, content);
                break;
        }
    }

}, {

    priority: 40,
    stackable: false,
    parents: ["property", "param", "var", "class", "interface", "mixin", "trait"]

});