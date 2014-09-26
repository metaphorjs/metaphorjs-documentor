
var Base = require("./Base.js"),
    trim = require("../../metaphorjs/src/func/trim.js");


module.exports = Base.$extend({

    doc: null,
    type: null,
    name: null,
    items: null,
    flags: null,
    map: null,
    ignore: false,

    $init: function() {

        this.flags = {};
        this.items = {};
        this.map = {};

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
            default:
                this.flags[flag] = content;
                break;
        }
    },

    processOwnFlag: function(content) {

    },


    getData: function() {

        var exprt = {
            name: this.name,
            flags: this.flags
        };

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