
var Base = require("./Base.js");


/**
 * @class Comment
 */
var Comment = Base.$extend({

    comment: null,
    doc: null,
    file: null,
    line: null,
    startIndex: null,
    endIndex: null,
    parts: null,

    $init: function() {
        this.parts = [];
        this.$super();
    },

    isTemporary: function() {
        return this.hasFlag("md-tmp");
    },

    hasFlag: function(name) {
        var parts = this.parts,
            i, l;

        for (i = 0, l = parts.length; i < l; i++) {
            if (parts[i].flag == name) {
                return true;
            }
        }

        return false;
    },

    getFlag: function(name) {

        var parts = this.parts,
            i, l;

        for (i = 0, l = parts.length; i < l; i++) {
            if (parts[i].flag == name) {
                return parts[i].content;
            }
        }

        return null;
    },

    removeFlag: function(name) {

        var parts = this.parts,
            i, l;

        for (i = 0, l = parts.length; i < l; i++) {
            if (parts[i].flag == name) {
                parts.splice(i, 1);
                break;
            }
        }
    },

    parse: function() {

        var parts = this.pcall("comment.parseComment", this.comment, this.file);

        parts = this.pcall("comment.sortParts", parts, this);

        this.parts = parts || [];
    }

});

module.exports = Comment;