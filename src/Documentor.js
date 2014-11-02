
var Base = require("./Base.js"),
    isFile = require("../../metaphorjs/src/func/fs/isFile.js"),
    extend = require("../../metaphorjs/src/func/extend.js"),
    getFileList = require("../../metaphorjs/src/func/fs/getFileList.js"),
    undf = require("../../metaphorjs/src/var/undf.js"),
    path = require("path"),
    fs = require("fs"),
    SourceFile = require("./SourceFile.js"),
    Item = require("./Item.js"),
    Content = require("./Content.js"),
    Cache = require("../../metaphorjs/src/lib/Cache.js"),
    globalCache = require("./var/globalCache.js"),
    generateNames = require("./func/generateNames.js"),
    nextUid = require("../../metaphorjs/src/func/nextUid.js");





module.exports = Base.$extend({

    files: null,
    root: null,
    hooks: null,
    id: null,
    map: null,
    content: null,
    typeSortCfg: null,
    itemSortCfg: null,
    contentSortCfg: null,

    $init: function(cfg){

        var self = this;

        self.id         = nextUid();
        self.files      = {};
        self.map        = {};
        self.content    = [];
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

        self.$super();
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
            i, l;

        if (exact) {
            names.length = 1;
        }

        [self.hooks, globalCache].forEach(function(cache){
            for (i = 0, l = names.length; i < l; i++) {

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
                    }

                    if (value !== undf) {

                        if (collect) {
                            ret.push(value);
                        }
                        else if (passthru) {
                            if (passthru(value) === false) {
                                return false;
                            }
                        }
                        else {
                            ret = value;
                            return false;
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
            var list = getFileList(directory, "js");
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

    addContent: function(id, content) {
        this.content.push(new Content(id, content));
    },

    prepare: function() {

        var self = this;

        self.eachItem("resolveFullName");
        self.eachItem("resolveInheritanceNames");
        self.eachItem("applyInheritance");
        self.eachItem("resolveOtherNames");

        self.pcall("prepareItems", self);
        self.pcall("prepaceContent", self);

        self.pcall("file.*.sortItemTypes", self.root, self.typeSortCfg);
        self.pcall("file.*.sortItems", self.root, self.itemSortCfg);
        self.pcall("sortContent", self, self.contentSortCfg);
    },


    eachItem: function(fn, context) {
        this.root.eachItem(fn, context);
    },



    loadHooks: function(dir) {

        var self = this,
            r = require;

        self.eachHook(dir, "js", function(name, file){
            self.cache.add(name, r(file));
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

    exportData: function() {

        var self = this,
            exportData = self.pget("export");

        if (exportData) {
            return exportData(self);
        }
        else {
            return this.root.exportData();
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

