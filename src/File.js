
var Base = require("./Base.js"),
    Parser = require("./Parser.js"),
    fs = require("fs"),
    path = require("path"),
    trim = require("../../metaphorjs/src/func/trim.js");

module.exports = function(){

    var all = {};

    var File = Base.$extend({


        /**
         * @type string
         */
        path: null,

        /**
         * @type string
         */
        dir: null,

        /**
         * @type string
         */
        ext: null,

        /**
         * @type {Documentor}
         */
        doc: null,

        /**
         * @type {[]}
         */
        contextStack: null,

        /**
         * @type {[]}
         */
        comments: null,


        $init: function () {

            this.contextStack = [this.doc.root];
            this.comments = [];
            this.dir = path.dirname(this.path);
            this.ext = path.extname(this.path).substr(1);

        },

        getContent: function () {
            return fs.readFileSync(this.path).toString();
        },

        parse: function () {

            var parser = new Parser({
                file: this,
                doc:  this.doc
            });

            parser.parse();

            this.comments = parser.comments;

            parser.$destroy();

            this.processComments();
        },

        isPending: function () {
            return this.comments.length > 0;
        },

        processComments: function () {

            var cmts = this.comments,
                parts,
                context,
                j, jl,
                i, l,
                cmt;

            for (i = 0, l = cmts.length; i < l; i++) {
                cmt = cmts[i];
                cmt.determineType(this.getCurrentContext());

                parts = cmt.parts;
                for (j = 0, jl = parts.length; j < jl; j++) {
                    this.processCommentPart(parts[j], cmt);
                }

                context = this.getCurrentContext();
                if (context.constructor.onePerComment) {
                    this.contextStack.pop();
                }
            }
        },

        processCommentPart: function (part, comment) {

            var type = part.type,
                typeClass = this.doc.getItemType(type),
                contextStack = this.contextStack,
                context,
                stackInx,
                item, name,
                i, l, cl;

            if (!typeClass) {

                if (!contextStack.length) {
                    return;
                }

                context = contextStack[contextStack.length - 1];

                return context.addFlag(part.type, part.content);
            }
            else {

                if (!typeClass.parents) {
                    console.log(type);
                    throw "parents undefined";
                }

                stackInx = this.findParent(typeClass.parents);

                if (stackInx == -1) {
                    var req = typeClass.createRequiredContext(part, comment, this.doc, this);
                    if (req) {
                        this.processCommentPart(req, comment);
                        this.processCommentPart(part, comment);
                    }
                    return;
                }

                context = contextStack[stackInx];

                name = part.name || typeClass.getItemName(part.content, comment, this.doc, this, context, type);

                item = context.getItem(type, name) ||
                        new typeClass({
                            doc: this.doc,
                            file: this.file,
                            name: name
                        });

                if (typeof part.content == "string") {
                    item.addFlag(part.type, part.content);

                    context.addItem(item);
                    contextStack.lenght = stackInx + 1;

                    if (typeClass.stackable) {
                        contextStack.push(item);
                    }
                }
                else {

                    context.addItem(item);

                    cl = contextStack.length;
                    contextStack.push(item);

                    for (i = 0, l = part.content.length; i < l; i++) {
                        this.processCommentPart(part.content[i], comment);
                    }

                    contextStack.length = cl;


                }
            }
        },

        findParent: function(parents) {

            var stack = this.contextStack,
                i, il,
                j,
                parent;

            for (i = 0, il = parents.length; i < il; i++) {

                parent = parents[i];

                for (j = stack.length - 1; j >= 0; j--) {

                    if (stack[j].type == parent) {
                        return j;
                    }
                }
            }

            return -1;
        },

        getCurrentContext: function() {
            return this.contextStack[this.contextStack.length - 1];
        }

    }, {

        get: function(filePath, doc) {
            if (!all[filePath]) {
                all[filePath] = new File({
                    path: filePath,
                    doc: doc
                });
            }
            return all[filePath];
        },

        clear: function() {
            all = {};
        }

    });

    return File;

}();