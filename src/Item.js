
var Base = require("./Base.js"),
    Flag = require("./Flag.js"),
    isArray = require("metaphorjs/src/func/isArray.js"),
    toArray = require("metaphorjs/src/func/array/toArray.js"),
    undf = require("metaphorjs/src/var/undf.js"),
    copy = require("metaphorjs/src/func/copy.js"),
    emptyFn = require("metaphorjs/src/func/emptyFn.js");


module.exports = (function(){

    /**
     * @class Item
     * @extends Base
     */
    var Item = Base.$extend({

        $class: "Item",

        doc: null,
        file: null,
        type: null,
        group: null,
        name: null,
        fullName: null,
        items: null,
        flags: null,
        comment: null,
        line: null,
        props: null,
        parent: null,
        values: null,
        toExport: null,
        toStructExport: null,

        /**
         * @var {int}
         */
        level: 0,

        /**
         * @constructor 
         * @param {object} cfg {
         *  @type {Documentor} doc
         *  @type {SourceFile} file
         *  @type {string} name
         *  @type {string} type
         * }
         */
        $init: function() {

            var self = this;

            self.items = {};
            self.flags = {};
            self.values = {};
            self.toExport = {};
            self.toStructExport = {};

            self.group = this.type;

            self.$super();

            if (self.name) {
                self.setName(self.name);
            }
        },

        /**
         * @method
         * @param {Item} newParent
         * @returns {Item}
         */
        clone: function(newParent) {

            var items = {},
                flags = {},
                name, type;

            for (name in this.flags) {
                flags[name] = [];
                this.flags[name].forEach(function(flag){
                    flags[name].push(flag.clone());
                });
            }

            var newItem = new Item({
                doc: this.doc,
                file: this.file,
                type: this.type,
                name: this.name,
                comment: this.comment,
                line: this.line,
                props: null,

                parent: newParent,
                level: newParent.level + 1
            });

            for (type in this.items) {
                items[type] = [];
                this.items[type].forEach(function(item){
                    items[type].push(item.clone(newItem));
                });
            }

            newItem.items = items;
            newItem.flags = flags;
            newItem.values = copy(this.values);
            newItem.toExport = copy(this.toExport);
            newItem.toStructExport = copy(this.toStructExport);

            if (flags.hasOwnProperty("md-var") && 
                !flags.hasOwnProperty("value")) {
                var val = newParent.getValue(flags['md-var'][0].content);
                if (val !== null) {
                    newItem.addFlag("value", val);
                }
            }

            return newItem;
        },

        createChild: function(type, name) {
            var item = new Item({
                doc: this.doc,
                file: this.file,
                type: type
            });

            item.setName(name);
            return item;
        },

        /**
         * @method
         * @returns {bool}
         */
        isRoot: function() {
            return this.level == 0;
        },

        pcall: function(name) {
            var self = this,
                args;

            args = toArray(arguments);
            args[0] = "item." + self.type + "." + args[0];
            if (self.file) {
                return self.file.pcall.apply(self.file, args);
            }
            else {
                args[0] = "*." + args[0];
                return self.doc.pcall.apply(self.doc, args);
            }
        },

        pget: function(name, collect, passthru) {
            var self = this,
                args;
            
            args = toArray(arguments);
            args[0] = "item." + self.type + "." + args[0];
            if (self.file) {
                return self.file.pget.apply(self.file, args);
            }
            else {
                args[0] = "*." + args[0];
                return self.doc.pcall.apply(self.doc, args);
            }
        },

        /**
         * @method
         * @returns {object}
         */
        getTypeProps: function() {
            if (!this.props) {
                this.props = this.file.pcall("getItemType", this.type, this.file);
            }
            return this.props;
        },

        /**
         * @method
         * @returns {object}
         */
        getGroupProps: function() {
            return  this.file.pcall("getItemType", this.group, this.file);
        },


        /**
         * @return {string}
         */
        getSortableName: function() {
            return this.fullName || this.name;
        },

        /**
         * Get a child by type and name from direct children
         * @method
         * @param {string} type
         * @param {string} name
         * @param {bool} last
         * @returns {Item}
         */
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

        /**
         * @method
         * @param {Item} item
         */
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

        /**
         * @method
         * @param {string} flag
         * @returns {bool}
         */
        hasFlag: function(flag) {
            return this.flags.hasOwnProperty(flag);
        },

        /**
         * @method addFlag
         * @param {Flag} flag
         * @returns {array} array of created flags
         */

        /**
         * @method addFlag
         * @param {string} flag
         * @param {string|array} content
         * @param {string} type
         * @param {object} props
         * @returns {array} array of created flags
         */
        addFlag: function(flag, content, type, props) {

            var self = this;

            if (self.type == "root") {
                return;
            }

            if (flag instanceof Flag) {
                if (!self.flags.hasOwnProperty(flag.name)) {
                    self.flags[flag.name] = [];
                }
                self.flags[flag.name].push(flag);
                self.pcall(flag.name + ".added", flag, self);
                return [flag];
            }

            if (content == undf) {
                content = true;
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

            if (!isArray(content)) {
                content = [content];
            }

            content.forEach(function(content){
                f = content instanceof Flag ?
                        content :
                        new Flag(flag, content, type, props, self.file);
                self.flags[flag].push(f);
                added.push(f);
            });

            added.forEach(function(f) {
                self.pcall(flag + ".added", f, self);
            });

            return added;
        },

        /**
         * @method
         * @param {function} fn {
         *  @param {string} name
         *  @param {Flag} flag
         * }
         */
        eachFlag: function(fn, context) {
            var self = this, flag;
            for (flag in self.flags) {
                self.flags.forEach(function(f){
                    fn.call(context, flag, f);
                });
            }
        },

        /**
         * @method removeFlag 
         * @param {string} name
         * @param {Flag} flag {
         *  @optional
         * }
         */

         /**
          * @method removeFlag
          * @param {Flag} flag
          */
        removeFlag: function(name, flag) {

            if (name instanceof Flag) {
                flag = name;
                name = flag.name;
            }

            if (this.hasFlag(name)) {
                if (!flag) {
                    delete this.flags[name];
                    return;
                }
                var inx = this.flags[name].indexOf(flag);
                if (inx !== -1) {
                    this.flags[name].splice(inx, 1);
                }
            }
        },

        /**
         * @method
         * @param {string} name
         */
        setName: function(name) {
            this.name = name;
        },

        /**
         * @method
         * @param {string} name
         * @returns {bool}
         */
        isThe: function(name) {
            return this.name === name || 
                    this.fullName === name ||
                    this.fullName === this.type +':'+ name;
        },

        /**
         * @method
         * @param {string} name
         */
        setFullName: function(name) {

            var self = this;

            if (name && (!self.fullName || self.fullName != name)) {
                self.fullName = name;
                self.doc.addUniqueItem(self);
            }
        },

        /**
         * @method
         * @param {string} name
         */
        setGroup: function(name) {
            this.group = name;
            if (this.group != this.type) {
                this.pcall("setGroup", this);
            }
        },


        applyInheritance: function() {

            var self = this,
                doc = self.doc,
                flags = self.flags;

            self.applyInheritance = emptyFn;

            if (!flags) {
                return;
            }

            ["extends", "implements", "mixes", "md-extend"].forEach(function(flag){
                if (flags.hasOwnProperty(flag)) {

                    flags[flag].forEach(function(flagObj){

                        parentClass = typeof flagObj == "string" ? 
                                        flagObj : flagObj.props.ref;

                        var parent = doc.getItem(parentClass);

                        if (parent) {
                            parent.applyInheritance();
                            self.inheritFrom(parent, flag);
                        }
                    });
                }
            });
        },

        inheritFrom: function(parent, inheritanceFlag) {

            var self = this;

            var res = self.pcall("extend", self, parent, inheritanceFlag);

            if (res !== false) {

                parent.eachItem(function(item){
                    if (!self.getItem(item.type, item.name)) {
                        var newItem = item.clone(self);
                        if (inheritanceFlag != "md-extend") {
                            newItem.addFlag("inherited", parent.fullName);
                        }
                        self.addItem(newItem);
                    }
                    else {
                        if (inheritanceFlag != "md-extend") {
                            self.getItem(item.type, item.name)
                                .addFlag("overrides", parent.fullName);
                        }
                    }
                }, null, true);

                if (inheritanceFlag === "md-extend") {
                    parent.eachFlag(function(name, f){
                        self.addFlag(f.clone()).forEach(function(f){
                            f.setProperty("inherited", true);
                        });
                    });
                }
            }

            self.pcall("extended", self, parent, inheritanceFlag)
        },

        hasInherited: function() {
            var has = false;
            this.eachChild(function(item){
                if (item.hasFlag("inherited")) {
                    has = true;
                }
            });
            return has;
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

        /**
         * @method
         * @returns {array}
         */
        getParents: function() {

            var parents = [],
                parent = this.parent;

            while (parent) {
                parents.push(parent);
                parent = parent.parent;
            }

            return parents;
        },

        /**
         * @method
         */
        getParent: function() {
            return this.parent;
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

        /**
         * @method
         * @param {string} name
         * @param {string} type
         * @param {bool} thisOnly Search only among direct children
         * @returns {array}
         */
        findItem: function(name, type, thisOnly) {

            var found = [];

            if (!type && name.indexOf(":") !== -1) {
                name = name.split(":");
                type = name.shift();
                name = name.pop();
            }
 
            this.eachItem(function(item){

                if (name === item.name) {

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

                if (name === item.fullName) {
                    found.push(item);
                }
                
            }, null, thisOnly);

            return found;
        },

        /**
         * @method
         */
        getFullName: function() {
            if (!this.fullName) {
                this.resolveFullName();
            }
            return this.fullName;
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
            this.resolveNames(["extends", "implements", "mixes", "md-extend"]);
        },

        resolveOtherNames: function() {
            this.resolveNames(null, ["extends", "implements", "mixes", "md-extend"]);
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

        /**
         * @method
         * @returns {array}
         */
        getChildren: function() {
            var children = [];
            this.eachChild(function(item){
                children.push(item);
            });
            return children;
        },

        /**
         * @method
         * @param {function} fn{
         *  @param {Item} item
         * }
         * @param {object} context
         * @param {bool} includeSelf apply callback to itself too
         * @param {array} args
         */
        eachChild: function(fn, context, includeSelf, args) {
            this.eachItem(fn, context, true, includeSelf, args);
        },

        /**
         * @method
         * @param {function} fn {
         *  @param {Item} item
         * }
         * @param {object} context
         * @param {bool} thisOnly Only among direct children
         * @param {bool} includeSelf apply callback to itself too
         * @param {array} args
         */
        eachItem: function(fn, context, thisOnly, includeSelf, args) {

            var k, self = this;
            args = args || [];

            var exec = function(item) {

                if (typeof fn == "function") {
                    fn.apply(context, [item].concat(args));
                }
                else {
                    if (fn.indexOf(".") == -1 && item[fn]) {
                        item[fn].apply(item, args); 
                    }
                    else {
                        item.pcall.apply(item, [fn, item].concat(args));
                    }
                }

                if (!thisOnly) {
                    item.eachItem(fn, context, false, false, args);
                }
            };

            if (includeSelf) {
                var prevThisOnly = thisOnly;
                thisOnly = true;
                exec(self);
                thisOnly = prevThisOnly;
            }

            for (k in self.items) {
                self.items[k].forEach(exec);
            }
        },

        /**
         * @method
         * @param {function} cb {
         *  @param {string} name
         *  @param {Flag} flag
         * }
         * @param {object} context
         * @param {string} only Only flags with this name
         */
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

        /**
         * @method
         * @param {string} name
         * @param {*} value
         */
        setValue: function(name, value) {
            this.values[name] = value;
        },

        /**
         * Get value from this item or one of its parents
         * @method
         * @param {string} name
         * @param {bool} localOnly {
         *  @default false
         * }
         */
        getValue: function(name, localOnly) {
            if (this.values.hasOwnProperty(name)) {
                return this.values[name];
            }
            if (!localOnly && this.parent) {
                return this.parent.getValue(name);
            }
            return null;
        },

        /**
         * Add key-value pair that will be exported as is
         * @param {string} name
         * @param {*} value
         */
        addToExport: function(name, value) {
            this.toExport[name] = value;
        },

        /**
         * Add key-value pair that will be exported as is
         * @param {string} name
         * @param {*} value
         */
        addToStructExport: function(name, value) {
            this.toStructExport[name] = value;
        },


        exportData: function(currentParent, noChildren, noHelpers) {

            var exportData = this.pget("exportData");

            if (exportData) {
                return exportData(this, noChildren);
            }

            var self = this,
                k,
                exprt =  extend({}, self.toExport, {
                    isApiItem: true,
                    group: self.group,
                    type: self.type,
                    name:  self.name,
                    fullName: self.fullName,
                    file: self.file.exportPath,
                    originalFile: self.file.path,
                    fileType: self.file.ext,
                    template: self.file.ext + ".item." + self.type,
                    hasInherited: self.hasInherited(),
                    isInherited: self.hasFlag("inherited"),
                    level: self.level,
                    flags: {},
                    plainFlags: {},
                    booleanFlags: [],
                    children: [],
                    childTypes: []
                });

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
                if (self.flags.hasOwnProperty(k) && 
                    k != "description" && 
                    k.substr(0,3) !== "md-") {

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

        exportToStructure: function() {
            return extend(
                {
                    id: this.fullName,
                    name: this.name,
                    pathPrefix: "item"
                }, 
                this.toStructExport,
                true, false
            );
        },

        exportChildren: function(items, noHelpers, plain) {

            var self = this,
                exprt = plain ? [] :  {
                    children: [],
                    childTypes: []
                },
                chGroups = {},
                typeProps;

            if (!noHelpers && !plain) {
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

                if (!plain && !chGroups[type]) {

                    typeProps = child.getTypeProps();

                    if (typeProps && typeProps.virtual) {
                        return;
                    }

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

                if (!plain) {
                    chGroups[type].items.push(child.exportData(self, false, noHelpers));
                }
                else {
                    exprt.push(child.exportData(self, false, noHelpers));
                }
            });

            /*if (!plain) {
                var sortGroups = self.doc.pget("sortExportChildrenGroups");
                if (sortGroups) {
                    exprt.children = sortGroups(self.doc, exprt.children);
                }
            }*/

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


    Item.isThe = function(item, name) {
        return item.name === name || 
                item.fullName === name ||
                item.fullName === item.type +':'+ name;
    };

    return Item;


}());
