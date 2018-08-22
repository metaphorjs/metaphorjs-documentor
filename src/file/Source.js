
var fs = require("fs"),
    path = require("path"),
    File = require("../File.js"),
    Item = require("../Item.js"),
    Comment = require("../Comment.js"),
    hideLinks = require("../func/hideLinks.js");

module.exports = File.$extend({

        $class: "file.Source",

        /**
         * @type {[]}
         */
        contextStack: null,

        /**
         * @type {[]}
         */
        comments: null,

        /**
         * @type {object}
         */
        tmp: null,


        /**
         * @constructor
         * @param {object} cfg {
         *  @type {Documentor} doc
         *  @type {string} path
         *  @type {object} options {
         *      @type {bool} hidden {
         *          @default false
         *      }
         *      @type {string} basePath
         *  }
         * }
         */
        $init: function() {

            var self = this;

            self.$super.apply(self, arguments);
            self.contextStack = [self.doc.root];
            self.comments = [];
            self.tmp = {};
        },





        process: function () {
            this.parseComments();
            this.processComments();
        },

        parseComments: function() {

            var self = this,
                content = self.getContent(),
                i = 0,
                l = content.length,
                comment,
                cmtObj,
                nexti,
                line,
                lineNo = 1;

            while (i < l) {

                nexti = content.indexOf("\n", i);

                if (nexti == -1) {
                    break;
                }

                line    = content.substring(i, nexti);
                i       = nexti + 1;
                lineNo++;

                if (line.trim().substr(0, 3) == '/**') {
                    nexti = content.indexOf('*/', i);

                    if (nexti == -1) {
                        continue;
                    }

                    comment = content.substring(i, nexti);

                    lineNo += comment.split("\n").length - 1;

                    comment = hideLinks(comment);

                    cmtObj = new Comment({
                        comment: comment,
                        doc: this.doc,
                        file: this,
                        line: lineNo + 1,
                        startIndex: i - 2,
                        endIndex: nexti + 2
                    });

                    cmtObj.parse();

                    if (!cmtObj.hasFlag("ignore")) {
                        this.comments.push(cmtObj);
                    }

                    i = nexti;
                }
            }
        },

        processComments: function(cmts, fixedContext) {

            var self = this,
                cs = self.contextStack,
                csl,
                item,
                last,
                lastCsl;

            cmts = cmts || self.comments;

            var commentPart = function(part, cmt) {

                csl     = cs.length;
                item    = self.processCommentPart(part, cmt, fixedContext);

                // if returned value is a new part of the comment
                // but not a new item
                // (this can happen if current part does not
                // have an acceptable context)
                if (item && !(item instanceof Item)) {
                    // process it as usual
                    item = commentPart(item, cmt);
                    // if it worked, process the original part
                    if (item !== null) {
                        item = commentPart(part, cmt);
                    }
                    return item;
                }

                if (item && item.getTypeProps().onePerComment && lastCsl === null) {
                    last    = item;
                    lastCsl = csl;
                }

                return item;
            };

            cmts.forEach(function(cmt){

                if (cmt.isTemporary()) {
                    self.tmp[cmt.getFlag("md-tmp")] = cmt;
                    cmt.removeFlag("md-tmp");
                    return;
                }

                lastCsl = null;
                last = null;

                cmt.parts.forEach(function(part){
                    commentPart(part, cmt);
                });

                if (last && !fixedContext) {
                    cs.length = lastCsl;
                }
            });
        },

        processCommentPart: function(part, cmt, fixedContext) {

            var self = this,
                cs = self.contextStack,
                type = self.getPartType(part, fixedContext),
                typeProps,
                context,
                item,
                name;

            if (part.flag === "md-apply") {
                context = fixedContext || self.getCurrentContext();
                var tmp = self.tmp[part.content];
                if (tmp) {
                    self.processComments([tmp], context);
                }
                return null;
            }

            if (part.flag === "md-set-var") {
                context = fixedContext || self.getCurrentContext();
                if (context) {
                    var res = this.pcall(
                        "item."+ (type||"*") +".md-set-var.parse", 
                        type, part.content, cmt);
                    
                    if (res.name) {
                        context.setValue(res.name, res.value);
                    }
                }
                return null;
            }

            if (part.flag == "md-var") {
                context = fixedContext || self.getCurrentContext();
                if (context) {
                    var value = context.getValue(part.content);
                    if (value != null && value != undefined && 
                        !item.hasFlag("value")) {
                        item.addFlag("value", value);
                        return null;
                    }
                }
            }

            // end current context
            if (part.flag.indexOf("end-") === 0) {
                var end = part.flag.replace("end-", ""),
                    i;

                for(i = cs.length - 1; i >= 0; i--) {
                    if (cs[i].type == end) {
                        cs.length = i;
                        break;
                    }
                }

                return null;
            }

            // simple flag or item without context
            if (!type) {

                if (typeof type === "undefined" || type === null) {
                    context = fixedContext || self.getCurrentContext();
                    context.addFlag(part.flag, part.content);
                }
                else if (type === false) {

                    // if there is no acceptable context for the given part
                    // we try to create this context.
                    // function returns new comment part
                    item = self.pcall("item.?." + part.flag + ".createContext", part, cmt);

                    // we return this new part
                    // and it will be processed as if it were
                    // in the comment
                    return item === false ? null : item;
                }
            }
            else {
                typeProps   = self.pcall("getItemType", type, self);
                context     = fixedContext || self.getCurrentContext();
                name        = self.getItemName(type, part, cmt);

                item = (!typeProps.multiple && name ?
                        context.getItem(type, name, true) :
                        null) ||

                        new Item({
                            doc: self.doc,
                            file: self,
                            comment: cmt,
                            type: type,
                            name: name
                        });
                    
                item.addFlag(type, part.content);

                if (part.originalFlag && part.originalFlag != type &&
                    !item.hasFlag(part.originalFlag)) {
                    item.addFlag(part.originalFlag, '');
                }

                context.addItem(item);

                if (typeProps.children.length && typeProps.stackable !== false && 
                    !fixedContext) {
                    cs.push(item);
                }
                

                if (part.sub.length) {
                    part.sub.forEach(function (part) {
                        self.processCommentPart(part, null, item);
                    });
                }

                return item;
            }
        },



        getPartType: function(part, fixedContext) {

            var type = part.flag,
                stack = this.contextStack,
                context,
                children,
                transform,
                i,
                isItem;

            if (fixedContext) {
                transform   = fixedContext.getTypeProps().transform;
                type        = transform && transform.hasOwnProperty(type) ? transform[type] : type;

                return this.pcall("getItemType", type, this) ? type : null;
            }

            var requiredContext = this.pget("item.?.requiredContext", true, null, null, true);

            if (requiredContext.hasOwnProperty(type)) {
                requiredContext = requiredContext[type];
            }
            else {
                requiredContext = null;
            }

            // we go backwards through current context stack
            // and see which parent can accept given comment item
            for (i = stack.length - 1; i >= 0; i--) {
                context = stack[i];

                children = context.getTypeProps().children;
                transform = context.getTypeProps().transform;

                // if current context supports given type
                // via transform
                if (transform && transform.hasOwnProperty(type)) {
                    type = transform[type];
                }

                isItem = !!this.pcall("getItemType", type, this);

                if (!isItem && requiredContext && 
                        requiredContext.indexOf(context.type) != -1) {
                    return null;
                }

                // if current context supports given type
                // as is
                if (children &&
                         (children.indexOf(type) != -1 ||
                          children.indexOf("*") != -1) &&
                            children.indexOf("!" + type) == -1) {

                    // make this context last in stack
                    if (isItem) {
                        this.contextStack.length = i + 1;
                        return type;
                    }
                }
            }

            // there is no acceptable context found

            // if there is no such class,
            // we return null which means
            // this is just a flag
            if (!this.pcall("getItemType", type, this)) {
                return requiredContext ? false : null;
            }
            // if class exists but there is no context
            // for it we return false which means
            // that the context must be created
            else {
                return false;
            }
        },

        getItemName: function(type, part, comment) {

            var res = this.pcall(
                "item."+ type +"." + type + ".parse", 
                type, part.content, comment);

            if (res && res.name) {
                return res.name;
            }

            if (comment) {
                res = this.pcall("item.extractTypeAndName", this, comment.endIndex, true, true);
                return res ? res[1] : null;
            }

            return null;
        },


        resolveFlagFile: function(filePath) {

            var self = this,
                ret;

            if (fs.existsSync(process.cwd() + "/" + filePath)) {
                ret = process.cwd() + "/" + filePath;
            }
            else if (fs.existsSync(self.dir + '/' + filePath)) {
                ret =  self.dir + '/' + filePath;
            }
            else if (self.basePath && fs.existsSync(self.basePath + "/" + filePath)) {
                ret =  self.basePath + "/" + filePath;
            }
            else if (fs.existsSync(filePath)) {
                ret =  filePath;
            }

            return ret ? path.normalize(ret) : false;
        },

        getContext: function(inx) {
            return this.contextStack[inx];
        },

        getCurrentContext: function() {
            return this.contextStack[this.contextStack.length - 1];
        },

        getContextStack: function() {
            return this.contextStack.slice();
        }


    });
