

var MetaphorJs = {


};


var Namespace = require("metaphorjs-namespace");

var ns = new Namespace(MetaphorJs, "MetaphorJs");

var Class = require("metaphorjs-class");

var cs = new Class(ns);


var slice = Array.prototype.slice;

var toString = Object.prototype.toString;

var undf = undefined;




var varType = function(){

    var types = {
        '[object String]': 0,
        '[object Number]': 1,
        '[object Boolean]': 2,
        '[object Object]': 3,
        '[object Function]': 4,
        '[object Array]': 5,
        '[object RegExp]': 9,
        '[object Date]': 10
    };


    /**
     * 'string': 0,
     * 'number': 1,
     * 'boolean': 2,
     * 'object': 3,
     * 'function': 4,
     * 'array': 5,
     * 'null': 6,
     * 'undefined': 7,
     * 'NaN': 8,
     * 'regexp': 9,
     * 'date': 10,
     * unknown: -1
     * @param {*} value
     * @returns {number}
     */
    return function varType(val) {

        if (!val) {
            if (val === null) {
                return 6;
            }
            if (val === undf) {
                return 7;
            }
        }

        var num = types[toString.call(val)];

        if (num === undf) {
            return -1;
        }

        if (num == 1 && isNaN(val)) {
            return 8;
        }

        return num;
    };

}();



function isPlainObject(value) {
    // IE < 9 returns [object Object] from toString(htmlElement)
    return typeof value == "object" &&
           varType(value) === 3 &&
            !value.nodeType &&
            value.constructor === Object;

};

function isBool(value) {
    return value === true || value === false;
};




var extend = function(){

    /**
     * @param {Object} dst
     * @param {Object} src
     * @param {Object} src2 ... srcN
     * @param {boolean} override = false
     * @param {boolean} deep = false
     * @returns {object}
     */
    var extend = function extend() {


        var override    = false,
            deep        = false,
            args        = slice.call(arguments),
            dst         = args.shift(),
            src,
            k,
            value;

        if (isBool(args[args.length - 1])) {
            override    = args.pop();
        }
        if (isBool(args[args.length - 1])) {
            deep        = override;
            override    = args.pop();
        }

        while (args.length) {
            if (src = args.shift()) {
                for (k in src) {

                    if (src.hasOwnProperty(k) && (value = src[k]) !== undf) {

                        if (deep) {
                            if (dst[k] && isPlainObject(dst[k]) && isPlainObject(value)) {
                                extend(dst[k], value, override, deep);
                            }
                            else {
                                if (override === true || dst[k] == undf) { // == checks for null and undefined
                                    if (isPlainObject(value)) {
                                        dst[k] = {};
                                        extend(dst[k], value, override, true);
                                    }
                                    else {
                                        dst[k] = value;
                                    }
                                }
                            }
                        }
                        else {
                            if (override === true || dst[k] == undf) {
                                dst[k] = value;
                            }
                        }
                    }
                }
            }
        }

        return dst;
    };

    return extend;
}();


/**
 * @class Base
 * @extends BaseClass
 */
var Base = cs.define({

    $constructor: function(cfg) {
        extend(this, cfg, true, false);
        this.$super(cfg);
    },

    /**
     * @method
     * @param {string} name
     * @returns {*}
     */
    pcall: function(name) {

        if (this.file) {
            return this.file.pcall.apply(this.file, arguments);
        }
        else if (this.doc) {
            arguments[0] = "*." + arguments[0];
            return this.doc.pcall.apply(this.doc, arguments);
        }

        return null;
    },

    /**
     * @method
     * @param {string} name
     * @param {bool} collect
     * @param {function} passthru
     * @param {bool} merge
     * @returns {*}
     */
    pget: function(name, collect, passthru, merge) {

        if (this.file) {
            return this.file.pget.apply(this.file, arguments);
        }
        else if (this.doc) {
            arguments[0] = "*." + arguments[0];
            return this.doc.pget.apply(this.doc, arguments);
        }

        return null;
    }
});




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



var fs = require("fs"),
    path = require("path");

var Content = Base.$extend({

    id: null,
    location: null,
    type: null,
    groupName: null,
    content: null,
    title: null,
    file: null,
    contentType: null,

    $init: function(cfg) {

        var self = this;

        extend(self, cfg, true, false);

        if (self.file && !self.contentType) {
            self.contentType = path.extname(self.file).substr(1);
        }

        self.$super();
    },

    getContent: function() {

        if (this.file) {
            return fs.readFileSync(this.file).toString().trim();
        }
        else {
            return this.content;
        }
    },

    exportData: function() {

        var self = this;

        return {
            isContentItem: true,
            id: self.id,
            title: self.title,
            type: self.type,
            groupName: self.groupName,
            contentType: self.contentType,
            content: self.getContent()
        };

    }

});



var isFile = function(filePath) {
    return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
};




var isDir = function(dirPath) {
    return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
};



var getFileList = function(directory, ext) {

    var fileList,
        filePath,
        levels = 0,
        files = [];

    if (!directory) {
        return [];
    }


    if (directory.substr(directory.length - 1) == "*") {
        levels++;
    }
    if (directory.substr(directory.length - 2) == "**") {
        levels++;
    }

    if (levels) {
        directory = directory.substr(0, directory.length - (levels + 1));
    }
    directory = path.normalize(directory);

    var readDir = function(dir) {
        fileList    = fs.readdirSync(dir);

        fileList.forEach(function(filename) {
            filePath = path.normalize(dir + "/" + filename);

            if (isFile(filePath)) {

                if (!ext) {
                    files.push(filePath);
                }
                else if (typeof ext == "string" && path.extname(filePath).substr(1) == ext) {
                    files.push(filePath);
                }
                else if (typeof ext != "string" && path.extname(filePath).substr(1).match(ext)) {
                    files.push(filePath);
                }
            }
            else if (isDir(filePath) && levels > 1) {
                readDir(filePath);
            }
        });
    };


    if (levels > 0 || isDir(directory)) {
        readDir(directory);
    }
    else {
        files    = [directory];
    }

    return files;
};



var Flag = Base.$extend({

    name: null,
    type: null,
    content: null,
    props: null,
    file: null,

    $init: function(name, content, type, props, file) {

        var ct,
            self = this;

        self.file = file;
        self.name = name;

        if (content && typeof content == "object") {
            type = content.type;
            ct = content.contentType;
            content = content.content;
        }

        type = type || (typeof content);

        self.props = props || {};

        if (type == "file") {
            self.props["fromFile"] = content;
            self.props["fileType"] = path.extname(content).substr(1);
            content = fs.readFileSync(content).toString();
            type = ct || "string";
        }

        self.type = type;
        self.content = content;
    },

    setType: function(type) {
        this.type = type;
    },

    setContent: function(content) {
        this.content = content;
    },

    setProperty: function(name, value){
        this.props[name] = value;
    },

    getProperty: function(name) {
        return this.props[name];
    },

    exportData: function() {

        var exportData = this.pget("flag." + this.type + ".exportData");

        if (exportData) {
            return exportData(this);
        }

        return extend({}, {
            contentType: this.type,
            content: this.content,
            template: this.file.ext + ".flag." + this.name

        }, this.props);

    }

});



/**
 * @param {*} value
 * @returns {boolean}
 */
function isArray(value) {
    return typeof value == "object" && varType(value) === 5;
};


function emptyFn(){};




