
var Base = require("./Base.js"),
    Flag = require("./Flag.js"),
    isArray = require("../../metaphorjs/src/func/isArray.js"),
    emptyFn = require("../../metaphorjs/src/func/emptyFn.js");


module.exports = (function(){


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

        addFlag: function(flag, content) {

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
                            new Flag(flag, content, null, null, self.file);
                    self.flags[flag].push(f);
                    added.push(f);
                });
            }
            else {
                f = content instanceof Flag ?
                        content :
                        new Flag(flag, content, null, null, self.file);
                self.flags[flag].push(f);
                added.push(f);
            }

            added.forEach(function(f) {
                self.pcall(flag + ".added", f, self);
            });
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

                var chGroups = {},
                    typeProps;

                self.eachItem(function (child) {

                    if (child.file.hidden) {
                        return;
                    }

                    var type = child.type;

                    if (!chGroups[type]) {

                        typeProps = child.getTypeProps();

                        chGroups[type] = {
                            type: type,
                            name: typeProps.displayName,
                            groupName: typeProps.groupName,
                            items: []
                        };
                        exprt.children.push(chGroups[type]);
                        exprt.childTypes.push(type);
                    }


                    chGroups[type].items.push(child.exportData(self, false, noHelpers));

                }, null, true);
            }

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
