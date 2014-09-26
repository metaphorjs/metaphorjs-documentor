
var Base = require("./Base.js"),
    Comment = require("./Comment.js");

/**
 * @class Parser
 */
module.exports = Base.$extend({

    /**
     * @type {Documentor}
     */
    doc: null,
    file: null,
    comments: null,

    $init: function() {

        this.comments = [];
        this.$super();
    },

    /**
     * @method
     */
    parse: function() {

        var self = this,
            content = self.file.getContent(),
            i = 0,
            l = content.length,
            char,
            comment,
            nexti;

        while (i < l) {

            char = content.charAt(i);

            if (char == '"' || char == "'") {
                nexti = content.indexOf(char, i+1);
                while (content.charAt(nexti - 1) == '\\') {
                    nexti = content.indexOf(char, nexti+1);
                }

                if (nexti == -1) {
                    break;
                }

                i = nexti + 1;
                continue;
            }

            // comment start
            if (char == '*' && content.charAt(i - 1) == '*' && content.charAt(i - 2) == '/') {
                nexti = content.indexOf('*/', i + 1);

                if (nexti == -1) {
                    break;
                }

                comment = content.substring(i, nexti);
                self.parseComment(comment, i - 2, nexti + 2);
                i = nexti;
                continue;
            }

            i++;
        }
    },

    parseComment: function(commentText, commentStart, commentEnd) {

        var comment = new Comment({
            comment: commentText,
            doc: this.doc,
            file: this.file,
            startIndex: commentStart,
            endIndex: commentEnd
        });

        comment.parse();

        this.comments.push(comment);
    }


});