var Item = (function(){


    var Item = Base.$extend({

        doc: null,
        file: null,
        type: null,
        name: null,
        fullName: null,
        items: null,
        flags: null,
        comment: null,
        line: null,
        props: null,
        parent: null,
        level: 0,



        $init: function() {

            var self = this;

            self.items = {};
            self.flags = {};

            self.$super();

            if (self.name) {
                self.setName(self.name);
            }
        },

        isRoot: function() {
            return this.level == 0;
        },


        pcall: function(name) {
            arguments[0] = "item." + this.type + "." + arguments[0];
            if (this.file) {
                return this.file.pcall.apply(this.file, arguments);
            }
            else {
                arguments[0] = "*." + arguments[0];
                return this.doc.pcall.apply(this.doc, arguments);
            }
        },

        pget: function(name, collect, passthru) {
            arguments[0] = "item." + this.type + "." + arguments[0];
            if (this.file) {
                return this.file.pget.apply(this.file, arguments);
            }
            else {
                arguments[0] = "*." + arguments[0];
                return this.doc.pcall.apply(this.doc, arguments);
            }
        },

        getTypeProps: function() {
            if (!this.props) {
                this.props = this.file.pcall("getItemType", this.type, this.file);
            }
            return this.props;
        },

        getItem: function(type, name, last) {
            var list = this.items[type],
                ret = null;

            if (!list) {
                return null;
            }

            list.forEach(function(item){
                if (item.name == name) {
                    ret = item;
                    if (!last) {
                        return false;
                    }
                }
            });

            return ret;
        },

        addItem: function(item) {

            var type = item.type,
                self = this,
                items = self.items;

            if (!items[type]) {
                items[type] = [];
            }

            if (!item.parent) {
                item.parent = self;
            }

            item.level = self.level + 1;

            items[type].push(item);
        },

        hasFlag: function(flag) {
            return this.flags.hasOwnProperty(flag);
        },

        addFlag: function(flag, content, type, props) {

            var self = this;

            if (self.type == "root") {
                return;
            }

            var prepared = self.pcall(flag + ".prepare", flag, content, self);

            if (prepared) {
                content = prepared;
            }

            var abort = false;

            self.pget(flag + ".add", false, function(fn){
                var res = fn(flag, content, self);
                if (res !== true) {
                    if (res === false) {
                        abort = true;
                    }
                    return false;
                }
            });

            if (abort || flag == self.type) {
                return;
            }

            var added = [],
                f;

            if (!self.flags.hasOwnProperty(flag)) {
                self.flags[flag] = [];
            }
            if (isArray(content)) {
                content.forEach(function(content){
                    f = content instanceof Flag ?
                            content :
                            new Flag(flag, content, type, props, self.file);
                    self.flags[flag].push(f);
                    added.push(f);
                });
            }
            else {
                f = content instanceof Flag ?
                        content :
                        new Flag(flag, content, type, props, self.file);
                self.flags[flag].push(f);
                added.push(f);
            }

            added.forEach(function(f) {
                self.pcall(flag + ".added", f, self);
            });

            return added;
        },

        setName: function(name) {
            this.name = name;
        },

        setFullName: function(name) {

            var self = this;

            if (name && (!self.fullName || self.fullName != name)) {
                self.fullName = name;
                self.doc.addUniqueItem(self);
            }
        },


        applyInheritance: function() {

            var self = this,
                doc = self.doc,
                flags = self.flags;

            self.applyInheritance = emptyFn;

            ["extends", "implements", "mixes"].forEach(function(flag){
                if (flags.hasOwnProperty(flag)) {
                    flags[flag].forEach(function(parentClass){

                        parentClass = typeof parentClass == "string" ? parentClass : parentClass.ref;

                        var parent = doc.getItem(parentClass);

                        if (parent) {
                            parent.applyInheritance();
                            self.inheritFrom(parent);
                        }
                    });
                }
            });
        },

        inheritFrom: function(parent) {

            var self = this;

            parent.eachItem(function(item){

                if (!self.getItem(item.type, item.name)) {
                    self.addItem(item);
                }
            }, null, true);
        },




        getInheritedParents: function() {

            var parents = [],
                self = this,
                doc = self.doc,
                flags = ["extends", "implements", "mixes"];

            flags.forEach(function(flag){

                if (self.flags.hasOwnProperty(flag)) {
                    self.flags[flag].forEach(function(flagObj){

                        var item = doc.getItem(flagObj.getProperty("ref"));

                        if (item) {
                            parents.push(item);
                        }
                    });
                }
            });

            return parents;
        },

        getParents: function() {

            var parents = [],
                parent = this.parent;

            while (parent) {
                parents.push(parent);
                parent = parent.parent;
            }

            return parents;
        },

        getParentNamespace: function() {

            var parents     = this.getParents(),
                getProps    = this.file.pget("getItemType"),
                i, l,
                props;

            for (i = 0, l = parents.length; i < l; i++) {
                props = getProps(parents[i].type, this.file);
                if (props.namespace) {
                    return parents[i];
                }
            }
        },

        findItem: function(name, type, thisOnly) {

            var found = [];

            this.eachItem(function(item){

                if (name == item.name) {

                    if (type) {
                        if (typeof type == "string") {
                            if (type != item.type) {
                                return;
                            }
                        }
                        else {
                            if (type.indexOf(item.type) == -1) {
                                return;
                            }
                        }
                    }

                    found.push(item);
                }
            }, null, thisOnly);

            return found;
        },


        resolveFullName: function() {

            var self = this;

            if (self.type == "root") {
                return;
            }

            if (!self.fullName) {
                self.setFullName(self.pcall("getFullName", self));
            }
        },

        resolveInheritanceNames: function() {
            this.resolveNames(["extends", "implements", "mixes"]);
        },

        resolveOtherNames: function() {
            this.resolveNames(null, ["extends", "implements", "mixes"]);
        },

        resolveNames: function(flags, notFlags) {

            var self = this, k;

            if (!flags) {
                flags = [];
                for (k in self.flags) {
                    if (self.flags.hasOwnProperty(k)) {
                        flags.push(k);
                    }
                }
            }

            flags.forEach(function(k) {

                if (notFlags && notFlags.indexOf(k) != -1) {
                    return;
                }

                if (self.flags.hasOwnProperty(k)) {
                    self.flags[k].forEach(function (flag) {

                        var res = self.pcall(k + ".resolveName", self, k, flag.content);

                        if (res) {
                            flag.setType("typeRef");
                            flag.setProperty("ref", res);
                        }
                    });
                }
            });
        },

        getChildren: function() {
            var children = [];
            this.eachChild(function(item){
                children.push(item);
            });
            return children;
        },

        eachChild: function(fn, context) {
            this.eachItem(fn, context, true);
        },

        eachItem: function(fn, context, thisOnly) {

            var k, self = this;

            for (k in self.items) {
                self.items[k].forEach(function(item) {

                    if (typeof fn == "function") {
                        fn.call(context, item);
                    }
                    else {
                        if (fn.indexOf(".") == -1) {
                            item[fn]();
                        }
                        else {
                            item.pcall(fn, item);
                        }
                    }

                    if (!thisOnly) {
                        item.eachItem(fn, context);
                    }
                });
            }
        },

        eachFlag: function(cb, context, only) {
            var self = this,
                name;

            for (name in self.flags) {
                if (!only || name == only) {
                    self.flags[name].forEach(function(flag){
                        return cb.call(context, name, flag);
                    });
                }
            }
        },


        exportData: function(currentParent, noChildren, noHelpers) {

            var exportData = this.pget("exportData");

            if (exportData) {
                return exportData(this, noChildren);
            }


            var self = this,
                k,
                exprt =  {
                    isApiItem: true,
                    type: self.type,
                    name:  self.name,
                    fullName: self.fullName,
                    file: self.file.exportPath,
                    originalFile: self.file.path,
                    fileType: self.file.ext,
                    template: self.file.ext + ".item." + self.type,
                    level: self.level,
                    flags: {},
                    plainFlags: {},
                    booleanFlags: [],
                    children: [],
                    childTypes: []
                };

            if (self.comment) {
                exprt.line = self.comment.line;
            }

            if (currentParent && currentParent !== self.parent) {
                exprt.inheritedFrom = self.parent.fullName;
            }

            if (self.flags.description) {
                exprt.description = [];
                self.flags.description.forEach(function(flag){
                    exprt.description.push(flag.exportData(noHelpers));
                });
            }

            for (k in self.flags) {
                if (self.flags.hasOwnProperty(k) && k != "description") {

                    self.flags[k].forEach(function(flag){
                        if (flag.type == "boolean") {
                            exprt.booleanFlags.push(flag.name);
                        }
                        else {
                            if (!exprt.flags[k]) {
                                exprt.flags[k] = [];
                            }
                            if (!exprt.plainFlags[k]) {
                                exprt.plainFlags[k] = [];
                            }
                            exprt.flags[k].push(flag.exportData(noHelpers));
                            exprt.plainFlags[k].push(flag.content);
                        }
                    });
                }
            }

            if (!noChildren) {
                extend(exprt, self.exportChildren(self.getChildren(), noHelpers), true, false);
            }

            return exprt;
        },

        exportChildren: function(items, noHelpers) {

            var self = this,
                exprt = {
                    children: [],
                    childTypes: []
                },
                chGroups = {},
                typeProps;

            if (!noHelpers) {
                exprt.getChildren = function(type) {
                    var i, l;
                    for (i = 0, l = this.children.length; i < l; i++) {
                        if (this.children[i].type == type) {
                            return this.children[i].items;
                        }
                    }
                };
            }

            items.forEach(function (child) {

                if (child.file.hidden) {
                    return;
                }

                var type = child.type;

                if (!chGroups[type]) {

                    typeProps = child.getTypeProps();

                    chGroups[type] = {
                        isApiGroup: true,
                        type: type,
                        name: typeProps.displayName,
                        groupName: typeProps.groupName,
                        items: []
                    };
                    exprt.children.push(chGroups[type]);
                    exprt.childTypes.push(type);
                }


                chGroups[type].items.push(child.exportData(self, false, noHelpers));

            });

            return exprt;
        },

        destroy: function() {

            var k, i, l, items, flags, self = this;

            for (k in self.items) {
                items = self.items[k];
                for (i = 0, l = items.length; i < l; i++) {
                    items[i].$destroy();
                }
            }

            for (k in self.flags) {
                flags = self.flags[k];
                for (i = 0, l = flags.length; i < l; i++) {
                    flags[i].$destroy();
                }
            }
        }

    });


    return Item;


}());


