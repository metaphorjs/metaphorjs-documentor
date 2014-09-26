
var Base = require("./Base.js"),
    isDir = require("../../metaphorjs/src/func/fs/isDir.js"),
    isFile = require("../../metaphorjs/src/func/fs/isFile.js"),
    getFileList = require("../../metaphorjs/src/func/fs/getFileList.js"),
    undf = require("../../metaphorjs/src/var/undf.js"),
    ns = require("./var/ns.js"),
    cs = require("./var/cs.js"),
    path = require("path"),
    fs = require("fs"),
    File = require("./File.js"),
    JsExt = require("./ext/JsExt.js"),
    Root = require("./item/Root.js"),
    Promise = require("../../metaphorjs-promise/src/metaphorjs.promise.js");


require("./item/Class.js");
require("./item/Function.js");
require("./item/Method.js");
require("./item/Namespace.js");
require("./item/Var.js");
require("./item/Property.js");


module.exports = Base.$extend({

    files: null,
    ext: null,
    types: null,
    cs: null,
    ns: null,
    root: null,

    itemPromises: null,

    $init: function(){

        this.files = {};
        this.ext = {};
        this.types = {};
        this.cs = cs;
        this.ns = ns;
        this.itemPromises = {};
        this.root = new Root({
            doc: this
        });

        this.addExtension("js", JsExt);

        this.addItemType("namespace", "item.Namespace");
        this.addItemType("class", "item.Class");
        this.addItemType("function", "item.Function");
        this.addItemType("method", "item.Method");
        this.addItemType("var", "item.Var");
        this.addItemType("property", "item.Property");
        this.addItemType("type", "item.Property");
        this.addItemType("param", "item.Param");

        this.$super();
    },

    available: function(type, name, item) {
        var id = type +"-"+ name;

        if (!this.itemPromises[id]) {
            this.itemPromises[id] = new Promise;
        }

        this.itemPromises[id].resolve(item);
    },

    onAvailable: function(type, name, fn, context) {

        var id = type +"-"+ name;

        if (!this.itemPromises[id]) {
            this.itemPromises[id] = new Promise;
        }

        this.itemPromises[id].done(fn, context);
    },

    getExtension: function(ext) {
        if (ext instanceof File) {
            ext = ext.ext;
        }
        return this.ext[ext] || null;
    },

    addExtension: function(ext, pluginClass) {

        this.ext[ext] = new pluginClass({
            doc: this
        });
    },

    getItemType: function(type) {
        return this.types.hasOwnProperty(type) ? this.types[type] : null;
    },

    getItemTypes: function() {
        return this.types;
    },

    addItemType: function(type, itemClass) {
        this.types[type] = typeof itemClass == "string" ? ns.get(itemClass) : itemClass;
    },

    eat: function(directory, ext, priv) {

        if (!ext) {
            throw "Extension required";
        }
        if (!directory) {
            throw "Directory or file required";
        }

        priv = priv === undf ? false : priv;

        var self = this;

        if (isFile(directory)) {
            self.addFile(directory, priv);
        }
        else {
            var list = getFileList(directory);
            list.forEach(function(file) {
                self.addFile(file, priv);
            });
        }
    },

    resolveIncludes: function(file, priv) {

        var self = this,
            plugin = self.getExtension(file.ext);

        if (plugin) {
            var includes = plugin.resolveIncludes(file);

            includes.forEach(function(include){
                self.addFile(include, priv);
            });
        }

    },

    addFile: function(filePath, priv) {

        if (!this.files[filePath]) {

            var file = File.get(filePath, this);
            this.resolveIncludes(file, priv);
            this.files[filePath] = file;

            file.parse();
        }
    },

    getData: function() {
        return this.root.getData();
    },

    clear: function() {
        File.clear();
    }
});