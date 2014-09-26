

var cs = require("../var/cs.js");

module.exports = cs.define({

    $class: "item.Param",
    $extends: "item.Var",
    type: "param"

}, {

    createRequiredContext: function(commentPart, comment, doc, file) {

        var ext = doc.getExtension(file);

        if (ext) {
            return ext.getTypeAndName(file, comment.endIndex, file.getCurrentContext(), "function");
        }

        return null;
    },

    priority: 40,
    stackable: false,
    parents: ["method", "function"]

});