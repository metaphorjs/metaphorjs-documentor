
var cs = require("../var/cs.js");

module.exports = cs.define({

    $class: "item.Method",
    $extends: "item.Function",
    type: "method",


    addFlag: function(flag, content) {

        switch (flag) {
            case "constructor":
                this.flags[flag] = true;
                break;
            default:
                this.$super(flag, content);
                break;
        }
    }

}, {

    priority: 20,
    stackable: true,
    parents: ["class", "interface", "mixin", "trait"]

});