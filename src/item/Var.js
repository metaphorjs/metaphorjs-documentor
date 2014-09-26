
var Item = require("../Item.js"),
    trim = require("../../../metaphorjs/src/func/trim.js");

module.exports = Item.$extend({

    $class: "item.Var",
    type: "var"

}, {

    priority: 50,
    stackable: false,
    parents: ["namespace", "root"],

    getItemName: function(flagString, comment, doc, file, context, type) {

        var left = 0,
            right = 0,
            name,
            i, l,
            char;

        flagtype: while (typeof flagString != "string") {
            for (i = 0, l = flagString.length; i < l; i++) {
                if (flagString[i].type == "description") {
                    flagString = flagString[i].content;
                    continue flagtype;
                }
            }
            break;
        }

        flagString = trim(flagString);

        if (flagString.charAt(0) == '{') {

            for (i = 0, l = flagString.length; i < l; i++) {
                char = flagString.charAt(i);
                if (char == '{') {
                    left++;
                }
                else if (char == '}') {
                    right++;
                }
                if (left > 0 && left == right) {
                    flagString = trim(flagString.substr(i + 1));
                    if (flagString) {
                        name = flagString.split(" ").shift();
                        return name;
                    }
                }
            }

            if (flagString) {
                var tmp = flagString.split(" ");

                switch (tmp.length) {
                    case 0:
                        return null;
                    case 1:
                        return tmp[1];
                    default:
                        return tmp[2]
                }
            }
        }

        var ext = doc.getExtension(file);
        if (ext) {
            var part = ext.getTypeAndName(file, comment.endIndex, context, type);

            if (part) {
                return part.name;
            }
        }

        return null;
    }

});