
var fs = require("fs"),
    Base = require("./Base.js"),
    
    extend = require("metaphorjs-shared/src/func/extend.js"),
    getFileList = require("metaphorjs-build/src/func/getFileList.js"),
    undf = require("metaphorjs-shared/src/var/undf.js"),
    path = require("path"),
    SourceFile = require("./file/Source.js"),
    RootFile = require("./file/Root.js"),
    File = require("./File.js"),
    Item = require("./Item.js"),
    Content = require("./Content.js"),
    globalCache = require("./var/globalCache.js"),
    generateNames = require("./func/generateNames.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    lib_Cache = require("metaphorjs-shared/src/lib/Cache.js"),
    mixin_Observable = require("metaphorjs-observable/src/mixin/Observable.js");

require("./file/Source.js");
require("./file/Content.js");


/**
 * @class Documentor
 * @extends Base
 * @mixes MetaphorJs.mixin.Observable
 */
module.exports = Base.$extend({
    $class: "MetaphorJs.docs.Documentor",
    $mixins: [mixin_Observable],

    files: null,
    root: null,
    hooks: null,
    id: null,
    map: null,
    content: null,
    runner: null,
    hookDirs: null,


    /**
     * @constructor
     * @param {object} cfg {
     * }
     */
    $init: function(cfg){

        var self = this;

        self.id         = nextUid();
        self.files      = {};
        self.map        = {};
        self.content    = {};
        self.hookDirs   = [];
        self.root       = new Item({
            doc:        self,
            type:       "root",
            file:       new RootFile({
                ext:    "*",
                doc:    self
            })
        });

        extend(self, cfg, true, false);

        self.hooks      = new lib_Cache(true);

        self.hookDirs.push(path.normalize(self.runner.getMjsDocRoot() + "/src/hooks"));

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

                    if (typeof value === "function" && !value.hasOwnProperty(id)) {
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


    /**
     * @method
     * @param {string} name
     * @returns {Renderer}
     */
    getRenderer: function(name){
        return this.hooks.get("renderer." + name) ||
               globalCache.get("renderer." + name);
    },

    /**
     * @method
     * @param {string} cls
     * @returns {File}
     */
    getFileClass: function(cls) {
        return this.hooks.get(cls) ||
                globalCache.get(cls) ||
                ns.get(cls);
    },

    /**
     * @method
     * @param {Item} item
     */
    addUniqueItem: function(item) {

        var name = item.fullName;

        if (name && !this.map.hasOwnProperty(name)) {
            this.map[name] = item;
        }
    },

    /**
     * @method
     * @param {string} name
     * @returns {Item}
     */
    getItem: function(name) {
        return this.map.hasOwnProperty(name) ? this.map[name] : null;
    },


    /**
     * @method
     * @param {string} directory
     * @param {string} ext File extension
     * @param {object} options {
     *  @type {bool} hidden
     *  @type {string} startDir
     *  @type {bool} includeExternal
     *  @type {bool} hideIncludes
     *  @type {string} basePath Base path is usually path to metaphorjs.json file
     * }
     */
    eat: function(directory, ext, options) {

        options = options || {};

        if (!ext) {
            throw new Error("Extension required");
        }
        if (!directory) {
            throw new Error("Directory or file required");
        }

        options.hidden = options.hidden === undf ? false : options.hidden;

        var self = this;

        if (fs.existsSync(directory)) {
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

    /**
     * @method
     * @param {string} filePath
     * @param {object} options See <code>eat</code>
     */
    addFile: function(filePath, options) {

        var self = this;

        options = options || {};

        var hidden = options.startDir && !options.includeExternal &&
                     filePath.indexOf(options.startDir) !== 0;

        if (!self.files[filePath]) {

            var file = File.get(filePath, self, extend({}, options, {
                hidden: hidden
            }, true, false));

            if (!options.hideIncludes) {
                self.resolveIncludes(file, options);
            }

            self.files[filePath] = file;
            file.process();
        }
        else {
            // if file it not created but retrieved,
            // we reset hidden field
            if (hidden === false) {
                self.files[filePath].hidden = false;
            }
        }
    },

    /**
     * @method
     * @param {File} file
     * @param {object} options
     */
    resolveIncludes: function(file, options) {

        var self = this,
            includes = file.pcall("resolveIncludes", file);

        if (includes) {
            includes.forEach(function(include){
                self.addFile(include, options);
            });
        }
    },

    /**
     * @method 
     * @param {string} path
     * @returns {SourceFile}
     */
    getFile: function(path) {
        return this.files[path];
    },

    /**
     * @method
     * @param {object} cfg See Content's constructor
     */
    addContent: function(cfg) {
        var self = this,
            c = cfg instanceof Content ? cfg : new Content(extend({}, cfg, {
                doc: self
            })),
            type = c.type;
        
        if (!self.content[type]) {
            self.content[type] = [];
        }
        self.content[type].push(c);
        c.pcall("added", c, self);
    },

    /**
     * @method
     * @param {function} fn {
     *  @param {Content} content
     *  @param {...} args rest of args
     * }
     * @param {object} context fn's 'this' object
     * @param {array} args Arguments to append to fn's arguments
     */
    eachContent: function(fn, context, args) {
        var k, self = this;
        args = args || [];

        var exec = function(c) {

            if (typeof fn == "function") {
                fn.call(context, [c].concat(args));
            }
            else {
                if (fn.indexOf(".") == -1 && c[fn]) {
                    c[fn].apply(c, args); 
                }
                else {
                    c.pcall(fn, [c].concat(args));
                }
            }
        };

        for (k in self.content) {
            self.content[k].forEach(exec);
        }
    },

    /**
     * Run all preparations
     * @method
     */
    prepare: function() {

        var self = this;

        self.pcall("event.start", self);
    
        self.eachItem("resolveFullName");
        self.eachItem("resolveInheritanceNames");
        self.eachItem("applyInheritance");
        self.eachItem("resolveOtherNames");
        self.eachItem("finish");
        self.pcall("event.itemsPrepared", self);

        self.eachItem("sortChildren", null, true, [self.cfg]);
        self.pcall("event.itemsSorted", self);

        self.content = self.pcall("content.sortTypes", self.content, self.cfg, self);
        for (childType in self.content) {
            fn = self.content[childType][0].pget("sort");
            self.content[childType] = fn.call(
                null, self.content[childType], self.cfg, self, childType
            );
        }
        self.pcall("event.contentSorted", self);

        self.pcall("event.end", self);

    },


    /**
     * @method
     * @param {function} fn {
     *  @param {Item} item
     *  @param {...} args rest of args
     * }
     * @param {object} context
     * @param {bool} includeRoot
     * @param {array} args Arguments to append to fn
     */
    eachItem: function(fn, context, includeRoot, args) {
        this.root.eachItem(fn, context, false, includeRoot, args);
    },


    /**
     * @method
     * @param {string} dir
     */
    loadHooks: function(dir) {

        var self = this,
            r = require;

        self.hookDirs.push(dir);
        self.eachHook(dir, "js", function(name, file){
            self.hooks.add(name, r(file));
        });
    },

    /**
     * @method
     * @param {string} dir
     * @param {string} ext 
     * @param {function} fn {
     *  @param {string} directory
     *  @param {string} filePath
     * }
     * @param {object} context
     */
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

    /**
     * Export all parsed data and data structure into one object
     * @method
     * @returns {object} {
     *  @type {array} items
     *  @type {array} content
     *  @type {object} structure 
     * }
     */
    exportData: function(noHelpers) {

        var self = this,
            exportData = self.pget("export"),
            getStructure = self.pget("export.getStructure"),
            items = [],
            contents = [],
            k;

        if (exportData) {
            return exportData(self);
        }

        var exprt = {
            items: [],
            content: [],
            structure: {}
        };

        self.root.eachChild(function(item){
            if (item.file.hidden){
                return;
            }
            var typeProps   = item.getTypeProps();
            if (typeProps && typeProps.virtual) {
                return;
            }

            items.push(item);
        });

        items = self.pcall("export.sortItems", items, self.cfg, self);

        self.root.exportChildren(items, noHelpers, true)
            .forEach(function(ch) {
                exprt.items.push(ch);
            });


        for (k in self.content) {
            self.content[k].forEach(function(c){
                contents.push(c);
            });
        }

        contents = self.pcall("export.sortContent", contents, self.cfg, self);
        contents.forEach(function(c){
            exprt.content.push(c.exportData());
            items.push(c);
        });

        items = self.pcall("export.sortAll", items, self.cfg, self);
        exprt.structure = getStructure(self, items);

        return exprt;
    },

    /**
     * @method
     */
    onDestroy: function() {
        this.clear();
    },

    /**
     * @method
     */
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