function hideLinks(comment) {

    comment = comment.replace(/{\s*@(link|tutorial|code|page)[^{@]+}/ig, function(match){
        if (match.substr(match.length - 2) == '\\') {
            return match;
        }
        return '[#' + match.substring(2, match.length - 1) + ']';
    });

    return comment;

};



var SourceFile = function(){

    var all = {};

    /**
     * @class
     * @extends Base
     */
    var SourceFile = Base.$extend({


        /**
         * @type string
         */
        path: null,

        /**
         * @type string
         */
        exportPath: null,

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

        /**
         * @type {string}
         */
        content: null,

        /**
         * @type {object}
         */
        tmp: null,

        /**
         * @type {object}
         */
        options: null,

        /**
         * @type {bool}
         */
        hidden: false,

        $init: function() {

            var self = this;

            if (self.ext != "*") {

                self.contextStack = [self.doc.root];
                self.comments = [];
                self.tmp = {};
                self.dir = path.dirname(self.path);
                self.ext = path.extname(self.path).substr(1);

                self.hidden = self.options.hidden || false;

                if (self.options.basePath) {
                    self.exportPath = self.path.replace(self.options.basePath, "");
                }
                else {
                    self.exportPath = self.path;
                }
            }

        },

        pcall: function(name) {
            arguments[0] = "file." + this.ext + "." + arguments[0];
            return this.doc.pcall.apply(this.doc, arguments);
        },

        pget: function(name, collect, passthru, exact, merge) {
            arguments[0] = "file." + this.ext + "." + arguments[0];
            return this.doc.pget.apply(this.doc, arguments);
        },


        getContent: function () {
            if (!this.content) {
                this.content = fs.readFileSync(this.path).toString();
            }
            return this.content;
        },

        parse: function () {
            this.parseComments();
            this.processComments();
            this.content = '';
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

            if (part.flag == "md-apply") {
                context = fixedContext || self.getCurrentContext();
                var tmp = self.tmp[part.content];
                if (tmp) {
                    self.processComments([tmp], context);
                }
                return null;
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
                context.addItem(item);

                if (typeProps.children.length && typeProps.stackable !== false && !fixedContext) {
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

                if (!isItem && requiredContext && requiredContext.indexOf(context.type) != -1) {
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

            var res = this.pcall("item."+ type +"." + type + ".parse", type, part.content, comment);

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


    }, {

        get: function(filePath, doc, options) {


            if (!all[filePath]) {
                all[filePath] = new SourceFile({
                    path: filePath,
                    doc: doc,
                    options: extend({}, options)
                });
            }
            return all[filePath];
        },

        clear: function() {
            all = {};
        }

    });

    return SourceFile;

}();

var strUndef = "undefined";



var Cache = function(){

    var globalCache;

    /**
     * @class Cache
     * @param {bool} cacheRewritable
     * @constructor
     */
    var Cache = function(cacheRewritable) {

        var storage = {},

            finders = [];

        if (arguments.length == 0) {
            cacheRewritable = true;
        }

        return {

            /**
             * @param {function} fn
             * @param {object} context
             * @param {bool} prepend
             */
            addFinder: function(fn, context, prepend) {
                finders[prepend? "unshift" : "push"]({fn: fn, context: context});
            },

            /**
             * @method
             * @param {string} name
             * @param {*} value
             * @param {bool} rewritable
             * @returns {*} value
             */
            add: function(name, value, rewritable) {

                if (storage[name] && storage[name].rewritable === false) {
                    return storage[name];
                }

                storage[name] = {
                    rewritable: typeof rewritable != strUndef ? rewritable : cacheRewritable,
                    value: value
                };

                return value;
            },

            /**
             * @method
             * @param {string} name
             * @returns {*}
             */
            get: function(name) {

                if (!storage[name]) {
                    if (finders.length) {

                        var i, l, res,
                            self = this;

                        for (i = 0, l = finders.length; i < l; i++) {

                            res = finders[i].fn.call(finders[i].context, name, self);

                            if (res !== undf) {
                                return self.add(name, res, true);
                            }
                        }
                    }

                    return undf;
                }

                return storage[name].value;
            },

            /**
             * @method
             * @param {string} name
             * @returns {*}
             */
            remove: function(name) {
                var rec = storage[name];
                if (rec && rec.rewritable === true) {
                    delete storage[name];
                }
                return rec ? rec.value : undf;
            },

            /**
             * @method
             * @param {string} name
             * @returns {boolean}
             */
            exists: function(name) {
                return !!storage[name];
            },

            /**
             * @param {function} fn
             * @param {object} context
             */
            eachEntry: function(fn, context) {
                var k;
                for (k in storage) {
                    fn.call(context, storage[k].value, k);
                }
            },

            /**
             * @method
             */
            destroy: function() {

                var self = this;

                if (self === globalCache) {
                    globalCache = null;
                }

                storage = null;
                cacheRewritable = null;

                self.add = null;
                self.get = null;
                self.destroy = null;
                self.exists = null;
                self.remove = null;
            }
        };
    };

    /**
     * @method
     * @static
     * @returns {Cache}
     */
    Cache.global = function() {

        if (!globalCache) {
            globalCache = new Cache(true);
        }

        return globalCache;
    };

    return Cache;

}();



var globalCache = Cache.global();

var generateNames = function(name) {

    var list        = [],
        path        = name.split("."),
        strategy    = path[0];


    if (strategy == "file") {

        var max         = path.length - 3,
            last        = path.length - 2,
            exts        = [path[1], '*'],
            tmp, i, j, z, ext, e;

        for (e = 0; e < 2; e++) {

            ext = exts[e];
            tmp = path.slice();
            tmp[1] = ext;
            list.push(tmp.join("."));

            for (j = 1; j <= max; j++) {

                for (i = last; i >= 3; i--) {
                    tmp = path.slice();
                    tmp[1] = ext;
                    for (z = 0; z < j && i - z >= 3; z++) {
                        tmp[i - z] = "*";
                    }
                    list.push(tmp.join("."));
                }
            }
        }
    }
    else {
        list.push(name);
    }

    return list.filter(function(value, index, self){
        return self.indexOf(value) === index;
    });
};


var nextUid = function(){
    var uid = ['0', '0', '0'];

    // from AngularJs
    /**
     * @returns {String}
     */
    return function nextUid() {
        var index = uid.length;
        var digit;

        while(index) {
            index--;
            digit = uid[index].charCodeAt(0);
            if (digit == 57 /*'9'*/) {
                uid[index] = 'A';
                return uid.join('');
            }
            if (digit == 90  /*'Z'*/) {
                uid[index] = '0';
            } else {
                uid[index] = String.fromCharCode(digit + 1);
                return uid.join('');
            }
        }
        uid.unshift('0');
        return uid.join('');
    };
}();


/**
 * @param {Function} fn
 * @param {*} context
 */
var bind = Function.prototype.bind ?
              function(fn, context){
                  return fn.bind(context);
              } :
              function(fn, context) {
                  return function() {
                      return fn.apply(context, arguments);
                  };
              };



function isFunction(value) {
    return typeof value == 'function';
};




var ObservableEvent = (function(){

    /**
     * This class is private - you can't create an event other than via Observable.
     * See Observable reference.
     * @class ObservableEvent
     * @private
     */
    var ObservableEvent = function(name, returnResult, autoTrigger, triggerFilter, filterContext) {

        var self    = this;

        self.name           = name;
        self.listeners      = [];
        self.map            = {};
        self.hash           = nextUid();
        self.uni            = '$$' + name + '_' + self.hash;
        self.suspended      = false;
        self.lid            = 0;

        if (typeof returnResult == "object" && returnResult !== null) {
            extend(self, returnResult, true, false);
        }
        else {
            self.returnResult = returnResult === undf ? null : returnResult; // first|last|all
            self.autoTrigger = autoTrigger;
            self.triggerFilter = triggerFilter;
            self.filterContext = filterContext;
        }
    };


    extend(ObservableEvent.prototype, {

        name: null,
        listeners: null,
        map: null,
        hash: null,
        uni: null,
        suspended: false,
        lid: null,
        returnResult: null,
        autoTrigger: null,
        lastTrigger: null,
        triggerFilter: null,
        filterContext: null,

        /**
         * Get event name
         * @method
         * @returns {string}
         */
        getName: function() {
            return this.name;
        },

        /**
         * @method
         */
        destroy: function() {
            var self        = this,
                k;

            for (k in self) {
                self[k] = null;
            }
        },

        /**
         * @method
         * @param {function} fn Callback function { @required }
         * @param {object} context Function's "this" object
         * @param {object} options See Observable's on()
         */
        on: function(fn, context, options) {

            if (!fn) {
                return null;
            }

            context     = context || null;
            options     = options || {};

            var self        = this,
                uni         = self.uni,
                uniContext  = context || fn;

            if (uniContext[uni] && !options.allowDupes) {
                return null;
            }

            var id      = ++self.lid,
                first   = options.first || false;

            uniContext[uni]  = id;


            var e = {
                fn:         fn,
                context:    context,
                uniContext: uniContext,
                id:         id,
                called:     0, // how many times the function was triggered
                limit:      0, // how many times the function is allowed to trigger
                start:      1, // from which attempt it is allowed to trigger the function
                count:      0, // how many attempts to trigger the function was made
                append:     null, // append parameters
                prepend:    null // prepend parameters
            };

            extend(e, options, true, false);

            if (first) {
                self.listeners.unshift(e);
            }
            else {
                self.listeners.push(e);
            }

            self.map[id] = e;

            if (self.autoTrigger && self.lastTrigger && !self.suspended) {
                var prevFilter = self.triggerFilter;
                self.triggerFilter = function(l){
                    if (l.id == id) {
                        return prevFilter ? prevFilter(l) !== false : true;
                    }
                    return false;
                };
                self.trigger.apply(self, self.lastTrigger);
                self.triggerFilter = prevFilter;
            }

            return id;
        },

        /**
         * @method
         * @param {function} fn Callback function { @required }
         * @param {object} context Function's "this" object
         * @param {object} options See Observable's on()
         */
        once: function(fn, context, options) {

            options = options || {};
            options.limit = 1;

            return this.on(fn, context, options);
        },

        /**
         * @method
         * @param {function} fn Callback function { @required }
         * @param {object} context Function's "this" object
         */
        un: function(fn, context) {

            var self        = this,
                inx         = -1,
                uni         = self.uni,
                listeners   = self.listeners,
                id;

            if (fn == parseInt(fn)) {
                id      = fn;
            }
            else {
                context = context || fn;
                id      = context[uni];
            }

            if (!id) {
                return false;
            }

            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i].id == id) {
                    inx = i;
                    delete listeners[i].uniContext[uni];
                    break;
                }
            }

            if (inx == -1) {
                return false;
            }

            listeners.splice(inx, 1);
            delete self.map[id];
            return true;
        },

        /**
         * @method hasListener
         * @return bool
         */

        /**
         * @method
         * @param {function} fn Callback function { @required }
         * @param {object} context Function's "this" object
         * @return bool
         */
        hasListener: function(fn, context) {

            var self    = this,
                listeners   = self.listeners,
                id;

            if (fn) {

                context = context || fn;

                if (!isFunction(fn)) {
                    id  = fn;
                }
                else {
                    id  = context[self.uni];
                }

                if (!id) {
                    return false;
                }

                for (var i = 0, len = listeners.length; i < len; i++) {
                    if (listeners[i].id == id) {
                        return true;
                    }
                }

                return false;
            }
            else {
                return listeners.length > 0;
            }
        },


        /**
         * @method
         */
        removeAllListeners: function() {
            var self    = this,
                listeners = self.listeners,
                uni     = self.uni,
                i, len;

            for (i = 0, len = listeners.length; i < len; i++) {
                delete listeners[i].uniContext[uni];
            }
            self.listeners   = [];
            self.map         = {};
        },

        /**
         * @method
         */
        suspend: function() {
            this.suspended = true;
        },

        /**
         * @method
         */
        resume: function() {
            this.suspended = false;
        },


        _prepareArgs: function(l, triggerArgs) {
            var args;

            if (l.append || l.prepend) {
                args    = slice.call(triggerArgs);
                if (l.prepend) {
                    args    = l.prepend.concat(args);
                }
                if (l.append) {
                    args    = args.concat(l.append);
                }
            }
            else {
                args = triggerArgs;
            }

            return args;
        },

        /**
         * @method
         * @return {*}
         */
        trigger: function() {

            var self            = this,
                listeners       = self.listeners,
                returnResult    = self.returnResult,
                filter          = self.triggerFilter,
                filterContext   = self.filterContext,
                args;

            if (self.suspended) {
                return null;
            }

            if (self.autoTrigger) {
                self.lastTrigger = slice.call(arguments);
            }

            if (listeners.length == 0) {
                return null;
            }

            var ret     = returnResult == "all" || returnResult == "merge" ?
                          [] : null,
                q, l,
                res;

            if (returnResult == "first") {
                q = [listeners[0]];
            }
            else {
                // create a snapshot of listeners list
                q = slice.call(listeners);
            }

            // now if during triggering someone unsubscribes
            // we won't skip any listener due to shifted
            // index
            while (l = q.shift()) {

                // listener may already have unsubscribed
                if (!l || !self.map[l.id]) {
                    continue;
                }

                args = self._prepareArgs(l, arguments);

                if (filter && filter.call(filterContext, l, args, self) === false) {
                    continue;
                }

                l.count++;

                if (l.count < l.start) {
                    continue;
                }

                res = l.fn.apply(l.context, args);

                l.called++;

                if (l.called == l.limit) {
                    self.un(l.id);
                }

                if (returnResult == "all") {
                    ret.push(res);
                }
                else if (returnResult == "merge" && res) {
                    ret = ret.concat(res);
                }
                else if (returnResult == "first") {
                    return res;
                }
                else if (returnResult == "nonempty" && res) {
                    return res;
                }
                else if (returnResult == "last") {
                    ret = res;
                }
                else if (returnResult == false && res === false) {
                    return false;
                }
            }

            if (returnResult) {
                return ret;
            }
        }
    }, true, false);


    return ObservableEvent;
}());




var Observable = (function(){


    /**
     * @description A javascript event system implementing two patterns - observable and collector.
     * @description Observable:
     * @code examples/observable.js
     *
     * @description Collector:
     * @code examples/collector.js
     *
     * @class Observable
     * @version 1.1
     * @author johann kuindji
     * @link https://github.com/kuindji/metaphorjs-observable
     */
    var Observable = function() {

        this.events = {};

    };


    extend(Observable.prototype, {



        /**
        * You don't have to call this function unless you want to pass params other than event name.
        * Normally, events are created automatically.
        *
        * @method createEvent
        * @access public
        * @param {string} name {
        *       Event name
        *       @required
        * }
        * @param {bool|string} returnResult {
        *   false -- return first 'false' result and stop calling listeners after that<br>
        *   "all" -- return all results as array<br>
        *   "merge" -- merge all results into one array (each result must be array)<br>
        *   "first" -- return result of the first handler (next listener will not be called)<br>
        *   "last" -- return result of the last handler (all listeners will be called)<br>
        * }
        * @param {bool} autoTrigger {
        *   once triggered, all future subscribers will be automatically called
        *   with last trigger params
        *   @code examples/autoTrigger.js
        * }
        * @param {function} triggerFilter {
        *   This function will be called each time event is triggered. Return false to skip listener.
        *   @code examples/triggerFilter.js
        *   @param {object} listener This object contains all information about the listener, including
        *       all data you provided in options while subscribing to the event.
        *   @param {[]} arguments
        *   @return {bool}
        * }
        * @return {ObservableEvent}
        */

        /**
         * @method createEvent
         * @param {string} name
         * @param {object} options {
         *  @type {string} returnResult
         *  @param {bool} autoTrigger
         *  @param {function} triggerFilter
         * }
         * @param {object} filterContext
         * @returns {ObservableEvent}
         */
        createEvent: function(name, returnResult, autoTrigger, triggerFilter, filterContext) {
            name = name.toLowerCase();
            var events  = this.events;
            if (!events[name]) {
                events[name] = new ObservableEvent(name, returnResult, autoTrigger, triggerFilter, filterContext);
            }
            return events[name];
        },

        /**
        * @method
        * @access public
        * @param {string} name Event name
        * @return {ObservableEvent|undefined}
        */
        getEvent: function(name) {
            name = name.toLowerCase();
            return this.events[name];
        },

        /**
        * Subscribe to an event or register collector function.
        * @method
        * @access public
        * @param {string} name {
        *       Event name
        *       @required
        * }
        * @param {function} fn {
        *       Callback function
        *       @required
        * }
        * @param {object} context "this" object for the callback function
        * @param {object} options {
        *       You can pass any key-value pairs in this object. All of them will be passed to triggerFilter (if
        *       you're using one).
        *       @type {bool} first {
        *           True to prepend to the list of handlers
        *           @default false
        *       }
        *       @type {number} limit {
        *           Call handler this number of times; 0 for unlimited
        *           @default 0
        *       }
        *       @type {number} start {
        *           Start calling handler after this number of calls. Starts from 1
        *           @default 1
        *       }
         *      @type {[]} append Append parameters
         *      @type {[]} prepend Prepend parameters
         *      @type {bool} allowDupes allow the same handler twice
        * }
        */
        on: function(name, fn, context, options) {
            name = name.toLowerCase();
            var events  = this.events;
            if (!events[name]) {
                events[name] = new ObservableEvent(name);
            }
            return events[name].on(fn, context, options);
        },

        /**
        * Same as {@link Observable.on}, but options.limit is forcefully set to 1.
        * @method
        * @access public
        */
        once: function(name, fn, context, options) {
            options     = options || {};
            options.limit = 1;
            return this.on(name, fn, context, options);
        },


        /**
        * Unsubscribe from an event
        * @method
        * @access public
        * @param {string} name Event name
        * @param {function} fn Event handler
        * @param {object} context If you called on() with context you must call un() with the same context
        */
        un: function(name, fn, context) {
            name = name.toLowerCase();
            var events  = this.events;
            if (!events[name]) {
                return;
            }
            events[name].un(fn, context);
        },

        /**
         * @method hasListener
         * @access public
         * @return bool
         */

        /**
        * @method hasListener
        * @access public
        * @param {string} name Event name { @required }
        * @return bool
        */

        /**
        * @method
        * @access public
        * @param {string} name Event name { @required }
        * @param {function} fn Callback function { @required }
        * @param {object} context Function's "this" object
        * @return bool
        */
        hasListener: function(name, fn, context) {
            var events = this.events;

            if (name) {
                name = name.toLowerCase();
                if (!events[name]) {
                    return false;
                }
                return events[name].hasListener(fn, context);
            }
            else {
                for (name in events) {
                    if (events[name].hasListener()) {
                        return true;
                    }
                }
                return false;
            }
        },


        /**
        * Remove all listeners from all events
        * @method removeAllListeners
        * @access public
        */

        /**
        * Remove all listeners from specific event
        * @method
        * @access public
        * @param {string} name Event name { @required }
        */
        removeAllListeners: function(name) {
            var events  = this.events;
            if (!events[name]) {
                return;
            }
            events[name].removeAllListeners();
        },

        /**
        * Trigger an event -- call all listeners.
        * @method
        * @access public
        * @param {string} name Event name { @required }
        * @param {*} ... As many other params as needed
        * @return mixed
        */
        trigger: function() {

            var name = arguments[0],
                events  = this.events;

            name = name.toLowerCase();

            if (!events[name]) {
                return null;
            }

            var e = events[name];
            return e.trigger.apply(e, slice.call(arguments, 1));
        },

        /**
        * Suspend an event. Suspended event will not call any listeners on trigger().
        * @method
        * @access public
        * @param {string} name Event name
        */
        suspendEvent: function(name) {
            name = name.toLowerCase();
            var events  = this.events;
            if (!events[name]) {
                return;
            }
            events[name].suspend();
        },

        /**
        * @method
        * @access public
        */
        suspendAllEvents: function() {
            var events  = this.events;
            for (var name in events) {
                events[name].suspend();
            }
        },

        /**
        * Resume suspended event.
        * @method
        * @access public
        * @param {string} name Event name
        */
        resumeEvent: function(name) {
            name = name.toLowerCase();
            var events  = this.events;
            if (!events[name]) {
                return;
            }
            events[name].resume();
        },

        /**
        * @method
        * @access public
        */
        resumeAllEvents: function() {
            var events  = this.events;
            for (var name in events) {
                events[name].resume();
            }
        },

        /**
         * @method
         * @access public
         * @param {string} name Event name
         */
        destroyEvent: function(name) {
            var events  = this.events;
            if (events[name]) {
                events[name].removeAllListeners();
                events[name].destroy();
                delete events[name];
            }
        },


        /**
        * Destroy observable
        * @method
        * @md-not-inheritable
        * @access public
        */
        destroy: function() {
            var self    = this,
                events  = self.events;

            for (var i in events) {
                self.destroyEvent(i);
            }

            for (i in self) {
                self[i] = null;
            }
        },

        /**
        * Although all methods are public there is getApi() method that allows you
        * extending your own objects without overriding "destroy" (which you probably have)
        * @code examples/api.js
        * @method
        * @md-not-inheritable
        * @returns object
        */
        getApi: function() {

            var self    = this;

            if (!self.api) {

                var methods = [
                        "createEvent", "getEvent", "on", "un", "once", "hasListener", "removeAllListeners",
                        "trigger", "suspendEvent", "suspendAllEvents", "resumeEvent",
                        "resumeAllEvents", "destroyEvent"
                    ],
                    api = {},
                    name;

                for(var i =- 1, l = methods.length;
                        ++i < l;
                        name = methods[i],
                        api[name] = bind(self[name], self)){}

                self.api = api;
            }

            return self.api;

        }
    }, true, false);


    return Observable;
}());



/**
 * @mixin Observable
 */
ns.register("mixin.Observable", {

    /**
     * @type {Observable}
     */
    $$observable: null,
    $$callbackContext: null,

    $beforeInit: function(cfg) {

        var self = this;

        self.$$observable = new Observable;

        self.$initObservable(cfg);
    },

    $initObservable: function(cfg) {

        var self = this;

        if (cfg && cfg.callback) {
            var ls = cfg.callback,
                context = ls.context || ls.scope,
                i;

            ls.context = null;
            ls.scope = null;

            for (i in ls) {
                if (ls[i]) {
                    self.$$observable.on(i, ls[i], context || self);
                }
            }

            cfg.callback = null;

            if (context) {
                self.$$callbackContext = context;
            }
        }
    },

    on: function() {
        var o = this.$$observable;
        return o.on.apply(o, arguments);
    },

    un: function() {
        var o = this.$$observable;
        return o.un.apply(o, arguments);
    },

    once: function() {
        var o = this.$$observable;
        return o.once.apply(o, arguments);
    },

    trigger: function() {
        var o = this.$$observable;
        return o.trigger.apply(o, arguments);
    },

    $beforeDestroy: function() {
        this.$$observable.trigger("before-destroy", this);
    },

    $afterDestroy: function() {
        var self = this;
        self.$$observable.trigger("destroy", self);
        self.$$observable.destroy();
        self.$$observable = null;
    }
});









var Documentor = Base.$extend({

    $mixins: ["mixin.Observable"],

    files: null,
    root: null,
    hooks: null,
    id: null,
    map: null,
    content: null,
    typeSortCfg: null,
    itemSortCfg: null,
    contentSortCfg: null,
    sections: null,

    $init: function(cfg){

        var self = this;

        self.id         = nextUid();
        self.files      = {};
        self.map        = {};
        self.content    = [];
        self.sections   = ["top", "api", "bottom"];
        self.root       = new Item({
            doc:        self,
            type:       "root",
            file:       new SourceFile({
                ext:    "*",
                doc:    self
            })
        });

        extend(self, cfg, true, false);

        self.hooks      = new Cache(true);

        self.$super(cfg);
    },




    pcall: function(name) {
        var fn = this.pget(name),
            args = Array.prototype.slice.call(arguments, 1);

        return fn ? fn.apply(this, args) : null;
    },

    pcallExact: function(name) {
        var fn = this.pget(name, false, null, true),
            args = Array.prototype.slice.call(arguments, 1);

        return fn ? fn.apply(this, args) : null;
    },

    pget: function(name, collect, passthru, exact, merge) {

        var names = generateNames(name),
            ret = collect ? [] : null,
            self = this,
            id = self.id,
            value,
            stopped = false,
            i, l;

        if (exact) {
            names.length = 1;
        }

        [self.hooks, globalCache].forEach(function(cache){
            for (i = 0, l = names.length; i < l; i++) {

                if (stopped) {
                    return;
                }

                name = names[i];

                if (cache.exists(name)) {

                    value = cache.get(name);

                    if (typeof value == "function" && !value.hasOwnProperty(id)) {
                        value = function(fn){
                            return function(){
                                return fn.apply(self, arguments);
                            };
                        }(value);
                        value[id] = true;

                        cache.add(name, value);
                    }

                    if (value !== undf) {

                        if (collect) {
                            ret.push(value);
                        }
                        else if (passthru) {
                            if (passthru(value) === false) {
                                stopped = true;
                                return;
                            }
                        }
                        else {
                            ret = value;
                            stopped = true;
                            return;
                        }
                    }
                }
            }
        });

        if (collect && merge) {
            value = ret.shift();
            while (ret.length) {
                extend(value, ret.shift());
            }
            return value;
        }

        return ret;
    },



    getRenderer: function(name){
        return this.hooks.get("renderer." + name) ||
               globalCache.get("renderer." + name);
    },


    addUniqueItem: function(item) {

        var name = item.fullName;

        if (name && !this.map.hasOwnProperty(name)) {
            this.map[name] = item;
        }
    },

    getItem: function(name) {
        return this.map.hasOwnProperty(name) ? this.map[name] : null;
    },



    eat: function(directory, ext, options) {

        options = options || {};

        if (!ext) {
            throw "Extension required";
        }
        if (!directory) {
            throw "Directory or file required";
        }

        options.hidden = options.hidden === undf ? false : options.hidden;

        var self = this;

        if (isFile(directory)) {
            self.addFile(directory, extend({}, options, {
                startDir: path.dirname(directory)
            }));
        }
        else {
            var list = getFileList(directory, ext || "js");
            var startDir = directory;
            while (startDir.charAt(startDir.length - 1) == '/' ||
                   startDir.charAt(startDir.length - 1) == '*') {
                startDir = startDir.substring(0, startDir.length - 1);
            }

            list.forEach(function(file) {
                self.addFile(file, extend({}, options, {
                    startDir: startDir
                }));
            });
        }
    },

    addFile: function(filePath, options) {

        var self = this;

        options = options || {};

        var hidden = options.startDir && !options.includeExternal &&
                     filePath.indexOf(options.startDir) !== 0;

        if (!self.files[filePath]) {


            var file = SourceFile.get(filePath, self, extend({}, options, {
                hidden: hidden
            }, true, false));

            if (!options.hideIncludes) {
                self.resolveIncludes(file, options);
            }

            self.files[filePath] = file;

            file.parse();
        }
        else {
            // if file it not created but retrieved,
            // we reset hidden field
            if (hidden === false) {
                self.files[filePath].hidden = false;
            }
        }
    },

    resolveIncludes: function(file, options) {

        var self = this,
            includes = file.pcall("resolveIncludes", file);

        if (includes) {
            includes.forEach(function(include){
                self.addFile(include, options);
            });
        }
    },

    getFile: function(path) {
        return this.files[path];
    },

    addContent: function(cfg) {
        var self = this,
            c = cfg instanceof Content ? cfg : new Content(cfg);
        self.content.push(c);
        self.pcall("contentAdded", self, c);
    },

    prepare: function() {

        var self = this;

        self.pcall("beforePrepare", self);

        self.eachItem("resolveFullName");
        self.eachItem("resolveInheritanceNames");
        self.eachItem("applyInheritance");
        self.eachItem("resolveOtherNames");

        self.pcall("namesResolved", self);

        self.pcall("prepareItems", self);
        self.pcall("itemsPrepared", self);

        self.pcall("prepareContent", self);
        self.pcall("contentPrepared", self);

        self.pcall("file.*.sortItemTypes", self.root, self.typeSortCfg);
        self.pcall("file.*.sortItems", self.root, self.itemSortCfg);
        self.pcall("sortContent", self, self.contentSortCfg);

        self.pcall("afterPrepare", self);
    },


    eachItem: function(fn, context) {
        this.root.eachItem(fn, context);
    },



    loadHooks: function(dir) {

        var self = this,
            r = require;

        self.eachHook(dir, "js", function(name, file){
            self.hooks.add(name, r(file));
        });
    },

    eachHook: function(dir, ext, fn, context) {

        if (dir.substr(dir.length - 1) != '/') {
            dir += '/';
        }
        dir += '**';

        var list = getFileList(dir, ext);

        dir = dir.replace("**", "");

        list.forEach(function(file){

            fn.call(
                context,
                file.replace(dir, "").replace("." + ext, "").replace(/\//g, '.'),
                file
            );
        });

    },

    exportData: function(noHelpers) {

        var self = this,
            exportData = self.pget("export");

        if (exportData) {
            return exportData(self);
        }
        else {

            var exprt = {
                sections: {},
                structure: {}
            };

            var sectionItems = {};

            var addSection = function(section) {
                if (!exprt.sections[section]) {
                    exprt.sections[section] = [];
                }
                if (!sectionItems[section]) {
                    sectionItems[section] = [];
                }
            };

            var addStructItem = function(type, groupName, name, id) {
                if (!exprt.structure[type]) {
                    exprt.structure[type] = {
                        type: type,
                        groupName: groupName,
                        children: []
                    };
                }
                exprt.structure[type].children.push({
                    id: id,
                    name: name
                });
            };

            self.sections.forEach(addSection);

            var currentGroup;

            self.content.forEach(function(content){
                var location = content.location || "top";
                addSection(location);
                addStructItem(content.type, content.groupName, content.title, content.id);

                if (!currentGroup || currentGroup.type != content.type) {
                    currentGroup = {
                        isContentGroup: true,
                        type: content.type,
                        groupName: content.groupName,
                        items: []
                    };
                    exprt.sections[location].push(currentGroup);
                }

                currentGroup.items.push(content.exportData());
            });



            self.root.eachChild(function(item){
                if (item.file.hidden){
                    return;
                }
                var location    = item.location || "api",
                    typeProps   = item.getTypeProps();

                addSection(location);
                //exprt.sections[location].children.push(item.exportData());
                sectionItems[location].push(item);
                addStructItem(item.type, typeProps.groupName, item.name, item.fullName);
            });

            var loc;

            for (loc in sectionItems) {
                self.root.exportChildren(sectionItems[loc], noHelpers).children.forEach(function(ch){
                    exprt.sections[loc].push(ch);
                });
            }



            return exprt;
        }
    },

    destroy: function() {
        this.clear();
    },

    clear: function() {
        SourceFile.clear();

        var self = this;

        self.map = {};

        self.root.$destroy();

        for (var f in self.files) {
            if (self.files.hasOwnProperty(f)) {
                self.files[f].$destroy();
            }
        }

        self.content.forEach(function(content){
            content.$destroy();
        });

        self.content = [];
        self.files = {};
        self.root = null;
    }

});




var rUrl = /^((https?|ftp):\/\/|)(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:|@)|\/|\?)*)?$/i;



var eachLink = function(str, cmtItem, cb, context) {

    return str.replace(/\[#(link|tutorial|code|page)\s+([^\]]+)\]/ig,

        function(match, type, content){

            if (match.substr(match.length - 2) == '\\') {
                return match;
            }

            var name, url, item;


            if ((item = cmtItem.doc.getItem(content)) ||
                (item = cmtItem.findItem(content, null, true).shift()) ||
                (cmtItem.parent && (item = cmtItem.parent.findItem(content, null, true).shift()))) {

                if (item.file.hidden) {
                    return content;
                }

                name = item.name;
                url = '#' + item.fullName;
            }
            else {
                name = content.replace(rUrl, function(urlMatch){
                    url = urlMatch;
                    return "";
                });

                if (!name && url) {
                    name = url;
                }
            }

            return cb.call(context, type, name, url, match);
    });

};



var Renderer = Base.$extend({

    doc: null,
    outDir: null,
    templates: null,

    $init: function(doc, cfg) {

        var self = this;

        extend(self, cfg, true, false);

        self.doc = doc;

        self.doc.pcall("renderer.init", self, self.doc);

        self.resolveLinks();

        self.doc.pcall("renderer.linksResolved", self, self.doc);
    },

    initMetaphor: function(MetaphorJs) {

        MetaphorJs.error.on(function(e){
            self.doc.trigger("error", e);
        });

        MetaphorJs.ns.add("filter.markdown", this.doc.pget("markdown"));

        var self = this;

        MetaphorJs.ns.add("filter.typeRef", function(type) {

            var item;
            if ((item = self.doc.getItem(type)) && !item.file.hidden) {
                return '['+ item.name +'](#'+ item.fullName + ')';
            }
            else {
                return type;
            }
        });

        MetaphorJs.ns.add("filter.markdownLinks", function(str){

            return str.replace(/\[([^\]]+)\]\(([^\)]+)\)/i, function(match, name, url){
                return '<a href="'+ url +'">'+ name +'</a>';
            });
        });

        MetaphorJs.ns.add("filter.prismClass", function(fileType){

            if (fileType.indexOf('txt-') === 0) {
                fileType = fileType.split('-')[1];
            }

            switch (fileType) {
                case "js":
                case "json":
                    return "javascript";
                default:
                    return fileType;
            }
        });

        MetaphorJs.ns.add("filter.readFile", function(filePath){

            var path = self.runner.preparePath(filePath);

            if (!path) {
                self.doc.trigger("error", "File " + filePath + " not found!");
                return "";
            }

            return fs.readFileSync(path).toString();
        });

        self.doc.pcall("renderer.initMetaphor", MetaphorJs, self, self.doc);
    },

    loadTemplates: function(MetaphorJs, dir) {

        var self = this;

        self.doc.eachHook(dir, "html", function(name, file){
            MetaphorJs.Template.cache.add(name, fs.readFileSync(file).toString());
        });
    },

    runMetaphor: function(MetaphorJs, doc, data) {

        var self = this;

        self.doc.pcall("renderer.beforeMetaphor", MetaphorJs, self, self.doc);

        var select = require("metaphorjs-select")(doc.parentWindow),
            appNodes    = select("[mjs-app]", doc),
            i, l, el;

        for (i = -1, l = appNodes.length; ++i < l;){
            el = appNodes[i];
            MetaphorJs.initApp(el, MetaphorJs.getAttr(el, "mjs-app"), data, true);
        }

        self.doc.pcall("renderer.afterMetaphor", MetaphorJs, self, self.doc);
    },


    resolveLinks: function() {

        var self = this;

        self.doc.eachItem(function(item) {
            item.eachFlag(function(name, flag){
                if (flag.type == "typeRef") {
                    return '['+ flag.content +'](#'+ flag.ref +')';
                }
                if (typeof flag.content == "string") {
                    flag.content = eachLink(flag.content, item, function(type, name, url) {
                        return '['+ (name || url) +']('+ (url || name) +')';
                    });
                }
            });
        });

    },

    cleanupOutDir: function() {

    },

    copyToOut: function() {

    },

    writeOut: function(out, done) {
        if  (this.out) {
            fs.writeFileSync(this.out, out);
        }
        else {
            process.stdout.write(out);
        }

        if (done) {
            done();
        }
    },


    render: function() {

    }

});

