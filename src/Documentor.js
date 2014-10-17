
var Base = require("./Base.js"),
    isFile = require("../../metaphorjs/src/func/fs/isFile.js"),
    extend = require("../../metaphorjs/src/func/extend.js"),
    getFileList = require("../../metaphorjs/src/func/fs/getFileList.js"),
    undf = require("../../metaphorjs/src/var/undf.js"),
    path = require("path"),
    fs = require("fs"),
    File = require("./File.js"),
    Renderer = require("./Renderer.js"),
    Item = require("./Item.js"),
    Comment = require("./Comment.js"),
    Cache = require("../../metaphorjs/src/lib/Cache.js"),
    globalCache = require("./var/globalCache.js"),
    generateNames = require("./func/generateNames.js"),
    nextUid = require("../../metaphorjs/src/func/nextUid.js");



module.exports = Base.$extend({

    files: null,
    root: null,
    cache: null,
    id: null,
    map: null,

    $init: function(){

        var self = this;

        self.id = nextUid();
        self.files = {};
        self.map = {};
        self.root = new Item({
            doc: self,
            type: "root"
        });

        self.cache = new Cache(true);


        self.$super();
    },




    pcall: function(name) {
        var fn = this.pget(name),
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

        [self.cache, globalCache].forEach(function(cache){
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
        return this.cache.get("renderer." + name) ||
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
            self.addFile(directory, options);
        }
        else {
            var list = getFileList(directory);
            list.forEach(function(file) {
                self.addFile(file, options);
            });
        }
    },

    addFile: function(filePath, options) {

        var self = this;

        options = options || {};

        if (!self.files[filePath]) {

            var file = File.get(filePath, self, options);

            if (!options.hideIncludes) {
                self.resolveIncludes(file, options);
            }

            self.files[filePath] = file;

            file.parse();
        }
    },

    resolveIncludes: function(file, options) {

        var self = this,
            includes = this.pcall(file.ext + ".resolveIncludes", file);

        if (includes) {
            includes.forEach(function(include){
                self.addFile(include, options);
            });
        }
    },


    prepareItems: function() {

        var self = this;


        self.eachItem("resolveFullName");
        self.eachItem("resolveInheritanceNames");
        self.eachItem("applyInheritance");
        self.eachItem("resolveOtherNames");
    },



    eachItem: function(fn, context) {
        this.root.eachItem(fn, context);
    },

    getData: function() {
        return this.root.getData();
    },

    clear: function() {
        File.clear();
        this.files = {};
        this.root = null;
        this.map = {};
    }

}, {
    RendererBase: Renderer,
    ItemBase: Item,
    Base: Base,
    File: File,
    Comment: Comment,


    cache: globalCache


});

