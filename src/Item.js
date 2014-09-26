
var Base = require("./Base.js"),
    trim = require("../../metaphorjs/src/func/trim.js");


module.exports = Base.$extend({

    doc: null,
    file: null,
    type: null,
    name: null,
    items: null,
    flags: null,
    map: null,
    ignore: false,
    comment: null,
    line: null,

    $init: function() {

        this.flags = {};
        this.items = {};
        this.map = {};

        if (this.file && this.comment && this.constructor.stackable) {
            var inx = this.comment.endIndex,
                content = this.file.getContent(),
                part = content.substr(0, inx);

            this.line = part.split("\n").length;
        }

        this.$super();
    },

    getItem: function(type, name) {
        var id = type +"-"+ name;
        return this.map[id] || null;
    },

    addItem: function(item) {
        var type = item.type;
        if (!this.items[type]) {
            this.items[type] = [];
        }
        this.items[type].push(item);

        if (item.name) {
            var id = item.type + "-" + item.name;
            this.map[id] = item;
        }
    },

    addFlag: function(flag, content) {

        switch (flag) {
            case this.type:
                this.processOwnFlag(content);
                break;
            case "ignore":
                this.ignore = true;
                break;
            case "required":
                this.flags[flag] = true;
                break;
            case "public":
            case "protected":
            case "private":
                this.flags['access'] = flag;
                break;
            default:
                this.flags[flag] = content;
                break;
        }
    },

    processOwnFlag: function(content) {

    },


    getData: function() {

        var exprt = {
            name:  this.name,
            flags: this.flags
        };

        if (this.constructor.stackable) {
            if (this.file) {
                exprt.file = this.file.path;
            }
            if (this.line) {
                exprt.line = this.line;
            }
        }

        var items = this.items,
            key, i, l,
            item;

        for (key in items) {
            exprt[key] = [];

            for (i = 0, l = items[key].length; i < l; i++) {
                item = items[key][i];
                if (!item.ignore) {
                    exprt[key].push(item.getData());
                }
            }
        }

        return exprt;
    }

}, {

    createRequiredContext: function(commentPart, comment, doc, file) {
        return null;
    },

    getItemName: function(flagString, comment, doc, file, context, itemType) {
        if (flagString) {
            return flagString;
        }
        else {

            var parts = comment.parts,
                i, l;

            for (i = 0, l = parts.length; i < l; i++) {
                if (parts[i].type == "name") {
                    return parts[i].content;
                }
            }

            var ext = doc.getExtension(file);
            if (ext) {
                var part = ext.getTypeAndName(file, comment.endIndex, context, itemType);
                if (part) {
                    return part.name;
                }
            }
        }
        return null;
    }

});