var minimist = require("minimist"),
    
    
    
    mjsBuild = require("metaphorjs-build");

var Runner = Base.$extend({

    run: function(runCfg, runData, runOptions, errorCallback, doneCallback) {

        runCfg = runCfg || {};
        runData = runData || {};
        runOptions = runOptions || {};

        var self        = this,
            args        = minimist(process.argv.slice(2), {boolean: true}),
            profileName = runCfg.profile || args._[0] || "",
            json        = process.cwd() + "/metaphorjs.json",
            jsonFile    = fs.existsSync(json) ? new mjsBuild.JsonFile(json) : null,
            profile     = jsonFile && jsonFile.docs && jsonFile.docs[profileName] ?
                          jsonFile.docs[profileName] : {},
            data        = extend({}, profile.data, runData, true, false),
            cfg         = extend({}, profile, runCfg, true, false),
            options     = extend({}, profile.options, runOptions, true, false),
            doc;//         = new Documentor;

        delete cfg.data;
        delete cfg.options;

        self.jsonFile   = jsonFile;
        self.json       = json;

        extend(data, self.prepareArgsData(args), true, false);
        extend(options, self.prepareArgsOptions(args), true, false);
        extend(cfg, self.prepareArgsCfg(args), true, false);

        self.doc = doc  = new Documentor({
            itemSortCfg: cfg.itemSort,
            typeSortCfg: cfg.typeSort,
            contentSortCfg: cfg.contentSort
        });

        if (doneCallback) {
            doc.on("done", doneCallback);
        }

        if (errorCallback) {
            doc.on("error", errorCallback);
        }

        doc.on("error", function(e) {
            throw e;
        });

        if (cfg.init) {
            self.runInit(cfg, doc, jsonFile);
        }

        if (cfg.out) {
            cfg.out = self.preparePath(cfg.out, jsonFile, true);
            if (!cfg.out) {
                throw "Cannot write to " + cfg.out;
            }
        }

        if (cfg.hooks) {
            self.loadHooks(cfg, doc, jsonFile);
        }

        doc.pcall("init", doc);

        if (cfg.files && jsonFile) {
            self.loadFiles(cfg, doc, jsonFile);
        }

        if (cfg.src) {
            self.loadSrc(cfg, doc, jsonFile);
        }

        var rendererCls = doc.getRenderer(cfg.renderer || "default");

        if (!rendererCls) {
            throw "Cannot find renderer " + rendererCls;
        }

        doc.prepare();


        var renderer = new rendererCls(doc, extend({}, options, {

            data: data,
            out: cfg.out,
            runner: self

        }, true, false));

        renderer.writeOut(renderer.render(), function(){
            self.doc.trigger("done");
        });
    },

    runInit: function(cfg, doc, jsonFile) {

        var initFile = this.preparePath(cfg.init, jsonFile),
            r = require;

        if (initFile) {
            r(initFile)(doc);
        }
    },

    loadFiles: function(cfg, doc, jsonFile) {
        var build = new mjsBuild.Build(jsonFile);
        build.collectFiles(cfg);
        build.prepareBuildList();

        build.buildList.forEach(function(file){
            doc.addFile(file, {
                namePrefix: cfg.namePrefix,
                basePath: cfg.basePath
            });
        });
    },

    loadSrc: function(cfg, doc, jsonFile) {

        if (typeof cfg.src == "string") {
            cfg.src = [cfg.src];
        }

        var self = this;

        cfg.src.forEach(function(dirName){

            var dir = self.preparePath(dirName, jsonFile);

            if (dir) {
                doc.eat(dir, cfg.extension || "js", {
                    namePrefix: cfg.namePrefix,
                    basePath: cfg.basePath,
                    includeExternal: cfg.includeExternal
                });
            }
        });
    },


    loadHooks: function(cfg, doc, jsonFile) {

        if (typeof cfg.hooks == "string") {
            cfg.hooks = [cfg.hooks];
        }

        var self = this;

        cfg.hooks.forEach(function(hoorDir){

            var dir = self.preparePath(hoorDir, jsonFile);

            if (dir) {
                doc.loadHooks(dir);
            }
        });
    },



    prepareArgsData: function(args) {
        var data = {},
            k;

        for (k in args) {
            if (k.indexOf("data-") === 0) {
                data[k.replace("data-", "")] = args[k];
                delete args[k];
            }
        }

        return data;
    },

    prepareArgsOptions: function(args) {
        var options = {},
            k;

        for (k in args) {
            if (k.indexOf("option-") === 0) {
                options[k.replace("option-", "")] = args[k];
                delete args[k];
            }
        }

        return options;
    },

    prepareArgsCfg: function(args) {

        var cfg = {},
            k;

        for (k in args) {
            if (k != "_") {
                cfg[k] = args[k];
            }
        }

        return cfg;
    },

    preparePath: function(name, jsonFile, isFile) {

        var res,
            normName = name;

        jsonFile = jsonFile || this.jsonFile;

        if (isFile) {
            var tmp = name.split("/");
            tmp.pop();
            normName = tmp.join("/");
        }
        else {
            while (normName.charAt(normName.length - 1) == '/' ||
                   normName.charAt(normName.length - 1) == '*') {
                normName = normName.substring(0, normName.length - 1);
            }
        }

        if (jsonFile && fs.existsSync(path.normalize(jsonFile.base + normName))) {
            res = path.normalize(jsonFile.base + name);
        }
        else if (fs.existsSync(path.normalize(process.cwd() + "/" + normName))) {
            res = path.normalize(process.cwd() + "/" + name);
        }
        else if (fs.existsSync(path.normalize(normName))) {
            res = path.normalize(name);
        }

        return res;
    }

}, {

    run: function(runCfg, runData, runOptions, errorCallback, doneCallback) {

        var runner = new Runner;
        return runner.run(runCfg, runData, runOptions, errorCallback, doneCallback);

    }

});




