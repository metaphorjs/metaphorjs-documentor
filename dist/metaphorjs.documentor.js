
function isFunction(value) {
    return typeof value == 'function';
};

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



function isString(value) {
    return typeof value == "string" || value === ""+value;
    //return typeof value == "string" || varType(value) === 0;
};



/**
 * @param {*} value
 * @returns {boolean}
 */
function isArray(value) {
    return typeof value == "object" && varType(value) === 5;
};

var strUndef = "undefined";



function isObject(value) {
    if (value === null || typeof value != "object") {
        return false;
    }
    var vt = varType(value);
    return vt > 2 || vt == -1;
};



var Cache = function(){

    var globalCache;

    /**
     * @class Cache
     * @param {bool} cacheRewritable
     * @constructor
     */
    var Cache = function(cacheRewritable) {

        var storage = {};

        if (arguments.length == 0) {
            cacheRewritable = true;
        }

        return {

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
                return storage[name] ? storage[name].value : undefined;
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
                return rec ? rec.value : undefined;
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
             * @method
             */
            destroy: function() {

                storage = null;
                cacheRewritable = null;

                this.add = null;
                this.get = null;
                this.destroy = null;
                this.exists = null;
                this.remove = null;
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





/**
 * @class Namespace
 */
var Namespace = function(){


    /**
     * @param {Object} root optional; usually window or global
     * @param {String} rootName optional. If you want custom object to be root and
     * this object itself if the first level of namespace: {@code ../examples/main.js}
     * @param {Cache} cache optional
     * @constructor
     */
    var Namespace   = function(root, rootName, cache) {

        cache       = cache || new Cache(false);
        var self    = this,
            rootL   = rootName ? rootName.length : null;

        if (!root) {
            if (typeof global != strUndef) {
                root    = global;
            }
            else {
                root    = window;
            }
        }

        var normalize   = function(ns) {
            if (ns && rootName && ns.substr(0, rootL) != rootName) {
                return rootName + "." + ns;
            }
            return ns;
        };

        var parseNs     = function(ns) {

            ns = normalize(ns);

            var tmp     = ns.split("."),
                i,
                last    = tmp.pop(),
                parent  = tmp.join("."),
                len     = tmp.length,
                name,
                current = root;


            if (cache[parent]) {
                return [cache[parent], last, ns];
            }

            if (len > 0) {
                for (i = 0; i < len; i++) {

                    name    = tmp[i];

                    if (rootName && i == 0 && name == rootName) {
                        current = root;
                        continue;
                    }

                    if (current[name] === undf) {
                        current[name]   = {};
                    }

                    current = current[name];
                }
            }

            return [current, last, ns];
        };

        /**
         * Get namespace/cache object
         * @method
         * @param {string} ns
         * @param {bool} cacheOnly
         * @returns {*}
         */
        var get       = function(ns, cacheOnly) {

            ns = normalize(ns);

            if (cache.exists(ns)) {
                return cache.get(ns);
            }

            if (cacheOnly) {
                return undf;
            }

            var tmp     = ns.split("."),
                i,
                len     = tmp.length,
                name,
                current = root;

            for (i = 0; i < len; i++) {

                name    = tmp[i];

                if (rootName && i == 0 && name == rootName) {
                    current = root;
                    continue;
                }

                if (current[name] === undf) {
                    return undf;
                }

                current = current[name];
            }

            if (current) {
                cache.add(ns, current);
            }

            return current;
        };

        /**
         * Register item
         * @method
         * @param {string} ns
         * @param {*} value
         */
        var register    = function(ns, value) {

            var parse   = parseNs(ns),
                parent  = parse[0],
                name    = parse[1];

            if (isObject(parent) && parent[name] === undf) {

                parent[name]        = value;
                cache.add(parse[2], value);
            }

            return value;
        };

        /**
         * Item exists
         * @method
         * @param {string} ns
         * @returns boolean
         */
        var exists      = function(ns) {
            return get(ns, true) !== undf;
        };

        /**
         * Add item only to the cache
         * @function add
         * @param {string} ns
         * @param {*} value
         */
        var add = function(ns, value) {

            ns = normalize(ns);
            cache.add(ns, value);
            return value;
        };

        /**
         * Remove item from cache
         * @method
         * @param {string} ns
         */
        var remove = function(ns) {
            ns = normalize(ns);
            cache.remove(ns);
        };

        /**
         * Make alias in the cache
         * @method
         * @param {string} from
         * @param {string} to
         */
        var makeAlias = function(from, to) {

            from = normalize(from);
            to = normalize(to);

            var value = cache.get(from);

            if (value !== undf) {
                cache.add(to, value);
            }
        };

        self.register   = register;
        self.exists     = exists;
        self.get        = get;
        self.add        = add;
        self.remove     = remove;
        self.normalize  = normalize;
        self.makeAlias  = makeAlias;
    };

    Namespace.prototype.register = null;
    Namespace.prototype.exists = null;
    Namespace.prototype.get = null;
    Namespace.prototype.add = null;
    Namespace.prototype.remove = null;
    Namespace.prototype.normalize = null;
    Namespace.prototype.makeAlias = null;

    var globalNs;

    /**
     * Get global namespace
     * @method
     * @static
     * @returns {*}
     */
    Namespace.global = function() {
        if (!globalNs) {
            globalNs = new Namespace;
        }
        return globalNs;
    };

    return Namespace;

}();



var slice = Array.prototype.slice;



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


function emptyFn(){};



var instantiate = function(fn, args) {

    var Temp = function(){},
        inst, ret;

    Temp.prototype  = fn.prototype;
    inst            = new Temp;
    ret             = fn.apply(inst, args);

    // If an object has been returned then return it otherwise
    // return the original instance.
    // (consistent with behaviour of the new operator)
    return isObject(ret) || ret === false ? ret : inst;

};


var intercept = function(origFn, interceptor, context, origContext, when, replaceValue) {

    when = when || "before";

    return function() {

        var intrRes,
            origRes;

        if (when == "instead") {
            return interceptor.apply(context || origContext, arguments);
        }
        else if (when == "before") {
            intrRes = interceptor.apply(context || origContext, arguments);
            origRes = intrRes !== false ? origFn.apply(origContext || context, arguments) : null;
        }
        else {
            origRes = origFn.apply(origContext || context, arguments);
            intrRes = interceptor.apply(context || origContext, arguments);
        }

        return replaceValue ? intrRes : origRes;
    };
};



var Class = function(){


    var proto   = "prototype",

        constr  = "$constructor",

        $constr = function $constr() {
            var self = this;
            if (self.$super && self.$super !== emptyFn) {
                self.$super.apply(self, arguments);
            }
        },

        wrapPrototypeMethod = function wrapPrototypeMethod(parent, k, fn) {

            var $super = parent[proto][k] || (k == constr ? parent : emptyFn) || emptyFn;

            return function() {
                var ret,
                    self    = this,
                    prev    = self.$super;

                self.$super     = $super;
                ret             = fn.apply(self, arguments);
                self.$super     = prev;

                return ret;
            };
        },

        preparePrototype = function preparePrototype(prototype, cls, parent, onlyWrap) {
            var k, ck, pk, pp = parent[proto];

            for (k in cls) {
                if (cls.hasOwnProperty(k)) {
                    
                    pk = pp[k];
                    ck = cls[k];

                    prototype[k] = isFunction(ck) && (!pk || isFunction(pk)) ?
                                    wrapPrototypeMethod(parent, k, ck) :
                                    ck;
                }
            }

            if (onlyWrap) {
                return;
            }

            prototype.$plugins = null;

            if (pp.$beforeInit) {
                prototype.$beforeInit = pp.$beforeInit.slice();
                prototype.$afterInit = pp.$afterInit.slice();
                prototype.$beforeDestroy = pp.$beforeDestroy.slice();
                prototype.$afterDestroy = pp.$afterDestroy.slice();
            }
            else {
                prototype.$beforeInit = [];
                prototype.$afterInit = [];
                prototype.$beforeDestroy = [];
                prototype.$afterDestroy = [];
            }
        },
        
        mixinToPrototype = function(prototype, mixin) {
            
            var k;
            for (k in mixin) {
                if (mixin.hasOwnProperty(k)) {
                    if (k == "$beforeInit") {
                        prototype.$beforeInit.push(mixin[k]);
                    }
                    else if (k == "$afterInit") {
                        prototype.$afterInit.push(mixin[k]);
                    }
                    else if (k == "$beforeDestroy") {
                        prototype.$beforeDestroy.push(mixin[k]);
                    }
                    else if (k == "$afterDestroy") {
                        prototype.$afterDestroy.push(mixin[k]);
                    }
                    else if (!prototype[k]) {
                        prototype[k] = mixin[k];
                    }
                }
            }
        };


    var Class = function(ns){

        if (!ns) {
            ns = new Namespace;
        }

        var createConstructor = function() {

            return function() {

                var self    = this,
                    before  = [],
                    after   = [],
                    args    = arguments,
                    newArgs,
                    i, l,
                    plugins, plugin,
                    plCls;

                if (!self) {
                    throw "Must instantiate via new";
                }

                self.$plugins = [];

                newArgs = self[constr].apply(self, arguments);

                if (newArgs && isArray(newArgs)) {
                    args = newArgs;
                }

                plugins = self.$plugins;

                for (i = -1, l = self.$beforeInit.length; ++i < l;
                     before.push([self.$beforeInit[i], self])) {}

                for (i = -1, l = self.$afterInit.length; ++i < l;
                     after.push([self.$afterInit[i], self])) {}

                if (plugins && plugins.length) {

                    for (i = 0, l = plugins.length; i < l; i++) {

                        plugin = plugins[i];

                        if (isString(plugin)) {
                            plCls = plugin;
                            plugin = ns.get("plugin." + plugin, true);
                            if (!plugin) {
                                throw plCls + " not found";
                            }
                        }

                        plugin = new plugin(self, args);

                        if (plugin.$beforeHostInit) {
                            before.push([plugin.$beforeHostInit, plugin]);
                        }
                        if (plugin.$afterHostInit) {
                            after.push([plugin.$afterHostInit, plugin]);
                        }

                        plugins[i] = plugin;
                    }
                }

                for (i = -1, l = before.length; ++i < l;
                     before[i][0].apply(before[i][1], args)){}

                if (self.$init) {
                    self.$init.apply(self, args);
                }

                for (i = -1, l = after.length; ++i < l;
                     after[i][0].apply(after[i][1], args)){}

            };
        };


        /**
         * @class BaseClass
         * @constructor
         */
        var BaseClass = function() {

        };

        extend(BaseClass.prototype, {

            $class: null,
            $extends: null,
            $plugins: null,
            $mixins: null,

            $destroyed: false,

            $constructor: emptyFn,
            $init: emptyFn,
            $beforeInit: [],
            $afterInit: [],
            $beforeDestroy: [],
            $afterDestroy: [],

            /**
             * Get class name
             * @method
             * @returns {string}
             */
            $getClass: function() {
                return this.$class;
            },

            /**
             * Get parent class name
             * @method
             * @returns {null}
             */
            $getParentClass: function() {
                return this.$extends;
            },

            /**
             * Intercept method
             * @method
             * @param {string} method Intercepted method name
             * @param {function} fn function to call before or after intercepted method
             * @param {object} newContext optional interceptor's "this" object
             * @param {string} when optional, when to call interceptor before | after | instead; default "before"
             * @param {bool} replaceValue optional, return interceptor's return value or original method's; default false
             */
            $intercept: function(method, fn, newContext, when, replaceValue) {
                var self = this;
                self[method] = intercept(self[method], fn, newContext || self, self, when, replaceValue);
            },

            /**
             * Implement new methods or properties on instance
             * @param {object} methods
             */
            $implement: function(methods) {
                var $self = this.constructor;
                if ($self && $self.$parent) {
                    preparePrototype(this, methods, $self.$parent);
                }
            },

            /**
             * @method
             */
            $destroy: function() {

                var self    = this,
                    before  = self.$beforeDestroy,
                    after   = self.$afterDestroy,
                    plugins = self.$plugins,
                    i, l, res;

                if (self.$destroyed) {
                    return;
                }

                self.$destroyed = true;

                for (i = -1, l = before.length; ++i < l;
                     before[i].apply(self, arguments)){}

                for (i = 0, l = plugins.length; i < l; i++) {
                    if (plugins[i].$beforeHostDestroy) {
                        plugins[i].$beforeHostDestroy();
                    }
                }

                res = self.destroy();

                for (i = -1, l = before.length; ++i < l;
                     after[i].apply(self, arguments)){}

                for (i = 0, l = plugins.length; i < l; i++) {
                    plugins[i].$destroy();
                }

                if (res !== false) {
                    for (i in self) {
                        if (self.hasOwnProperty(i)) {
                            self[i] = null;
                        }
                    }
                }

                self.$destroyed = true;
            },

            /**
             * Implement your destroy actions here
             * @method
             */
            destroy: function(){}
        });

        BaseClass.$self = BaseClass;

        /**
         * Create an instance of current class.
         * @method
         * @static
         * @returns {object} class instance
         */
        BaseClass.$instantiate = function() {

            var cls = this,
                args = arguments,
                cnt = args.length;

            // lets make it ugly, but without creating temprorary classes and leaks.
            // and fallback to normal instantiation.

            switch (cnt) {
                case 0:
                    return new cls;
                case 1:
                    return new cls(args[0]);
                case 2:
                    return new cls(args[0], args[1]);
                case 3:
                    return new cls(args[0], args[1], args[2]);
                case 4:
                    return new cls(args[0], args[1], args[2], args[3]);
                default:
                    return instantiate(cls, args);
            }
        };

        /**
         * Override class methods
         * @method
         * @static
         * @param {object} methods
         */
        BaseClass.$override = function(methods) {
            var $self = this.$self,
                $parent = this.$parent;

            if ($self && $parent) {
                preparePrototype($self.prototype, methods, $parent);
            }
        };

        /**
         * Create new class based on current one
         * @param {object} definition
         * @param {object} statics
         * @returns {function}
         */
        BaseClass.$extend = function(definition, statics) {
            return define(definition, statics, this);
        };


        /**
         * @class Class
         * @method
         * @param {object} definition
         * @param {object} statics
         * @param {string|function} $extends
         */
        var define = function(definition, statics, $extends) {

            definition          = definition || {};
            
            var name            = definition.$class,
                parentClass     = $extends || definition.$extends,
                mixins          = definition.$mixins,
                pConstructor,
                i, l, k, noop, prototype, c, mixin;

            if (parentClass) {
                if (isString(parentClass)) {
                    pConstructor = ns.get(parentClass);
                }
                else {
                    pConstructor = parentClass;
                    parentClass = pConstructor.$class || "";
                }
            }
            else {
                pConstructor = BaseClass;
                parentClass = "";
            }

            if (parentClass && !pConstructor) {
                throw parentClass + " not found";
            }

            if (name) {
                name = ns.normalize(name);
            }

            definition.$class   = name;
            definition.$extends = parentClass;
            definition.$mixins  = null;


            noop                = function(){};
            noop[proto]         = pConstructor[proto];
            prototype           = new noop;
            noop                = null;
            definition[constr]  = definition[constr] || $constr;

            preparePrototype(prototype, definition, pConstructor);

            if (mixins) {
                for (i = 0, l = mixins.length; i < l; i++) {
                    mixin = mixins[i];
                    if (isString(mixin)) {
                        mixin = ns.get("mixin." + mixin, true);
                    }
                    mixinToPrototype(prototype, mixin);
                }
            }

            c = createConstructor();
            prototype.constructor = c;
            c[proto] = prototype;

            for (k in BaseClass) {
                if (k != proto && BaseClass.hasOwnProperty(k)) {
                    c[k] = BaseClass[k];
                }
            }

            for (k in pConstructor) {
                if (k != proto && pConstructor.hasOwnProperty(k)) {
                    c[k] = pConstructor[k];
                }
            }

            if (statics) {
                for (k in statics) {
                    if (k != proto && statics.hasOwnProperty(k)) {
                        c[k] = statics[k];
                    }
                }
            }

            c.$parent   = pConstructor;
            c.$self     = c;

            if (name) {
                ns.register(name, c);
            }

            return c;
        };




        /**
         * Instantiate class. Pass constructor parameters after "name"
         * @method
         * @param {string} name Full name of the class
         * @returns {object} class instance
         */
        var factory = function(name) {

            var cls     = ns.get(name),
                args    = slice.call(arguments, 1);

            if (!cls) {
                throw name + " not found";
            }

            return cls.$instantiate.apply(cls, args);
        };



        /**
         * Is cmp instance of cls
         * @method
         * @param {object} cmp
         * @param {string|object} cls
         * @returns {boolean}
         */
        var isInstanceOf = function(cmp, cls) {
            var _cls    = isString(cls) ? ns.get(cls) : cls;
            return _cls ? cmp instanceof _cls : false;
        };



        /**
         * Is one class subclass of another class
         * @method
         * @param {string|object} childClass
         * @param {string|object} parentClass
         * @return {bool}
         */
        var isSubclassOf = function(childClass, parentClass) {

            var p   = childClass,
                g   = ns.get;

            if (!isString(parentClass)) {
                parentClass  = parentClass.prototype.$class;
            }
            else {
                parentClass = ns.normalize(parentClass);
            }
            if (isString(childClass)) {
                p   = g(ns.normalize(childClass));
            }

            while (p && p.prototype) {

                if (p.prototype.$class == parentClass) {
                    return true;
                }

                p = p.$parent;
            }

            return false;
        };

        var self    = this;

        self.factory = factory;
        self.isSubclassOf = isSubclassOf;
        self.isInstanceOf = isInstanceOf;
        self.define = define;

        /**
         * @type {function} BaseClass reference to the BaseClass class
         */
        self.BaseClass = BaseClass;

    };

    Class.prototype = {

        factory: null,
        isSubclassOf: null,
        isInstanceOf: null,
        define: null
    };

    var globalCs;

    /**
     * Get default global class manager
     * @method
     * @static
     * @returns {Class}
     */
    Class.global = function() {
        if (!globalCs) {
            globalCs = new Class(Namespace.global());
        }
        return globalCs;
    };

    return Class;

}();




var ns = new Namespace({});




var cs = new Class(ns);


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



var fs = require("fs");

var isFile = function(filePath) {
    return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
};




var isDir = function(dirPath) {
    return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
};

var path = require("path");

var getFileList = function(directory) {

    var fileList,
        dir,
        filePath,
        levels = 0,
        files = [];

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
            if (isFile(filePath) && path.extname(filePath) == ".js") {
                files.push(filePath);
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

    type: null,
    content: null,
    props: null,

    $init: function(content, type, props) {

        var ct;

        if (content && typeof content == "object") {
            type = content.type;
            ct = content.contentType;
            content = content.content;
        }

        type = type || (typeof content);

        this.props = props || {};

        if (type == "file") {
            this.props["fromFile"] = content;
            this.props["fileType"] = path.extname(content).substr(1);
            content = fs.readFileSync(content).toString();
            type = ct || "string";
        }

        this.type = type;
        this.content = content;
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

    getData: function() {
        return extend({}, {
            contentType: this.type,
            content: this.content
        }, this.props);

    }

});




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
                    f = content instanceof Flag ? content : new Flag(content);
                    self.flags[flag].push(f);
                    added.push(f);
                });
            }
            else {
                f = content instanceof Flag ? content : new Flag(content);
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








        getData: function(currentParent) {

            var self = this,
                k,
                exprt =  {
                    name:  self.name,
                    fullName: self.fullName,
                    flags: {},
                    file: self.file.exportPath
                };

            if (self.comment) {
                exprt.line = self.comment.line;
            }

            if (currentParent && currentParent !== self.parent) {
                exprt.inheritedFrom = self.parent.fullName;
            }

            for (k in self.flags) {
                if (self.flags.hasOwnProperty(k)) {
                    exprt.flags[k] = [];
                    self.flags[k].forEach(function(flag){
                        exprt.flags[k].push(flag.getData());
                    });
                }
            }

            self.eachItem(function(child){

                var type = child.type;

                if (!exprt.hasOwnProperty(type)) {
                    exprt[type] = [];
                }

                exprt[type].push(child.getData(self));

            }, null, true);

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



var File = function(){

    var all = {};

    /**
     * @class
     * @extends Base
     */
    var File = Base.$extend({


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

        $init: function() {

            var self = this;

            if (self.ext != "*") {

                self.contextStack = [self.doc.root];
                self.comments = [];
                self.tmp = {};
                self.dir = path.dirname(self.path);
                self.ext = path.extname(self.path).substr(1);

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

        pget: function(name, collect, passthru) {
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
                all[filePath] = new File({
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

    return File;

}();



var Renderer = Base.$extend({

    doc: null,

    render: function() {

    }

});



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






var Documentor = Base.$extend({

    files: null,
    root: null,
    hooks: null,
    id: null,
    map: null,
    pages: null,

    $init: function(){

        var self = this;

        self.id = nextUid();
        self.files = {};
        self.map = {};
        self.pages = {};
        self.root = new Item({
            doc: self,
            type: "root",
            file: new File({
                ext: "*",
                doc: self
            })
        });

        self.hooks = new Cache(true);


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
            includes = file.pcall("resolveIncludes", file);

        if (includes) {
            includes.forEach(function(include){
                self.addFile(include, options);
            });
        }
    },


    addPage: function(file, options) {

        if (!this.pages[file]) {
            this.pages[file] = options;
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

        this.map = {};
        this.pages = {};

        this.root.$destroy();

        for (var f in this.files) {
            if (this.files.hasOwnProperty(f)) {
                this.files[f].$destroy();
            }
        }

        this.files = {};
        this.root = null;
    }

}, {
    RendererBase: Renderer,
    ItemBase: Item,
    Base: Base,
    File: File,
    Comment: Comment,


    hooks: globalCache


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

function createFunctionContext(commentPart, comment) {

    var res = comment.file.pcall("item.extractTypeAndName",
        comment.file, comment.endIndex, true, false);

    if (res) {
        return {flag: res[0], content: res[1], sub: []};
    }
};



globalCache.add("file.*.comment.flagAliases", {

    "type": "var",
    "return": "returns",
    "extend": "extends",
    "implement": "implements",
    "emit": "emits",
    "throw": "throws"

});



globalCache.add("file.*.comment.getCurly", function(content, start, backwards, returnIndexes) {

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



globalCache.add("file.*.comment.getFlagAliases", function(file){

    var all = file.pget("comment.flagAliases", true),
        aliases = {},
        i, l;

    for (i = 0, l = all.length; i < l; i++) {
        extend(aliases, all[i]);
    }

    return aliases;
});



(function(){


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
                    parts.push({flag: descrFlag, content: description, sub: []});
                    description = "";
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

                parts.push({flag: flag, content: part, sub: sub || []});
            }
            else if (part) {
                if (description) {
                    description += "\n"
                }
                description += line;
            }
        }

        if (description) {
            parts.push({flag: descrFlag, content: description, sub: []});
        }


        return parts;

    };


    return globalCache.add("file.*.comment.parseComment",  parseComment);
}());





globalCache.add("file.*.comment.removeAsterisk", function(text) {

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





globalCache.add("file.*.comment.sortParts", function(parts, comment) {

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
                    return 0;
                }
                return aCtx ? -1 : 1;
            }

            return 0;
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



globalCache.add("file.*.getItemType", function(type, file) {

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


globalCache.add("file.*.item.*.*.add", function(flag, content, item) {

    if (item.type == flag && typeof content == "string" && content) {
        item.setName(content.trim());
        // stop cycle
        return false;
    }
});



globalCache.add("file.*.item.*.*.prepare", function(flag, content, item) {

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



globalCache.add("file.*.item.*.emits.resolveName", function(item, flag, content){

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



globalCache.add("file.*.item.*.extends.resolveName", resolveExtendableName);



globalCache.add("file.*.item.*.implements.resolveName", resolveExtendableName);



globalCache.add("file.*.item.*.mixes.resolveName", resolveExtendableName);



globalCache.add("file.*.item.*.private.add", addAccessFlag);



globalCache.add("file.*.item.*.protected.add", addAccessFlag);



globalCache.add("file.*.item.*.public.add", addAccessFlag);



globalCache.add("file.*.item.*.returns.prepare", function(flag, content, item) {

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



globalCache.add("file.*.item.*.returns.resolveName", resolveTypeName);



globalCache.add("file.*.item.*.throws.resolveName", resolveTypeName);



globalCache.add("file.*.item.*.type.resolveName", resolveTypeName);



globalCache.add("file.*.item.?.param.createContext", createFunctionContext);




globalCache.add("file.*.item.?.requiredContext", {
    "param": ["function", "method"],
    "returns": ["function", "method"],
    "constructor": ["method"]
});



globalCache.add("*.item.?.returns.createContext", createFunctionContext);


globalCache.add("file.*.item.param.param.add", addVarFlag);



globalCache.add("file.*.item.param.param.parse", parseVarFlag);


globalCache.add("file.*.item.property.property.add", addVarFlag);



globalCache.add("file.*.item.property.property.parse", parseVarFlag);


globalCache.add("file.*.item.var.var.add", addVarFlag);



globalCache.add("file.*.item.var.var.parse", parseVarFlag);




globalCache.add("file.*.items", [
    {
        name: "root",
        children: ["*", "!param"]
    }
]);



globalCache.add("file.*.normalizeType", function(type, file){

    var aliases = file.pget("typeAliases"),
        ret = [],
        tmp = type.split("|");

    if (aliases) {
        tmp.forEach(function(type){
            ret.push(aliases[type] || type);
        });
    }

    return ret;
});



globalCache.add("file.js.item.*.description.added", function(flag, item){

    var ft;

    if (ft = flag.getProperty("fileType")) {
        if (ft == "js") {
            flag.setType("code");
        }
    }

});



globalCache.add("file.js.item.*.getFullName", function(item) {

    var parents = item.getParents().reverse(),
        name = item.name,
        fullName = "";

    if (!name) {
        return null;
    }



    parents.push(item);

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



globalCache.add("file.js.item.extractTypeAndName", function(file, startIndex, checkFunctions, checkVars) {

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





(function(){

    var classes = function(name) {
        return {
            name: name,
            children: ["method", "property", "const", "event", "!param"],
            extendable: true,
            transform: {
                "function": "method",
                "var":      "property"
            }
        };
    };

    var funcs = function(name) {
        return {
            name: name,
            onePerComment: true,
            multiple: name != "event",
            children: ["param"],
            transform: {}
        }
    };

    var vars = function(name) {

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
            }
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
            }
        },
        {
            name: "module",
            namespace: true,
            children: ["*", "!namespace", "!module", "!param"],
            transform: {
                "method": "function"
            }
        },
        classes("class"),
        classes("interface"),
        classes("mixin"),
        funcs("function"),
        funcs("method"),
        funcs("event"),
        vars("param"),
        vars("var"),
        vars("property"),
        vars("const")
    ]);

}());



globalCache.add("file.js.resolveIncludes", function(file) {

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




globalCache.add("file.js.typeAliases", {

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



globalCache.add("renderer.json", Renderer.$extend({

    render: function() {
        return JSON.stringify(this.doc.getData(), null, 2);
    }

}, {
    mime: "application/json"
}));







globalCache.add("renderer.plain", Renderer.$extend({

    render: function() {

        var data = this.doc.getData(),
            html = "<ul>",
            keys = ["param", "var", "function", "namespace", "class", "property", "method"],
            key, value;

        var renderFlags = function(flagName, flags, wrap, splitter) {

            var html = "";

            flags.forEach(function(f, i){

                if (i > 0 && splitter) {
                    html += splitter;
                }

                if (wrap) {
                    html += '<' + wrap + '>';
                }

                if (f.contentType == "code") {
                    html += '<pre><code>';
                }

                html += f.content;

                if (f.contentType == "code") {
                    html += '</code></pre>';
                }

                if (wrap) {
                    html += '</' + wrap + '>';
                }

            });

            return html;
        };

        var renderItem = function(type, item) {

            html += '<li>';
            html += '<p>';

            if (type) {
                html += '<i>' + type + '</i> ';
            }

            if (item.name) {
                if (item.flags.type) {
                    html += '['+ (renderFlags(null, item.flags.type, null, ' | ')) +'] ';
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
                    html += ' : [' + (renderFlags(null, item.flags.returns, null, ' | ')) + ']';
                    delete item.flags.returns;
                }
            }

            html += '</p>';

            if (item.file && item.line) {
                html += '<p><sub>';
                html += item.file + " : " + item.line;
                html += '</sub></p>';
            }

            if (item.flags.description) {
                html += renderFlags(null, item.flags.description, 'p');
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
                value.forEach(function(f){
                    flags += '<li><p>'+key+' : '+ f.content +'</p></li>';
                });

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






globalCache.add("renderer.raw", Renderer.$extend({

    render: function() {
        return this.doc.getData();
    }

}));


module.exports = Documentor;
