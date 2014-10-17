
var Base = require("./Base.js"),
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



        $init: function() {

            var self = this;

            self.items = {};
            self.flags = {};

            self.$super();

            if (self.name) {
                self.setName(self.name);
            }
        },

        getTypeProps: function() {
            if (!this.props) {
                this.props = this.pcall("getItemType", this.type, this.file);
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

            items[type].push(item);
        },

        hasFlag: function(flag) {
            return this.flags.hasOwnProperty(flag);
        },

        addFlag: function(flag, content) {

            var self = this;

            var prepared = this.pcall("flag." + flag + ".prepare", flag, content, this);

            if (prepared) {
                content = prepared;
            }

            this.pget("flag." + flag + ".add", false, function(fn){
                return fn(flag, content, self);
            });

            if (flag == this.type) {
                return;
            }

            switch (flag) {
                case "md-tmp":
                case "md-apply":
                    break;
                case "public":
                case "protected":
                case "private":
                    this.addFlag("access", flag);
                    break;
                default:
                    if (!this.flags.hasOwnProperty(flag)) {
                        this.flags[flag] = [];
                    }
                    if (isArray(content)) {
                        this.flags[flag] = this.flags[flag].concat(content);
                    }
                    else {
                        this.flags[flag].push(content);
                    }
                    break;
            }
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
                    self.flags[flag].forEach(function(name){

                        name = typeof name == "string" ? name : name.ref;

                        var item = doc.getItem(name);

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
                getProps    = this.pget("getItemType"),
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
                self.setFullName(self.pcall("item." + self.type + ".getFullName", self));
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
                    self.flags[k].forEach(function (flag, inx) {

                        var res = self.pcall("flag." + k + ".resolveName", self, k, flag);

                        if (res) {
                            self.flags[k][inx] = res;
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




        importItem: function(item) {

            var self = this;

            for (var type in item.items) {
                item.items[type].forEach(function (item) {
                    self.addItem(item);
                });
            }

            for (var key in item.flags) {
                self.addFlag(key, item.flags[key]);
            }
        },

        createRef: function(name) {
            return {
                name: name,
                ref: this.fullName
            };
        },

        getData: function(currentParent) {

            var self = this,
                exprt = self.type == "root" ? {} : {
                    name:  self.name,
                    fullName: self.fullName,
                    flags: self.flags,
                    file: self.file.exportPath,
                    line: self.comment.line
                };

            if (currentParent && currentParent !== self.parent) {
                exprt.inheritedFrom = self.parent.fullName;
            }

            self.eachItem(function(child){

                var type = child.type;

                if (!exprt.hasOwnProperty(type)) {
                    exprt[type] = [];
                }

                exprt[type].push(child.getData(self));

            }, null, true);

            return exprt;
        }

    });


    return Item;


}());