var addAccessFlag = function(flag, content, item) {
    item.addFlag("access", flag);
    return false;
};

var addVarFlag = function(flag, content, item) {

    if (item.type == flag) {

        var res = item.pcall(flag + ".parse", flag, content, item.comment, item);

        if (res.name) {
            item.name = res.name;
        }
        if (res.description) {
            item.addFlag("description", res.description);
        }
        if (res.type) {
            item.addFlag("type", res.type);
        }

        return false;
    }
};

var parseVarFlag = function(flag, content, comment, item) {

    var file = comment ? comment.file : (item ? item.file : null);

    if (!file) {
        return {};
    }

    var getCurly = file.pget("comment.getCurly"),
        normalizeType = file.pget("normalizeType"),
        type, name,
        description,
        inx;

    if (content.charAt(0) == '{') {
        var curly = getCurly.call(this, content);
        type = normalizeType.call(this, curly, file);
        content = content.replace('{' + curly + '}', "").trim();
    }

    inx = content.indexOf(" ", 0);

    if (inx > -1) {
        name = content.substr(0, inx).trim();
        content = content.substr(inx).trim();

        if (content) {
            description = content;
        }
    }
    else if (content) {
        if (!type) {
            type = content;
        }
        else {
            name = content;
        }
    }


    return {
        name: name,
        type: type,
        description: description
    };
};

