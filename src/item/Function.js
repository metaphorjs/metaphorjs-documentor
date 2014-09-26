
var Item = require("../Item.js"),
    getCurly = require("../func/getCurly.js"),
    trim = require("../../../metaphorjs/src/func/trim.js");

module.exports = Item.$extend({

    $class: "item.Function",
    type: "function",

    addFlag: function(flag, content) {

        switch (flag) {
            case "return":
            case "returns":
                if (content.charAt(0) == '{') {
                    var curly = getCurly(content);
                    this.flags["returns"] = this.doc.normalizeType(curly, this.file);
                    content = trim(content.replace('{' + curly + '}', ''));
                    if (content) {
                        this.flags['returnDescription'] = content;
                    }
                }
                else {
                    this.flags["returns"] = this.doc.normalizeType(content, this.file);
                }
                break;
            case "constructor":
                break;

            default:
                this.$super(flag, content);
        }

    }

}, {

    priority: 30,
    stackable: true,
    onePerComment: true,
    parents: ["param", "property", "class", "interface", "mixin", "trait", "namespace", "root"]

});