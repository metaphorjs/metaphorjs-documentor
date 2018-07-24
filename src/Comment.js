
var Base = require("./Base.js");


/**
 * @class Comment
 */
var Comment = Base.$extend({

    $class: "Comment",

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

    /**
     * @method
     * @returns {bool}
     */
    isTemporary: function() {
        return this.hasFlag("md-tmp");
    },

    /**
     * Check if comment has a flag in it
     * @method
     * @param {string} name 
     * @returns {bool}
     */
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

    /**
     * Get flag content
     * @method
     * @param {string} name
     * @returns {*}
     */
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

    /**
     * Get flag content
     * @method
     * @param {string} name
     */
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