function resolveExtendableName(item, flag, content) {

    if (content.indexOf(".") != -1) {
        return content;
    }

    var find = {
        "extends": "class",
        "implements": "interface",
        "mixes": ["mixin", "trait"]
    };

    find = find.hasOwnProperty(flag) ? find[flag] : null;

    if (find) {
        var ns = item.getParentNamespace(),
            refs = ns.findItem(content, find);

        return refs.length ? refs[0].fullName : null;
    }

    return null;
};

function resolveTypeName(item, flag, content) {

    if (!content) {
        return null;
    }

    if (content.indexOf(".") != -1) {
        return content;
    }

    if (content == item.name) {
        return item.fullName;
    }

    var ns = item.getParentNamespace(),
        refs = ns ? ns.findItem(content) : [];

    return refs.length ? refs[0].fullName : null;
};

var generateTemplateNames = function(name){

    var list        = [],
        path        = name.split("."),
        max         = path.length - 2,
        last        = path.length - 1,
        exts        = [path[0], '*'],
        tmp, i, j, ext, e;

    for (e = 0; e < 2; e++) {

        ext = exts[e];
        tmp = path.slice();
        tmp[0] = ext;
        list.push(tmp.join("."));

        for (j = 1; j <= max; j++) {

            for (i = last; i > last - j; i--) {
                tmp[i] = "*";
                list.push(tmp.join("."));
            }
        }
    }

    return list.filter(function(value, index, self){
        return self.indexOf(value) === index;
    });
};




var initMetaphorTemplates = function(MetaphorJs){

    var cache = MetaphorJs.Template.cache,
        origGet = cache.get;

    cache.get = function(id){

        var names = generateTemplateNames(id),
            i, l,
            tpl;

        for (i = 0, l = names.length; i < l; i++) {

            if ((tpl = origGet(names[i])) !== undf) {
                return tpl;
            }
        }

        return undf;
    };

};

function createFunctionContext(commentPart, comment) {

    var res = comment.file.pcall("item.extractTypeAndName",
        comment.file, comment.endIndex, true, false);

    if (res) {
        return {flag: res[0], content: res[1], sub: []};
    }
};



var flagAliases = globalCache.add("file.*.comment.flagAliases", {

    "type": "var",
    "return": "returns",
    "extend": "extends",
    "implement": "implements",
    "emit": "emits",
    "throw": "throws"

});



var getCurly = globalCache.add("file.*.comment.getCurly", function(content, start, backwards, returnIndexes) {

    var left, right,
        i, l,
        first, last,
        char;

    if (!backwards) {

        left    = 0;
        right   = 0;
        i       = start || 0;
        l       = content.length;
        first   = null;

        for (; i < l; i++) {

            char = content.charAt(i);

            if (char == '{') {
                left++;
                if (first === null) {
                    first = i + 1;
                }
            }
            else if (char == '}' && first !== null) {
                right++;
            }

            if (left > 0 && left == right) {
                last = i;
                break;
            }
        }
    }
    else {

        left    = 0;
        right   = 0;
        i       = start || content.length - 1;
        last    = null;

        for (; i >= 0; i--) {

            char = content.charAt(i);

            if (char == '}') {
                right++;
                if (last === null) {
                    last = i;
                }
            }
            else if (char == '{' && last !== null) {
                left++;
            }

            if (left > 0 && left == right) {
                first = i + 1;
                break;
            }
        }
    }

    if (first && last) {
        if (returnIndexes) {
            return [first, last];
        }
        else {
            return content.substring(first, last);
        }
    }

    return null;
});



var getFlagAliases = globalCache.add("file.*.comment.getFlagAliases", function(file){

    var all = file.pget("comment.flagAliases", true),
        aliases = {},
        i, l;

    for (i = 0, l = all.length; i < l; i++) {
        extend(aliases, all[i]);
    }

    return aliases;
});



var parseComment = (function(){


    var parseComment = function(text, file) {

        var removeAsterisk = file.pget("comment.removeAsterisk"),
            getCurly = file.pget("comment.getCurly");


        text = removeAsterisk(text);

        var lines       = text.split("\n"),
            flagReg     = /@[^\s]+/,
            aliases     = file.pcall("comment.getFlagAliases", file),
            descrFlag   = aliases["description"] || "description",
            line,
            i, l, j,
            description = "",
            inx         = 0,
            parts       = [],
            partInx     = 0,
            part,
            flag,
            subInx,
            sub;

        for (i = 0, l = lines.length; i < l; i++) {

            if (i > 0) {
                inx = lines.slice(0, i).join("\n").length;
            }

            line = lines[i];
            part = line.trim();

            if (part == '{' || part == '}') {
                continue;
            }

            if (part.charAt(0) == '@') {

                if (description) {
                    parts.push({flag: descrFlag, content: description, sub: [], inx: partInx});
                    description = "";
                    partInx++;
                }

                sub     = null;
                flag    = null;

                if (part.charAt(part.length - 1) == '{') {

                    sub     = getCurly(text, inx + lines[i].length - 1);
                    part    = part.substring(0, part.length - 2).trim();
                    i      += sub.trim().split("\n").length + 1;
                }
                else if (part.charAt(part.length - 1) == '}') {

                    subInx  = getCurly(part, null, true, true);
                    if (subInx && (sub = part.substring(subInx[0], subInx[1])) &&
                        sub.match(flagReg)) {

                        part    = part.substr(0, subInx[0] - 1) + part.substr(subInx[1] + 1);
                        part    = part.trim();
                    }
                    else {
                        sub     = null;
                    }
                }
                else if (part.charAt(part.length - 1) != '}' &&
                         part.replace(flagReg, "").trim() != "") {

                    for (j = i + 1; j < l; j++) {
                        if (lines[j].trim().substr(0, 1) != '@') {
                            part += "\n" + lines[j];
                            i = j;
                        }
                        else {
                            break;
                        }
                    }
                }


                if (sub) {
                    sub = parseComment.call(this, sub, file);
                }

                part = part.replace(flagReg, function(match){
                    flag = match.substr(1);
                    return "";
                });

                part = part.trim();

                while (aliases.hasOwnProperty(flag)) {
                    flag = aliases[flag]
                }

                if (part == "") {
                    part = null;
                }

                parts.push({flag: flag, content: part, sub: sub || [], inx: partInx});
                partInx++;
            }
            else if (part) {
                if (description) {
                    description += "\n"
                }
                description += line;
            }
        }

        if (description) {
            parts.push({flag: descrFlag, content: description, sub: [], inx: partInx});
        }


        return parts;

    };


    return globalCache.add("file.*.comment.parseComment",  parseComment);
}());





var removeAsterisk = globalCache.add("file.*.comment.removeAsterisk", function(text) {

    text = text.replace("/**", '');
    text = text.replace("*/", '');
    //text = text.trim();

    var lines   = text.split("\n"),
        min     = 1000,
        newLines= [],
        aFound  = false,
        line,
        i, l,
        j, jl;

    for (i = 0, l = lines.length; i < l; i++) {

        line = lines[i].trim();

        if (line.charAt(0) == '*') {
            aFound  = true;
            line    = line.substr(1);
            newLines.push(line);

            for (j = 0, jl = line.length; j < jl; j++) {
                if (line.charAt(j) != " ") {
                    min = Math.min(min, j);
                    break;
                }
            }
        }
        else {
            newLines.push(null);
        }
    }

    if (!aFound) {

        newLines = [];

        for (i = 0, l = lines.length; i < l; i++) {

            line = lines[i];
            newLines.push(line);

            for (j = 0, jl = line.length; j < jl; j++) {
                if (line.charAt(j) != " ") {
                    min = Math.min(min, j);
                    break;
                }
            }
        }
    }

    for (i = 0; i < l; i++) {
        if (newLines[i] !== null) {
            newLines[i] = newLines[i].substr(min);
        }
        else {
            newLines[i] = lines[i];
        }
    }

    return newLines.join("\n");
});





var sortParts = globalCache.add("file.*.comment.sortParts", function(parts, comment) {

    var flagInx = {},
        items = comment.file.pget("items");

    if (!items) {
        return parts;
    }

    var reqCtx = comment.file.pget("item.?.requiredContext") || {};

    items.forEach(function(item, inx) {
        flagInx[item.name] = inx;
    });

    // flags sorted by a simple rule:
    // if flag has an item associated with it (class, method, var, etc) it goes higher
    // if flag does not have an item, but requires an item, it goes below items
    // the rest goes to the bottom
    parts.sort(function(a, b){

        // flag can be "constructor"
        // so we must check hasOwnProperty
        var aInx    = flagInx.hasOwnProperty(a.flag) ? flagInx[a.flag] : undefined,
            bInx    = flagInx.hasOwnProperty(b.flag) ? flagInx[b.flag] : undefined,
            aUndf   = typeof aInx == "undefined",
            bUndf   = typeof bInx == "undefined",
            aCtx    = reqCtx.hasOwnProperty(a.flag),
            bCtx    = reqCtx.hasOwnProperty(b.flag),
            aEnd    = a.flag.indexOf("end-") === 0,
            bEnd    = a.flag.indexOf("end-") === 0;

        if (aInx === bInx) {

            // if both are simple flags
            // we need to check if any of them
            // requires a context;
            // we put context aware flags above
            if (aUndf) {
                // we put all end-* flags to the bottom
                if ((aEnd || bEnd) && aEnd != bEnd) {
                    return aEnd ? 1 : -1;
                }
                if (aCtx === bCtx) {
                    return a.inx < b.inx ? -1 : 1;
                    //return 0;
                }
                return aCtx ? -1 : 1;
            }

            return a.inx < b.inx ? -1 : 1;
            //return 0;
        }
        else if (aUndf != bUndf) {
            return aUndf ? 1 : -1;
        }
        else {
            return aInx < bInx ? -1 : 1;
        }
    });

    return parts;
});



var getItemType = globalCache.add("file.*.getItemType", function(type, file) {

    var types = file.pget("items"),
        i, l;

    if (types) {
        for (i = 0, l = types.length; i < l; i++) {
            if (types[i].name == type) {
                return types[i];
            }
        }
    }

    return null;
});


var add = globalCache.add("file.*.item.*.*.add", function(flag, content, item) {

    if (item.type == flag && typeof content == "string" && content) {
        item.setName(content.trim());
        // stop cycle
        return false;
    }
});



var prepare = globalCache.add("file.*.item.*.*.prepare", function(flag, content, item) {

    if (content === null) {
        return true;
    }
});



globalCache.add("file.*.item.*.code.add", function(flag, content, item) {

    var f = item.file.resolveFlagFile(content);

    if (f === false) {
        item.addFlag("description", {
            type: "code",
            content: content
        }, null, {
            fileType: item.file.ext
        });
    }
    else {
        item.addFlag("description", {
            type: "file",
            contentType: "code",
            content: f
        });
    }

    return false;
});



globalCache.add("file.*.item.*.description.add", function(flag, content, item) {


    if (typeof content == "string") {
        content = {
            type: "string",
            content: content
        };
    }

    if (content.type != "string") {
        return;
    }

    var text = content.content,
        files = [];

    text = text.replace(/\[#code\s+([^\[]+)\]/, function(match, file){

        var f = item.file.resolveFlagFile(file);

        if (f === false) {
            return match;
        }

        files.push(f);
        return "--#--";
    });

    if (!files.length) {
        return;
    }

    text = text.split('--#--');

    var pushTextPart = function(inx) {
        var txt = text[inx].trim();

        if (txt) {
            item.addFlag("description", {
                type: "string",
                content: txt
            });
        }
    };

    files.forEach(function(file, inx) {

        pushTextPart(inx);

        item.addFlag("description", {
            type: "file",
            content: file,
            contentType: "code"
        });
    });

    pushTextPart(text.length - 1);

    return false;
});



globalCache.add("file.*.item.*.description.prepare", function(flag, content, item) {

    if (typeof content != "string") {
        return content;
    }

    var f = item.file.resolveFlagFile(content);

    if (f === false) {
        return {
            type: "string",
            content: content
        }
    }
    else {
        return {
            type: "file",
            content: f
        };
    }

});



var resolveName = globalCache.add("file.*.item.*.emits.resolveName", function(item, flag, content){

    var parents = item.getParents(),
        items = [],
        i, l,
        trg;

    parents.forEach(function(parent){
        items.push(parent);
        items = items.concat(parent.getInheritedParents());
    });

    items.unshift(item);

    for (i = 0, l = items.length; i < l; i++) {

        trg = items[i].findItem(content, "event", true);

        if (trg.length) {
            return trg[0].fullName;
        }
    }

    return null;
});



var resolveName = globalCache.add("file.*.item.*.extends.resolveName", resolveExtendableName);



var resolveName = globalCache.add("file.*.item.*.implements.resolveName", resolveExtendableName);



var resolveName = globalCache.add("file.*.item.*.mixes.resolveName", resolveExtendableName);



var add = globalCache.add("file.*.item.*.private.add", addAccessFlag);



var add = globalCache.add("file.*.item.*.protected.add", addAccessFlag);



var add = globalCache.add("file.*.item.*.public.add", addAccessFlag);



var prepare = globalCache.add("file.*.item.*.returns.prepare", function(flag, content, item) {

    if (!item.file) {
        return content;
    }

    var getCurly = item.file.pget("comment.getCurly"),
        normalizeType = item.file.pget("normalizeType");

    if (content.charAt(0) == '{') {

        var curly = getCurly(content);
        content = content.replace('{' + curly + '}', '').trim();

        if (content) {
            item.addFlag("returnDescription", content);
        }

        return normalizeType(curly, item.file);
    }
    else {
        return normalizeType(content, item.file);
    }

});



var resolveName = globalCache.add("file.*.item.*.returns.resolveName", resolveTypeName);



var resolveName = globalCache.add("file.*.item.*.throws.resolveName", resolveTypeName);



var resolveName = globalCache.add("file.*.item.*.type.resolveName", resolveTypeName);



var createContext = globalCache.add("file.*.item.?.param.createContext", createFunctionContext);




var requiredContext = globalCache.add("file.*.item.?.requiredContext", {
    "param": ["function", "method"],
    "returns": ["function", "method"],
    "constructor": ["method"]
});



var createContext = globalCache.add("*.item.?.returns.createContext", createFunctionContext);


var add = globalCache.add("file.*.item.param.param.add", addVarFlag);



var parse = globalCache.add("file.*.item.param.param.parse", parseVarFlag);


var add = globalCache.add("file.*.item.property.property.add", addVarFlag);



var parse = globalCache.add("file.*.item.property.property.parse", parseVarFlag);


var add = globalCache.add("file.*.item.var.var.add", addVarFlag);



var parse = globalCache.add("file.*.item.var.var.parse", parseVarFlag);



var items = globalCache.add("file.*.items", [
    {
        name: "root",
        children: ["*", "!param"]
    }
]);



var normalizeType = globalCache.add("file.*.normalizeType", function(type, file){

    var aliases = file.pget("typeAliases"),
        ret = [],
        tmp = type.split("|");

    if (aliases) {
        tmp.forEach(function(type){
            ret.push(aliases[type] || type);
        });
    }
    else {
        ret.push(type);
    }

    return ret;
});



function sortArray(arr, by, dir) {

    if (!dir) {
        dir = "asc";
    }

    var ret = arr.slice();

    ret.sort(function(a, b) {
        var typeA = typeof a,
            typeB = typeof b,
            valueA  = a,
            valueB  = b;

        if (typeA != typeB) {
            return 0;
        }

        if (typeA == "object") {
            if (isFunction(by)) {
                valueA = by(a);
                valueB = by(b);
            }
            else {
                valueA = a[by];
                valueB = b[by];
            }
        }

        if (typeof valueA == "number") {
            return valueA - valueB;
        }
        else {
            valueA = ("" + valueA).toLowerCase();
            valueB = ("" + valueB).toLowerCase();

            if (valueA === valueB) return 0;
            return valueA > valueB ? 1 : -1;
        }
    });

    return dir == "desc" ? ret.reverse() : ret;

};




var sortItems = globalCache.add("file.*.sortItems", function(item, cfg){

    var by = cfg ? cfg.by : null,
        dir = cfg ? (cfg.direction || null) : "asc",
        hook,
        key;

    for (key in item.items) {

        if (key != "param") {

            hook = item.isRoot() ? item.items[key][0].file.pget("sort-" + key) :
                                    item.file.pget("sort-" + key);

            if (hook) {
                hook(item.items[key], item, cfg);
            }
            else if (cfg) {
                item.items[key] = sortArray(item.items[key], by, dir);
            }

            item.items[key].forEach(function (item) {
                item.file.pcall("sortItems", item, cfg);
            });
        }
    }

});



var added = globalCache.add("file.js.item.*.description.added", function(flag, item){

    var ft;

    if (ft = flag.getProperty("fileType")) {
        if (ft == "js") {
            flag.setType("code");
        }
    }

});



var getFullName = globalCache.add("file.js.item.*.getFullName", function(item) {

    var parents = item.getParents().reverse(),
        name = item.name,
        fullName = "";

    if (!name) {
        return null;
    }


    var getPrefix = function(item) {
        switch (item.type) {
            case "param":
                return '/';
            case "event":
                return "@";
            default:
                return ".";
        }
    };

    parents.forEach(function(parent) {
        if (parent.name) {
            if (fullName) {
                fullName += getPrefix(parent);
            }
            fullName += parent.name;
        }
    });

    if (item.file.options.namePrefix) {
        fullName = item.file.options.namePrefix + fullName;
    }


    return fullName;
});



var extractTypeAndName = globalCache.add("file.js.item.extractTypeAndName", function(file, startIndex, checkFunctions, checkVars) {

    var content         = file.getContent(),
        part            = content.substr(startIndex, 200),
        lines           = part.split("\n"),
        rVar            = /var\s+([^\s]+)\s*=\s*([^\s(;]+)/,
        rProp           = /\s*(['"$a-zA-Z0-9\-_]+)\s*:\s*([^\s(;]+)/,
        rFunc           = /(return|;|=)\s*function\s+([^(]+)/,
        rNamedFunc      = /(['"$a-zA-Z0-9\-_\.]+)\s*[=:]\s*function\s*(\(|[$a-zA-Z0-9_]+)/,
        isFunc          = typeof checkFunctions != "undefined" ? checkFunctions : null,
        isVar           = typeof checkVars != "undefined" ? checkVars : null,
        name, type,
        match,
        inx,
        i, l;

    inx = part.indexOf('/**');
    if (inx > -1) {
        part = part.substr(0, inx);
    }

    for (i = 0, l = lines.length; i < l; i++) {

        part = lines.slice(0, i).join("\n");

        if ((isFunc === null || isFunc === true) && (match = part.match(rFunc))) {
            name = match[2].trim();
            type = "function";
        }
        else if ((isFunc === null || isFunc === true) && (match = part.match(rNamedFunc))) {
            name = match[2].trim();
            if (name == '(') {
                name = match[1].trim();
                name = name.replace(/['"]/g, "");
                var tmp = name.split(".");
                name = tmp.pop();
            }
            type = "function";
        }
        else if ((isVar === null || isVar === true) && (match = part.match(rVar))) {
            name = match[1].trim();
            type = match[2].trim();
        }
        else if ((isVar === null || isVar === true) && (match = part.match(rProp))) {
            name = match[1].trim();
            type = match[2].trim();
        }

        if (type && name) {
            return [type, name];
        }
    }
});





var items = (function(){

    var classes = function(name, displayName, groupName) {
        return {
            name: name,
            children: ["property", "const", "method", "event", "!param"],
            extendable: true,
            transform: {
                "function": "method",
                "var":      "property"
            },
            displayName: displayName,
            groupName: groupName
        };
    };

    var funcs = function(name, displayName, groupName) {
        return {
            name: name,
            onePerComment: true,
            multiple: name != "event",
            children: ["param"],
            transform: {},
            displayName: displayName,
            groupName: groupName
        }
    };

    var vars = function(name, displayName, groupName) {

        var children = ["!param"];

        if (name == "var" || name == "property") {
            children.push("event");
        }

        return {
            name: name,
            stackable: name != "param",
            onePerComment: true,
            children: children,
            transform: {
                "var": "property"
            },
            displayName: displayName,
            groupName: groupName
        };
    };


    return globalCache.add("file.js.items", [
        {
            name: "root",
            namespace: true,
            children: ["*", "!param"]
        },
        {
            name: "namespace",
            namespace: true,
            children: ["*", "!namespace", "!param"],
            transform: {
                "method": "function"
            },
            displayName: "Namespace",
            groupName: "Namespaces"
        },
        {
            name: "module",
            namespace: true,
            children: ["*", "!namespace", "!module", "!param"],
            transform: {
                "method": "function"
            },
            displayName: "Module",
            groupName: "Modules"
        },
        classes("class", "Class", "Classes"),
        classes("interface", "Interface", "Interfaces"),
        classes("mixin", "Mixin", "Mixins"),
        funcs("function", "Function", "Functions"),
        funcs("method", "Method", "Methods"),
        funcs("event", "Event", "Events"),
        vars("param"),
        vars("var", "Variable", "Variables"),
        vars("property", "Property", "Properties"),
        vars("const", "Constant", "Constants")
    ]);

}());



var resolveIncludes = globalCache.add("file.js.resolveIncludes", function(file) {

    var content     = file.getContent(),
        base        = file.dir + "/",
        rInclude    = /require\(['|"]([^)]+)['|"]\)/,
        start       = 0,
        list        = [],
        required,
        match;

    while (match = rInclude.exec(content.substr(start))) {

        required = match[1];
        start += match.index + required.length;

        if (required.indexOf(".js") == -1) {
            continue;
        }

        required = path.normalize(base + required);
        list.push(required);
    }

    return list;
});




var typeAliases = globalCache.add("file.js.typeAliases", {

    "{}": "object",
    "Object": "object",

    "[]": "array",
    "Array": "array",

    "bool": "boolean",
    "Bool": "boolean",
    "Boolean": "boolean",

    "String": "string",

    "Function": "function"
});

var marked = require("marked");



var markdown = globalCache.add("markdown", function(content){

    return marked(content, {
        gfm: true,
        breaks: false,
        tables: true
    });
});

var fse = require("fs.extra"),
    jsdom = require("jsdom"),
    
    
    
    Promise = require("metaphorjs-promise");


var Default = globalCache.add("renderer.default", Renderer.$extend({

    data: null,
    templateDir: null,
    templates: null,
    assets: null,
    out: null,
    types: null,

    $init: function() {

        var self = this;

        self.$super.apply(self, arguments);

        if (!self.out) {
            throw "Cannot render to stdout";
        }

        if (!self.data) {
            self.data = {};
        }

        extend(self.data, globalCache.get("renderer.default").defaultData, false, false);

        if (!self.templateDir) {
            // path relative to dist/
            self.templateDir = path.normalize(__dirname + "/../assets/renderer/default");
        }

        self.data.sourceTree = self.doc.exportData();
    },



    render: function() {

        var self = this,
            tplDir = self.templateDir,
            index = tplDir + "/index.html",
            tpl = fs.readFileSync(index).toString();

        var util = require('util');

        var doc = jsdom.jsdom(tpl);
        var MetaphorJs = require("metaphorjs")(doc.parentWindow);

        self.initMetaphor(MetaphorJs);

        initMetaphorTemplates(MetaphorJs);

        // path relative to dist/
        self.loadTemplates(MetaphorJs, path.normalize(__dirname + "/../assets/templates"));
        self.loadTemplates(MetaphorJs, tplDir + "/templates");

        if (self.templates) {
            self.loadTemplates(MetaphorJs, self.runner.preparePath(self.templates));
        }

        if (self.assets) {
            var assetPath = self.runner.preparePath(self.assets);
            var list = getFileList(assetPath);
            list.forEach(function(filePath){

                var ext = path.extname(filePath).substr(1);
                if (ext == "css") {
                    self.data.styles.push("assets/" + filePath.replace(assetPath, ""));
                }
            })
        }

        self.runMetaphor(MetaphorJs, doc, self.data);

        var html = jsdom.serializeDocument(doc);

        MetaphorJs.destroy();

        return html;
    },

    writeOut: function(out, done) {

        var self    = this,
            outDir  = this.out,
            tplDir  = this.templateDir;

        if (fs.existsSync(outDir + "/bower_components")) {
            fse.rmrfSync(outDir + "/bower_components");
        }

        if (fs.existsSync(outDir + "/assets")) {
            fse.rmrfSync(outDir + "/assets");
        }

        var bowerPromise = new Promise,
            defAssetsPromise = new Promise,
            projAssetsPromise = new Promise;

        fse.copyRecursive(tplDir + "/bower_components", outDir + "/bower_components", function(err){

            if (err) {
                self.doc.trigger("error", err);
                throw err;
            }

            bowerPromise.resolve();
        });

        fse.copyRecursive(tplDir + "/assets", outDir + "/assets", function(err){

            if (err) {
                self.doc.trigger("error", err);
                throw err;
            }

            defAssetsPromise.resolve();
        });

        if (self.assets) {

            var projAssetsPath = self.runner.preparePath(self.assets);

            fse.copyRecursive(projAssetsPath, outDir + "/assets", function(err){

                if (err) {
                    self.doc.trigger("error", err);
                    throw err;
                }

                projAssetsPromise.resolve();
            });
        }
        else {
            projAssetsPromise.resolve();
        }

        Promise.all([bowerPromise, defAssetsPromise, projAssetsPromise])
            .done(function(){
                fs.writeFileSync(outDir + "/index.html", out);

                if (done) {
                    done();
                }
            });

    }


}, {
    defaultData: {
        styles: [],
        scripts: []
    }
}));



var Json = globalCache.add("renderer.json", Renderer.$extend({

    render: function() {
        return JSON.stringify(this.doc.exportData(null, false, true), null, 2);
    }

}));







var Plain = globalCache.add("renderer.plain", Renderer.$extend({

    render: function() {

        var data = this.doc.getData(),
            html = "<ul>",
            keys = ["param", "var", "function", "namespace", "class", "property", "method"],
            key, value;

        var renderItem = function(type, item) {

            html += '<li>';
            html += '<p>';

            if (type) {
                html += '<i>' + type + '</i> ';
            }

            if (item.name) {
                if (item.flags.type) {
                    html += '['+ (item.flags.type.join(" | ")) +'] ';
                    delete item.flags.type;
                }
                html += '<b>' + item.name + '</b>';

                if (item.param) {
                    html += '(';

                    var params = [];
                    item.param.forEach(function(param){
                        params.push(param.name);
                    });
                    html += params.join(", ");
                    html += ')';
                }

                if (item.flags.returns) {
                    if (typeof item.flags.returns == "string") {
                        html += ' : !!![' + (item.flags.returns) + ']';
                    }
                    else {
                        html += ' : [' + (item.flags.returns.join(" | ")) + ']';
                    }
                    delete item.flags.returns;
                }
            }

            html += '</p>';

            if (item.flags.description) {
                html += '<p>';
                html += item.flags.description;
                html += '</p>';
                delete item.flags.description;
            }

            keys.forEach(function(key){

                var items = item[key];

                if (items) {
                    html += '<ul>';
                    items.forEach(function(item){
                        renderItem(key, item);
                    });
                    html += '</ul>';
                }
            });

            var flags = "";
            for (key in item.flags) {
                value = item.flags[key];
                flags += '<li>'+key+' : '+value+'</li>';
            }
            if (flags) {
                html += '<ul>' + flags + '</ul>';
            }

            html += '</li>';

        };

        renderItem(null, data);

        html += '</ul>';

        return html;
    }

}, {
    mime: "text/html"
}));






var Raw = globalCache.add("renderer.raw", Renderer.$extend({

    render: function() {
        return this.doc.exportData(null, false, true);
    },

    writeOut: function(out, done) {
        console.log(out);

        if (done) {
            done();
        }
    }

}));


var documentorExport = {};
documentorExport['Renderer'] = Renderer;
documentorExport['Item'] = Item;
documentorExport['Base'] = Base;
documentorExport['SourceFile'] = SourceFile;
documentorExport['Comment'] = Comment;
documentorExport['Runner'] = Runner;
documentorExport || (documentorExport = {});
documentorExport['hooks'] = globalCache;
module.exports = documentorExport;
