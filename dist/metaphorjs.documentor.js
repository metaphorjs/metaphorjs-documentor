

var MetaphorJs = {


};




var noWindow = typeof window == "undefined";
window = noWindow ? {} : window;
var document = window.document || {};
var navigator = window.navigator || {};

MetaphorJs.setWindow = function(w) {

    if (noWindow) {
        window = w || {};
        document = window.document;
        navigator = window.navigator;
        noWindow = false;
    }

};

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




var ns  = new Namespace(MetaphorJs, "MetaphorJs");



var cs = new Class(ns);





var defineClass = cs.define;

function getAttr(el, name) {
    return el.getAttribute ? el.getAttribute(name) : null;
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







/**
 * <p>A javascript event system implementing two patterns - observable and collector.</p>
 *
 * <p>Observable:</p>
 * <pre><code class="language-javascript">
 * var o = new MetaphorJs.lib.Observable;
 * o.on("event", function(x, y, z){ console.log([x, y, z]) });
 * o.trigger("event", 1, 2, 3); // [1, 2, 3]
 * </code></pre>
 *
 * <p>Collector:</p>
 * <pre><code class="language-javascript">
 * var o = new MetaphorJs.lib.Observable;
 * o.createEvent("collectStuff", "all");
 * o.on("collectStuff", function(){ return 1; });
 * o.on("collectStuff", function(){ return 2; });
 * var results = o.trigger("collectStuff"); // [1, 2]
 * </code></pre>
 *
 * <p>Although all methods are public there is getApi() method that allows you
 * extending your own objects without overriding "destroy" (which you probably have)</p>
 * <pre><code class="language-javascript">
 * var o = new MetaphorJs.lib.Observable;
 * $.extend(this, o.getApi());
 * this.on("event", function(){ alert("ok") });
 * this.trigger("event");
 * </code></pre>
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
    * <p>You don't have to call this function unless you want to pass returnResult param.
    * This function will be automatically called from on() with
    * <code class="language-javascript">returnResult = false</code>,
    * so if you want to receive handler's return values, create event first, then call on().</p>
    *
    * <pre><code class="language-javascript">
    * var observable = new MetaphorJs.lib.Observable;
    * observable.createEvent("collectStuff", "all");
    * observable.on("collectStuff", function(){ return 1; });
    * observable.on("collectStuff", function(){ return 2; });
    * var results = observable.trigger("collectStuff"); // [1, 2]
    * </code></pre>
    *
    * @method
    * @access public
    * @param {string} name {
    *       Event name
    *       @required
    * }
    * @param {bool|string} returnResult {
    *   false -- do not return results except if handler returned "false". This is how
    *   normal observables work.<br>
    *   "all" -- return all results as array<br>
    *   "merge" -- merge all results into one array (each result must be array)<br>
    *   "first" -- return result of the first handler<br>
    *   "last" -- return result of the last handler
    *   @required
    * }
    * @return MetaphorJs.lib.ObservableEvent
    */
    createEvent: function(name, returnResult) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new Event(name, returnResult);
        }
        return events[name];
    },

    /**
    * @method
    * @access public
    * @param {string} name Event name
    * @return MetaphorJs.lib.ObservableEvent|undefined
    */
    getEvent: function(name) {
        name = name.toLowerCase();
        return this.events[name];
    },

    /**
    * Subscribe to an event or register collector function.
    * @method
    * @access public
    * @md-save on
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
            events[name] = new Event(name);
        }
        return events[name].on(fn, context, options);
    },

    /**
    * Same as on(), but options.limit is forcefully set to 1.
    * @method
    * @md-apply on
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
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return false;
        }
        return events[name].hasListener(fn, context);
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
    * @param {string} name Event name
    */
    destroy: function(name) {
        var events  = this.events;

        if (name) {
            name = name.toLowerCase();
            if (events[name]) {
                events[name].destroy();
                delete events[name];
            }
        }
        else {
            for (var i in events) {
                events[i].destroy();
            }

            this.events = {};
        }
    },

    /**
    * Get object with all functions except "destroy"
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


/**
 * This class is private - you can't create an event other than via Observable.
 * See MetaphorJs.lib.Observable reference.
 * @class ObservableEvent
 * @private
 */
var Event = function(name, returnResult) {

    var self    = this;

    self.name           = name;
    self.listeners      = [];
    self.map            = {};
    self.hash           = nextUid();
    self.uni            = '$$' + name + '_' + self.hash;
    self.suspended      = false;
    self.lid            = 0;
    self.returnResult   = returnResult === undf ? null : returnResult; // first|last|all
};


extend(Event.prototype, {

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
        var self        = this;
        self.listeners  = null;
        self.map        = null;
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
            limit:      options.limit || 0, // how many times the function is allowed to trigger
            start:      options.start || 1, // from which attempt it is allowed to trigger the function
            count:      0, // how many attempts to trigger the function was made
            append:     options.append, // append parameters
            prepend:    options.prepend // prepend parameters
        };

        if (first) {
            self.listeners.unshift(e);
        }
        else {
            self.listeners.push(e);
        }

        self.map[id] = e;

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
        options.once = true;

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
            returnResult    = self.returnResult;

        if (self.suspended || listeners.length == 0) {
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

            l.count++;

            if (l.count < l.start) {
                continue;
            }

            res = l.fn.apply(l.context, self._prepareArgs(l, arguments));

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






/**
 * @function trim
 * @param {String} value
 * @returns {string}
 */
var trim = function() {
    // native trim is way faster: http://jsperf.com/angular-trim-test
    // but IE doesn't have it... :-(
    if (!String.prototype.trim) {
        return function(value) {
            return isString(value) ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : value;
        };
    }
    return function(value) {
        return isString(value) ? value.trim() : value;
    };
}();



function isDate(value) {
    return varType(value) === 10;
};



function isRegExp(value) {
    return varType(value) === 9;
};

function isWindow(obj) {
    return obj === window ||
           (obj && obj.document && obj.location && obj.alert && obj.setInterval);
};



// from Angular

var equals = function(){

    var equals = function equals(o1, o2) {
        if (o1 === o2) return true;
        if (o1 === null || o2 === null) return false;
        if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
        var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
        if (t1 == t2) {
            if (t1 == 'object') {
                if (isArray(o1)) {
                    if (!isArray(o2)) return false;
                    if ((length = o1.length) == o2.length) {
                        for(key=0; key<length; key++) {
                            if (!equals(o1[key], o2[key])) return false;
                        }
                        return true;
                    }
                } else if (isDate(o1)) {
                    return isDate(o2) && o1.getTime() == o2.getTime();
                } else if (isRegExp(o1) && isRegExp(o2)) {
                    return o1.toString() == o2.toString();
                } else {
                    if (isWindow(o1) || isWindow(o2) || isArray(o2)) return false;
                    keySet = {};
                    for(key in o1) {
                        if (key.charAt(0) == '$' || isFunction(o1[key])) {//&& typeof o1[key] == "object") {
                            continue;
                        }
                        //if (isFunction(o1[key])) {
                        //    continue;
                        //}
                        if (!equals(o1[key], o2[key])) {
                            return false;
                        }
                        keySet[key] = true;
                    }
                    for(key in o2) {
                        if (!keySet.hasOwnProperty(key) &&
                            key.charAt(0) != '$' &&
                            o2[key] !== undf &&
                            !isFunction(o2[key])) return false;
                    }
                    return true;
                }
            }
        }
        return false;
    };

    return equals;
}();



var copy = function() {

    var win = typeof window != strUndef ? window : null,
        glob = typeof global != strUndef ? global : null;

    var copy = function copy(source, dest){

        if (win && source === win) {
            throw new Error("Cannot copy window object");
        }
        if (glob && source === glob) {
            throw new Error("Cannot copy global object");
        }

        if (!dest) {
            dest = source;
            if (source) {
                if (isArray(source)) {
                    dest = copy(source, []);
                } else if (isDate(source)) {
                    dest = new Date(source.getTime());
                } else if (isRegExp(source)) {
                    dest = new RegExp(source.source);
                } else if (isPlainObject(source)) {
                    dest = copy(source, {});
                }
            }
        } else {
            if (source === dest) {
                throw new Error("Objects are identical");
            }
            if (isArray(source)) {
                dest.length = 0;
                for ( var i = 0, l = source.length; i < l; i++) {
                    dest.push(copy(source[i]));
                }
            } else {
                var key;
                for (key in dest) {
                    delete dest[key];
                }
                for (key in source) {
                    if (source.hasOwnProperty(key)) {
                        if (key.charAt(0) == '$' || isFunction(source[key])) {
                            dest[key] = source[key];
                        }
                        else {
                            dest[key] = copy(source[key]);
                        }
                    }
                }
            }
        }
        return dest;
    };

    return copy;
}();



function isPrimitive(value) {
    var vt = varType(value);
    return vt < 3 && vt > -1;
};
// https://gist.github.com/jdalton/5e34d890105aca44399f

var isNative = function() {

    // Used to resolve the internal `[[Class]]` of values.
    var toString = Object.prototype.toString;

    // Used to resolve the decompiled source of functions.
    var fnToString = Function.prototype.toString;

    // Used to detect host constructors (Safari > 4; really typed array specific).
    var reHostCtor = /^\[object .+?Constructor\]$/;

    // Compile a regexp using a common native method as a template.
    // We chose `Object#toString` because there's a good chance it is not being mucked with.
    var reNative = RegExp('^' +
                          // Coerce `Object#toString` to a string.
                          String(toString)
                              // Escape any special regexp characters.
                              .replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')
                              // Replace mentions of `toString` with `.*?` to keep the template generic.
                              // Replace thing like `for ...` to support environments, like Rhino, which add extra
                              // info such as method arity.
                              .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    return function isNative(value) {
        var type = typeof value;
        return type == 'function'
            // Use `Function#toString` to bypass the value's own `toString` method
            // and avoid being faked out.
            ? (!('prototype' in value) || reNative.test(fnToString.call(value)))
            // Fallback to a host object check because some environments will represent
            // things like typed arrays as DOM methods which may not conform to the
            // normal native pattern.
            : (value && type == 'object' && reHostCtor.test(toString.call(value))) || false;
    };

}();

function returnFalse() {
    return false;
};



function levenshteinArray(from, to) {

    var m = from.length,
        n = to.length,
        D = new Array(m + 1),
        P = new Array(m + 1),
        i, j, c,
        route,
        cost,
        dist,
        ops = 0;

    if (m == n && m == 0) {
        return {
            changes: 0,
            distance: 0,
            prescription: []
        };
    }

    for (i = 0; i <= m; i++) {
        D[i]    = new Array(n + 1);
        P[i]    = new Array(n + 1);
        D[i][0] = i;
        P[i][0] = 'D';
    }
    for (i = 0; i <= n; i++) {
        D[0][i] = i;
        P[0][i] = 'I';
    }

    for (i = 1; i <= m; i++) {
        for (j = 1; j <= n; j++) {
            cost = (!equals(from[i - 1], to[j - 1])) ? 1 : 0;

            if(D[i][j - 1] < D[i - 1][j] && D[i][j - 1] < D[i - 1][j - 1] + cost) {
                //Insert
                D[i][j] = D[i][j - 1] + 1;
                P[i][j] = 'I';
            }
            else if(D[i - 1][j] < D[i - 1][j - 1] + cost) {
                //Delete
                D[i][j] = D[i - 1][j] + 1;
                P[i][j] = 'D';
            }
            else {
                //Replace or noop
                D[i][j] = D[i - 1][j - 1] + cost;
                if (cost == 1) {
                    P[i][j] = 'R';
                }
                else {
                    P[i][j] = '-';
                }
            }
        }
    }

    //Prescription
    route = [];
    i = m;
    j = n;

    do {
        c = P[i][j];
        route.push(c);
        if (c != '-') {
            ops++;
        }
        if(c == 'R' || c == '-') {
            i --;
            j --;
        }
        else if(c == 'D') {
            i --;
        }
        else {
            j --;
        }
    } while((i != 0) || (j != 0));

    dist = D[m][n];

    return {
        changes: ops / route.length,
        distance: dist,
        prescription: route.reverse()
    };
};
/**
 * @param {Function} fn
 * @param {Object} context
 * @param {[]} args
 * @param {number} timeout
 */
function async(fn, context, args, timeout) {
    setTimeout(function(){
        fn.apply(context, args || []);
    }, timeout || 0);
};



function error(e) {

    var stack = e.stack || (new Error).stack;

    if (typeof console != strUndef && console.log) {
        async(function(){
            console.log(e);
            if (stack) {
                console.log(stack);
            }
        });
    }
    else {
        throw e;
    }
};



var functionFactory = function() {

    var REG_REPLACE_EXPR    = /(^|[^a-z0-9_$\]\)'"])(\.)([^0-9])/ig,

        f               = Function,
        fnBodyStart     = 'try {',
        //getterBodyEnd   = ';} catch (thrownError) { return $$interceptor(thrownError, $$itself, ____); }',
        //setterBodyEnd   = ';} catch (thrownError) { return $$interceptor(thrownError, $$itself, ____, $$$$); }',
        getterBodyEnd   = ';} catch (thrownError) { return undefined; }',
        setterBodyEnd   = ';} catch (thrownError) { return undefined; }',


        /*interceptor     = function(thrownError, func, scope, value) {

            while (scope && !scope.$isRoot) {

                scope = scope.$parent;

                if (scope) {

                    try {
                        if (arguments.length == 4) {
                            return func.call(null, scope, value, emptyFn, func);
                        }
                        else {
                            return func.call(null, scope, emptyFn, func);
                        }
                    }
                    catch (newError) {}
                }
            }

            if (thrownError !== null) {
                error(thrownError);
            }

            return undf;
        },*/

        isFailed        = function(val) {
            return val === undf || (typeof val == "number" && isNaN(val));
        },

        wrapFunc        = function(func, returnsValue) {
            return function(scope) {
                var args = slice.call(arguments),
                    val;

                //args.push(interceptor);
                args.push(null);
                args.push(func);

                if (returnsValue) {
                    val = func.apply(null, args);
                    while (isFailed(val) && !scope.$isRoot) {
                        scope = scope.$parent;
                        args[0] = scope;
                        val = func.apply(null, args);
                    }
                    return val;
                }
                else {
                    return func.apply(null, args);
                }

                /*if (returnsValue && isFailed(val)) {//) {
                    args = slice.call(arguments);
                    args.unshift(func);
                    args.unshift(null);
                    return interceptor.apply(null, args);
                }
                else {
                    return val;
                }*/
            };
        },

        getterCache     = {},
        getterCacheCnt  = 0,

        createGetter    = function createGetter(expr) {

            try {
                if (!getterCache[expr]) {
                    getterCacheCnt++;
                    return getterCache[expr] = wrapFunc(new f(
                        '____',
                        '$$interceptor',
                        '$$itself',
                        "".concat(fnBodyStart, 'return ', expr.replace(REG_REPLACE_EXPR, '$1____.$3'), getterBodyEnd)
                    ), true);
                }
                return getterCache[expr];
            }
            catch (thrownError){
                error(thrownError);
                return emptyFn;
            }
        },

        setterCache     = {},
        setterCacheCnt  = 0,

        createSetter    = function createSetter(expr) {
            try {
                if (!setterCache[expr]) {
                    setterCacheCnt++;
                    var code = expr.replace(REG_REPLACE_EXPR, '$1____.$3');
                    return setterCache[expr] = wrapFunc(new f(
                        '____',
                        '$$$$',
                        '$$interceptor',
                        '$$itself',
                        "".concat(fnBodyStart, code, ' = $$$$', setterBodyEnd)
                    ));
                }
                return setterCache[expr];
            }
            catch (thrownError) {
                error(thrownError);
                return emptyFn;
            }
        },

        funcCache       = {},
        funcCacheCnt    = 0,

        createFunc      = function createFunc(expr) {
            try {
                if (!funcCache[expr]) {
                    funcCacheCnt++;
                    return funcCache[expr] = wrapFunc(new f(
                        '____',
                        '$$interceptor',
                        '$$itself',
                        "".concat(fnBodyStart, expr.replace(REG_REPLACE_EXPR, '$1____.$3'), getterBodyEnd)
                    ));
                }
                return funcCache[expr];
            }
            catch (thrownError) {
                error(thrownError);
                return emptyFn;
            }
        },

        resetCache = function() {
            getterCacheCnt >= 1000 && (getterCache = {});
            setterCacheCnt >= 1000 && (setterCache = {});
            funcCacheCnt >= 1000 && (funcCache = {});
        };

    return {
        createGetter: createGetter,
        createSetter: createSetter,
        createFunc: createFunc,
        resetCache: resetCache,
        enableResetCacheInterval: function() {
            setTimeout(resetCache, 10000);
        }
    };
}();



var createGetter = functionFactory.createGetter;




var createSetter = functionFactory.createSetter;



var Watchable = function(){

    var nativeObserver  = Object.observe && isNative(Object.observe),

        isStatic    = function(val) {

            if (!isString(val)) {
                return true;
            }

            var first   = val.substr(0, 1),
                last    = val.length - 1;

            if (first == '"' || first == "'") {
                if (val.indexOf(first, 1) == last) {
                    return val.substring(1, last);
                }
            }

            return false;
        },

        prescription2moves = function(a1, a2, prs, getKey) {

            var newPrs = [],
                i, l, k, action,
                map1 = {},
                prsi,
                a2i,
                index;

            for (i = 0, l = a1.length; i < l; i++) {
                k = getKey(a1[i]);
                if (k) {
                    map1[k] = i;
                }
            }

            a2i = 0;
            var used = {};

            for (prsi = 0, l = prs.length; prsi < l; prsi++) {

                action = prs[prsi];

                if (action == 'D') {
                    continue;
                }

                k = getKey(a2[a2i]);

                if (k != undf && used[k] !== true && (index = map1[k]) !== undf) {
                    newPrs.push(index);
                    used[k] = true;
                }
                else {
                    newPrs.push(action);
                }
                a2i++;
            }

            return newPrs;
        },


        observable;

    /**
     * @class Watchable
     */

    /**
     * @param {object} dataObj object containing observed property
     * @param {string} code property name or custom code
     * @param {function} fn optional listener
     * @param {object} fnScope optional listener's "this" object
     * @param {*} userData optional data to pass to the listener
     * @param {Namespace} namespace optional namespace to get filters and pipes from
     * @constructor
     */
    var Watchable   = function(dataObj, code, fn, fnScope, userData, namespace) {

        if (!observable) {
            observable  = new Observable;
        }

        var self    = this,
            id      = nextUid(),
            type,
            useObserver = false;

        if (namespace) {
            self.namespace = namespace;
            self.nsGet = namespace.get;
        }

        self.origCode = code;

        if (!isString(code)) {
            fnScope = fn;
            fn      = code;
            code    = null;
            type    = "object";
        }
        if (isString(dataObj)) {
            fnScope = fn;
            fn      = code;
            code    = dataObj;
            dataObj = null;
        }

        if (code && dataObj) {
            type    = dataObj.hasOwnProperty(code) ? "attr" : "expr";
        }
        if (code && !dataObj) {
            type    = "expr";
        }


        if (fn) {
            observable.on(id, fn, fnScope || this, {
                append: [userData],
                allowDupes: true
            });
        }

        if (type == "expr") {
            code        = self._processInputPipes(code, dataObj);
            code        = self._processPipes(code, dataObj);

            if (self.inputPipes || self.pipes) {
                code    = normalizeExpr(dataObj, code);
                type    = dataObj.hasOwnProperty(code) ? "attr" : "expr";
            }

            if (self.staticValue = isStatic(code)) {
                type    = "static";
            }
        }

        self.userData   = userData;
        self.code       = code;
        self.id         = id;
        self.type       = type;
        self.obj        = dataObj;

        if (type == "expr") {
            self.getterFn   = createGetter(code);
        }

        // Object.observe() doesn't work with expressions and may confuse more than help.
        // so the only thing it does on change, it sets changed flag
        // so that on the next digest cycle there wouldn't be any need
        // to compare values.

        // upd: still, the change event happens _after_ digest cycle
        // so lets think some more. :(

        /*if (type == "attr" && nativeObserver && !self.pipes && !self.inputPipes) {
            self.curr   = self._getValue();
            useObserver = isPrimitive(self.curr);
        }
        useObserver = false;*/

        if (type != "static" || self.pipes) {
            self.curr = self.curr || self._getValue();
            self.currCopy = isPrimitive(self.curr) ? self.curr : copy(self.curr);
        }
        else {
            self.check = returnFalse;
            self.curr = self.prev = self.staticValue;
        }

        /*if (useObserver) {
            self.obsrvDelegate = bind(self.onObserverChange, self);
            Object.observe(self.obj, self.obsrvDelegate);
        }*/
    };

    extend(Watchable.prototype, {

        namespace: null,
        nsGet: null,
        staticValue: null,
        origCode: null,
        code: null,
        getterFn: null,
        setterFn: null,
        id: null,
        type: null,
        obj: null,
        itv: null,
        curr: null,
        currCopy: null,
        prev: null,
        unfiltered: null,
        pipes: null,
        inputPipes: null,
        lastSetValue: null,
        userData: null,
        obsrvDelegate: null,
        obsrvChanged: false,


        _indexArrayItems: function(a) {

            var key = '$$' + this.id,
                i, l, item;

            if (a) {
                for (i = 0, l = a.length; i < l; i++) {
                    item = a[i];
                    if (item && !isPrimitive(item) && !item[key]) {
                        item[key] = nextUid();
                    }
                }
            }
        },


        _processInputPipes: function(text, dataObj) {

            if (text.indexOf('>>') == -1) {
                return text;
            }

            var self        = this,
                index       = 0,
                textLength  = text.length,
                pipes       = [],
                pIndex,
                prev, next, pipe,
                ret         = text;

            while(index < textLength && (pIndex  = text.indexOf('>>', index)) != -1) {

                    prev = text.charAt(pIndex -1);
                    next = text.charAt(pIndex + 2);

                    if (prev != '\\' && prev != "'" && prev != '"' && next != "'" && next != '"') {
                        pipe = trim(text.substring(index, pIndex)).split(":");
                        ret = text.substr(pIndex + 2);
                        self._addPipe(pipes, pipe, dataObj, self.onInputParamChange);
                    }

                    index = pIndex + 2;
            }

            if (pipes.length) {
                self.inputPipes = pipes;
            }

            return trim(ret);
        },


        _addPipe: function(pipes, pipe, dataObj, onParamChange) {

            var self    = this,
                name    = pipe.shift(),
                fn      = null,
                ws      = [],
                i, l;

            if (self.nsGet) {
                fn      = self.nsGet("filter." + name, true);
            }
            if (!fn) {
                fn      = window[name] || dataObj[name];
            }

            if (isFunction(fn)) {

                for (i = -1, l = pipe.length; ++i < l;
                     ws.push(create(dataObj, pipe[i], onParamChange, self, null, self.namespace))) {}

                pipes.push([fn, pipe, ws]);
            }
        },

        _processPipes: function(text, dataObj) {

            if (text.indexOf('|') == -1) {
                return text;
            }

            var self        = this,
                index       = 0,
                textLength  = text.length,
                pipes       = [],
                pIndex,
                prev, next, pipe,
                found       = false,
                ret         = text;

            while(index < textLength) {

                if ((pIndex  = text.indexOf('|', index)) != -1) {

                    prev = text.charAt(pIndex -1);
                    next = text.charAt(pIndex + 1);

                    if (prev != '|' && prev != "'" && prev != '"' && next != '|' && next != "'" && next != '"') {
                        if (!found) {
                            found = true;
                            ret = trim(text.substring(0, pIndex));
                        }
                        else {
                            pipe = trim(text.substring(index, pIndex)).split(":");
                            self._addPipe(pipes, pipe, dataObj);
                        }
                    }
                    index = pIndex + 1;
                }
                else {
                    if (found) {
                        pipe = trim(text.substr(index)).split(":");
                        self._addPipe(pipes, pipe, dataObj, self.onPipeParamChange);
                    }
                    break;
                }
            }

            if (pipes.length) {
                self.pipes = pipes;
            }

            return ret;
        },


        _getValue: function() {

            var self    = this,
                val;

            switch (self.type) {
                case "static":
                    val = self.staticValue;
                    break;

                case "attr":
                    val = self.obj[self.code];
                    break;
                case "expr":
                    val = self.getterFn(self.obj);
                    break;
                case "object":
                    val = self.obj;
                    break;
            }


            if (isArray(val)) {
                if (!self.inputPipes) {
                    self._indexArrayItems(val);
                }
                val = val.slice();
            }

            self.unfiltered = val;

            val = self._runThroughPipes(val, self.pipes);

            return val;
        },


        _runThroughPipes: function(val, pipes) {

            if (pipes) {
                var j,
                    args,
                    exprs,
                    self    = this,
                    jlen    = pipes.length,
                    dataObj = self.obj,
                    z, zl;

                for (j = 0; j < jlen; j++) {
                    exprs   = pipes[j][1];
                    args    = [];
                    for (z = -1, zl = exprs.length; ++z < zl;
                         args.push(evaluate(exprs[z], dataObj))){}

                    args.unshift(dataObj);
                    args.unshift(val);

                    val     = pipes[j][0].apply(null, args);
                }
            }

            return val;
        },

        /**
         * Subscribe to the change event
         * @method
         * @param {function} fn listener
         * @param {object} fnScope listener's "this" object
         * @param {object} options see Observable's options in on()
         */
        subscribe: function(fn, fnScope, options) {
            observable.on(this.id, fn, fnScope, options);
        },

        /**
         * Unsubscribe from change event
         * @param {function} fn
         * @param {object} fnScope
         * @returns {*}
         */
        unsubscribe: function(fn, fnScope) {
            return observable.un(this.id, fn, fnScope);
        },

        /**
         * @returns {boolean}
         */
        hasPipes: function() {
            return this.pipes !== null;
        },

        /**
         * @returns {boolean}
         */
        hasInputPipes: function() {
            return this.inputPipes != null;
        },

        /**
         * Get current value (filtered and via executing the code)
         * @returns {*}
         */
        getValue: function() {
            return this._getValue();
        },

        /**
         * Get last calculated value before filters were applied
         * @returns {*}
         */
        getUnfilteredValue: function() {
            return this.unfiltered || this.curr;
        },

        /**
         * Get previous value
         * @returns {*}
         */
        getPrevValue: function() {
            return this.prev;
        },

        /**
         * Get simple array change prescription
         * @param {[]} from optional
         * @param {[]} to optional
         * @returns {[]}
         */
        getPrescription: function(from, to) {
            to = to || this._getValue();
            return levenshteinArray(from || [], to || []).prescription;
        },

        /**
         * Get array change prescription with moves
         * @param {[]} from
         * @param {function} trackByFn
         * @param {[]} to
         * @returns {[]}
         */
        getMovePrescription: function(from, trackByFn, to) {

            var self    = this;
                to      = to || self._getValue();

            return prescription2moves(
                from || [],
                to || [],
                self.getPrescription(from || [], to || []),
                trackByFn
            );
        },

        /**
         * Set value to observed property
         * @param {*} val
         */
        setValue: function(val) {

            var self    = this,
                type    = self.type;

            self.lastSetValue = val;

            val = self._runThroughPipes(val, self.inputPipes);

            if (type == "attr") {
                self.obj[self.code] = val;
            }
            else if (type == "expr") {

                if (!self.setterFn) {
                    self.setterFn   = createSetter(self.code);
                }

                self.setterFn(self.obj, val);
            }
            else if (type == "object") {
                self.obj = val;
            }
        },

        onInputParamChange: function(val, prev, async) {
            this.setValue(this.lastSetValue);
            if (async) {
                this.checkAll();
            }
        },

        onPipeParamChange: function(val, prev, async) {
            this.check();
        },

        onObserverChange: function(changes) {

            var self = this,
                code = self.code,
                i, l,
                change;

            for (i = 0, l = changes.length; i < l; i++) {
                change = changes[i];
                if (change.name == code) {
                    self.obsrvChanged = true;
                    break;
                }
            }
        },

        _check: function(async) {

            var self    = this,
                val     = self._getValue(),
                curr    = self.currCopy,
                eq;

            if (self.obsrvDelegate) {
                eq      = !self.obsrvChanged;
            }
            else {
                eq      = equals(curr, val);
            }

            if (!eq) {
                self.curr = val;
                self.prev = curr;
                self.currCopy = isPrimitive(val) ? val : copy(val);
                self.obsrvChanged = false;
                observable.trigger(self.id, val, curr, async);
                return true;
            }

            return false;
        },

        /**
         * Check for changes
         * @param {bool} async
         * @returns {bool}
         */
        check: function(async) {
            return this._check(async);
        },

        /**
         * Check all observed properties for changes
         * @returns {bool}
         */
        checkAll: function() {
            return this.obj.$$watchers.$checkAll();
        },

        /**
         * Get last calculated value (with filters and pipes)
         * @returns {*}
         */
        getLastResult: function() {
            return this.curr;
        },

        /**
         * Set time interval to check for changes periodically
         * @param {number} ms
         */
        setInterval: function(ms) {

            var self    = this;
            if (self.itv) {
                self.clearInterval();
            }
            self.itv = setInterval(function(){self.check();}, ms);
        },

        /**
         * Clear check interval
         * @method
         */
        clearInterval: function() {
            var self    = this;
            if (self.itv) {
                clearInterval(self.itv);
                self.itv = null;
            }
        },

        /**
         * Unsubscribe and destroy if there are no other listeners
         * @param {function} fn
         * @param {object} fnScope
         * @returns {boolean} true if destroyed
         */
        unsubscribeAndDestroy: function(fn, fnScope) {

            var self    = this,
                id      = self.id;

            if (fn) {
                observable.un(id, fn, fnScope);
            }

            if (!observable.hasListener(id)) {
                self.destroy();
                return true;
            }

            return false;
        },

        /**
         * @method
         */
        destroy: function() {

            var self    = this,
                pipes   = self.pipes,
                ipipes  = self.inputPipes,
                i, il,
                j, jl,
                ws;

            if (self.itv) {
                self.clearInterval();
            }

            if (pipes) {
                for (i = -1, il = pipes.length; ++i < il;) {
                    ws = pipes[i][2];
                    for (j = -1, jl = ws.length; ++j < jl;) {
                        ws[j].unsubscribeAndDestroy(self.check, self);
                    }
                }
            }
            if (ipipes) {
                for (i = -1, il = ipipes.length; ++i < il;) {
                    ws = ipipes[i][2];
                    for (j = -1, jl = ws.length; ++j < jl;) {
                        ws[j].unsubscribeAndDestroy(self.onInputParamChange, self);
                    }
                }
            }

            if (self.obsrvDelegate) {
                Object.unobserve(self.obj, self.obsrvDelegate);
            }

            if (self.obj) {
                //delete self.obj.$$watchers.$codes[self.origCode];
                self.obj.$$watchers.$codes[self.origCode] = null;
            }

            observable.destroyEvent(self.id);

            for (i in self) {
                if (self.hasOwnProperty(i)){
                    self[i] = null;
                }
            }
        }
    }, true, false);


    /**
     * @method
     * @static
     * @param {object} obj
     * @param {string} code
     * @param {function} fn
     * @param {object} fnScope
     * @param {*} userData
     * @param {Namespace} namespace
     * @returns {Watchable}
     */
    var create = function(obj, code, fn, fnScope, userData, namespace) {

            code = normalizeExpr(obj, trim(code));

            if (obj) {
                if (!obj.$$watchers) {
                    obj.$$watchers = {
                        $codes: {},
                        $checkAll: function() {

                            var ws      = this.$codes,
                                i,
                                changes = 0;

                            for (i in ws) {

                                if (ws[i] && ws[i].check()) {
                                    changes++;
                                }
                            }

                            return changes;
                        },
                        $destroyAll: function() {

                            var ws      = this.$codes,
                                i;

                            for (i in ws) {
                                if (ws[i]) {
                                    ws[i].destroy();
                                    //delete ws[i];
                                    ws[i] = null;
                                }
                            }
                        }
                    };
                }

                if (obj.$$watchers.$codes[code]) {
                    obj.$$watchers.$codes[code].subscribe(fn, fnScope, {append: [userData], allowDupes: true});
                }
                else {
                    obj.$$watchers.$codes[code] = new Watchable(obj, code, fn, fnScope, userData, namespace);
                }

                return obj.$$watchers.$codes[code];
            }
            else {
                return new Watchable(obj, code, fn, fnScope, userData, namespace);
            }
        },

        /**
         * @method
         * @static
         * @param {object} obj
         * @param {string} code
         * @param {function} fn
         * @param {object} fnScope
         */
        unsubscribeAndDestroy = function(obj, code, fn, fnScope) {
            code = trim(code);

            var ws = obj.$$watchers ? obj.$$watchers.$codes : null;

            if (ws && ws[code] && ws[code].unsubscribeAndDestroy(fn, fnScope)) {
                //delete ws[code];
                ws[code] = null;
            }
        },

        /**
         * Normalize expression
         * @param {object} dataObj
         * @param {string} expr
         * @returns {string}
         */
        normalizeExpr = function(dataObj, expr) {
            if (dataObj && expr) {
                if (dataObj.hasOwnProperty(expr)) {
                    return expr;
                }
                var prop;
                if (expr.charAt(0) == '.') {
                    prop = expr.substr(1);
                    if (dataObj.hasOwnProperty(prop)) {
                        return prop;
                    }
                }
            }
            return expr;
        },

        /**
         * Evaluate code against object
         * @param {string} expr
         * @param {object} scope
         * @returns {*}
         */
        evaluate    = function(expr, scope) {
            var val;
            if (val = isStatic(expr)) {
                return val;
            }
            return createGetter(expr)(scope);
        };



    Watchable.create = create;
    Watchable.unsubscribeAndDestroy = unsubscribeAndDestroy;
    Watchable.normalizeExpr = normalizeExpr;
    Watchable.eval = evaluate;
    Watchable.usesNativeObserver = function() {
        return nativeObserver;
    };

    return Watchable;
}();






var Scope = function(cfg) {
    var self    = this;

    self.$$observable    = new Observable;
    self.$$historyWatchers  = {};
    extend(self, cfg, true, false);

    if (self.$parent) {
        self.$parent.$on("check", self.$$onParentCheck, self);
        self.$parent.$on("destroy", self.$$onParentDestroy, self);
    }
    else {
        self.$root  = self;
        self.$isRoot= true;
    }
};

extend(Scope.prototype, {

    $app: null,
    $parent: null,
    $root: null,
    $isRoot: false,
    $$observable: null,
    $$watchers: null,
    $$historyWatchers: null,
    $$checking: false,
    $$destroyed: false,

    $new: function() {
        var self = this;
        return new Scope({
            $parent: self,
            $root: self.$root,
            $app: self.$app
        });
    },

    $newIsolated: function() {
        return new Scope({
            $app: this.$app
        });
    },

    $on: function(event, fn, fnScope) {
        return this.$$observable.on(event, fn, fnScope);
    },

    $un: function(event, fn, fnScope) {
        return this.$$observable.un(event, fn, fnScope);
    },

    $watch: function(expr, fn, fnScope) {
        return Watchable.create(this, expr, fn, fnScope, null);
    },

    $unwatch: function(expr, fn, fnScope) {
        return Watchable.unsubscribeAndDestroy(this, expr, fn, fnScope);
    },

    $watchHistory: function(prop, param) {
        var self = this;
        if (!self.$$historyWatchers[param]) {
            self.$$historyWatchers[param] = prop;
            MetaphorJs.history.on("change-" + param, self.$$onHistoryChange, self);
        }
    },

    $unwatchHistory: function(param) {
        var self = this;
        if (!self.$$historyWatchers[param]) {
            delete self.$$historyWatchers[param];
            MetaphorJs.history.un("change-" + param, self.$$onHistoryChange, self);
        }
    },

    $get: function(key) {

        var s       = this;

        while (s) {
            if (s[key] !== undf) {
                return s[key];
            }
            s       = s.$parent;
        }

        return undf;
    },

    $$onParentDestroy: function() {
        this.$destroy();
    },

    $$onParentCheck: function() {
        this.$check();
    },

    $$onHistoryChange: function(val, prev, name) {
        var self = this,
            prop;
        if (self.$$historyWatchers[name]) {
            prop = self.$$historyWatchers[name];
            self[prop] = val;
            self.$check();
        }
    },

    $check: function() {
        var self = this,
            changes;

        if (self.$$checking) {
            return;
        }
        self.$$checking = true;

        if (self.$$watchers) {
            changes = self.$$watchers.$checkAll();
        }

        self.$$checking = false;

        if (!self.$$destroyed) {
            self.$$observable.trigger("check", changes);
        }

        if (changes > 0) {
            self.$check();
        }
    },

    $destroy: function() {

        var self    = this,
            param, i;

        self.$$observable.trigger("destroy");
        self.$$observable.destroy();

        if (self.$$watchers) {
            self.$$watchers.$destroyAll();
        }

        for (param in self.$$historyWatchers) {
            self.$unwatchHistory(param);
        }

        for (i in self) {
            if (self.hasOwnProperty(i)) {
                self[i] = null;
            }
        }

        self.$$destroyed = true;
    }

}, true, false);






/**
 * @param {*} list
 * @returns {[]}
 */
function toArray(list) {
    if (list && !list.length != undf && list !== ""+list) {
        for(var a = [], i =- 1, l = list.length>>>0; ++i !== l; a[i] = list[i]){}
        return a;
    }
    else if (list) {
        return [list];
    }
    else {
        return [];
    }
};



/**
 * Returns 'then' function or false
 * @param {*} any
 * @returns {Function|boolean}
 */
function isThenable(any) {

    // any.then must only be accessed once
    // this is a promise/a+ requirement

    if (!any) { //  || !any.then
        return false;
    }
    var then, t;

    //if (!any || (!isObject(any) && !isFunction(any))) {
    if (((t = typeof any) != "object" && t != "function")) {
        return false;
    }
    return isFunction((then = any.then)) ?
           then : false;
};



var nsGet = ns.get;




var createWatchable = Watchable.create;



var nsAdd = ns.add;





var Directive = function(){

    var attributes          = [],
        tags                = [],
        attributesSorted    = false,

        compare             = function(a, b) {
            //if (a is less than b by some ordering criterion)
            if (a.priority < b.priority) {
                return -1;
            }

            //if (a is greater than b by the ordering criterion)
            if (a.priority > b.priority) {
                return 1;
            }

            // a must be equal to b
            return 0;
        };

    return defineClass({

        $class: "Directive",

        watcher: null,
        scope: null,
        node: null,
        expr: null,

        autoOnChange: true,

        $init: function(scope, node, expr) {

            var self        = this,
                val;

            expr            = trim(expr);

            self.node       = node;
            self.expr       = expr;
            self.scope      = scope;
            self.watcher    = createWatchable(scope, expr, self.onChange, self, null, ns);

            if (self.autoOnChange && (val = self.watcher.getLastResult()) != undf) {
                self.onChange(val, undf);
            }

            scope.$on("destroy", self.onScopeDestroy, self);
        },

        onScopeDestroy: function() {
            this.$destroy();
        },

        onChange: function() {},

        destroy: function() {
            var self    = this;

            if (self.watcher) {
                self.watcher.unsubscribeAndDestroy(self.onChange, self);
            }

            self.$super();
        }
    }, {


        registerAttribute: function registerAttribute(name, priority, handler) {
            if (!nsGet("attr." + name, true)) {
                attributes.push({
                    priority: priority,
                    name: name,
                    handler: nsAdd("attr." + name, handler)
                });
                attributesSorted = false;
            }
        },

        getAttributes: function getAttributes() {
            if (!attributesSorted) {
                attributes.sort(compare);
                attributesSorted = true;
            }
            return attributes;
        },

        registerTag: function registerTag(name, handler) {
            if (!nsGet("tag." + name, true)) {
                nsAdd("tag." + name, handler)
            }
        }

    });

}();




function isNull(value) {
    return value === null;
};





var TextRenderer = function(){

    var startSymbol             = '{{',
        endSymbol               = '}}',
        startSymbolLength       = 2,
        endSymbolLength         = 2,

        langStartSymbol         = '{[',
        langEndSymbol           = ']}',
        langStartLength         = 2,
        langEndLength           = 2,

        rReplaceEscape          = /\\{/g,

        observer                = new Observable,

        factory                 = function(scope, origin, parent, userData, recursive) {

            if (!origin || !origin.indexOf ||
                (origin.indexOf(startSymbol) == -1 &&
                 origin.indexOf(langStartSymbol) == -1)) {
                return null;
            }

            return new TextRenderer(scope, origin, parent, userData, recursive);
        };

    var TextRenderer = defineClass({

        $class: "TextRenderer",

        id: null,
        parent: null,
        isRoot: null,
        scope: null,
        origin: "",
        processed: null,
        text: null,
        watchers: null,
        children: null,
        data: null,
        recursive: false,
        dataChangeDelegate: null,
        changeTmt: null,
        lang: null,

        $init: function(scope, origin, parent, userData, recursive) {

            var self        = this;

            self.id         = nextUid();
            self.origin     = origin;
            self.scope      = scope;
            self.parent     = parent;
            self.isRoot     = !parent;
            self.data       = userData;
            self.lang       = scope.$app ? scope.$app.lang : null;

            if (recursive === true || recursive === false) {
                self.recursive = recursive;
            }

            self.watchers   = [];
            self.children   = [];

            self.dataChangeDelegate = bind(self.doDataChange, self);
            self.processed  = self.processText(origin);
            self.render();
        },

        subscribe: function(fn, context) {
            return observer.on(this.id, fn, context);
        },

        unsubscribe: function(fn, context) {
            return observer.un(this.id, fn, context);
        },

        getString: function() {
            var self = this;

            if (isNull(self.text)) {
                self.render();
            }

            var text = self.text;

            if (text.indexOf('\\{') != -1) {
                return text.replace(rReplaceEscape, '{');
            }

            return text;
        },


        render: function() {

            var self    = this,
                text    = self.processed,
                i, l,
                ch;

            if (!self.children.length) {
                self.createChildren();
            }

            ch = self.children;

            for (i = -1, l = ch.length; ++i < l;
                 text = text.replace(
                     '---' + i + '---',
                     ch[i] instanceof TextRenderer ? ch[i].getString() : ch[i]
                 )) {}

            self.text = text;

            return text;
        },



        processText: function(text) {

            /*
             arguably, str += "" is faster than separators.push() + separators.join()
             well, at least in my Firefox it is so.
             */

            var self        = this,
                index       = 0,
                textLength  = text.length,
                startIndex,
                endIndex,
                result      = "";
            //separators  = [];

            // regular keys
            while(index < textLength) {
                if (((startIndex = text.indexOf(startSymbol, index)) != -1) &&
                    ((endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) != -1) &&
                    text.substr(startIndex - 1, 1) != '\\') {

                    result += text.substring(index, startIndex);

                    if (endIndex != startIndex + startSymbolLength) {
                        result += self.watcherMatch(
                            text.substring(startIndex + startSymbolLength, endIndex)
                        );
                    }

                    index = endIndex + endSymbolLength;

                } else {
                    // we did not find an interpolation
                    if (index !== textLength) {
                        result += text.substring(index);
                    }
                    break;
                }
            }

            index       = 0;
            text        = result;
            textLength  = text.length;
            result      = "";
            //separators  = [];

            // lang keys
            while(index < textLength) {

                if (((startIndex = text.indexOf(langStartSymbol, index)) != -1) &&
                    ((endIndex = text.indexOf(langEndSymbol, startIndex + langStartLength)) != -1) &&
                    text.substr(startIndex - 1, 1) != '\\') {

                    result += text.substring(index, startIndex);

                    if (endIndex != startIndex + langStartLength) {
                        result += self.watcherMatch(
                            text.substring(startIndex + langStartLength, endIndex),
                            true
                        );
                    }

                    index = endIndex + langEndLength;

                } else {
                    // we did not find an interpolation
                    if (index !== textLength) {
                        result += text.substring(index);
                    }
                    break;
                }
            }

            return result;
        },

        watcherMatch: function(expr, isLang) {

            var self    = this,
                ws      = self.watchers;

            if (isLang) {
                expr        = trim(expr);
                var tmp     = expr.split("|"),
                    key     = trim(tmp[0]);
                if (key.substr(0, 1) != ".") {
                    tmp[0]  = "'" + key + "'";
                }
                if (tmp.length == 1) {
                    tmp.push("l");
                }
                expr        = tmp.join(" | ");
            }

            ws.push(createWatchable(
                self.scope,
                expr,
                self.onDataChange,
                self,
                null,
                ns
            ));

            return '---'+ (ws.length-1) +'---';
        },

        onDataChange: function() {

            var self    = this;

            if (!self.changeTmt) {
                self.changeTmt = setTimeout(self.dataChangeDelegate, 0);
            }
        },

        doDataChange: function() {
            var self = this;
            self.destroyChildren();
            self.triggerChange();
            self.changeTmt = null;
        },

        triggerChange: function() {

            var self    = this;
            self.text   = null;

            if (self.isRoot) {
                observer.trigger(self.id, self, self.data);
            }
            else {
                self.parent.triggerChange();
            }
        },


        createChildren: function() {

            var self    = this,
                ws      = self.watchers,
                ch      = self.children,
                scope   = self.scope,
                rec     = self.recursive,
                i, l,
                val;

            for (i = -1, l = ws.length; ++i < l; ){
                val     = ws[i].getLastResult();
                if (val === undf) {
                    val = "";
                }
                ch.push((rec && factory(scope, val, self, null, true)) || val);
            }
        },

        destroyChildren: function() {

            var self    = this,
                ch      = self.children,
                i, l;

            for (i = -1, l = ch.length; ++i < l; ){
                if (ch[i] instanceof TextRenderer) {
                    ch[i].$destroy();
                }
            }

            self.children = [];
        },

        destroyWatchers: function() {

            var self    = this,
                ws      = self.watchers,
                i, l;

            for (i = -1, l = ws.length; ++i < l;
                 ws[i].unsubscribeAndDestroy(self.onDataChange, self)){}

            self.watchers = [];
        },

        destroy: function() {

            var self = this;

            self.destroyChildren();
            self.destroyWatchers();

            observer.destroyEvent(self.id);

            if (self.changeTmt) {
                clearTimeout(self.changeTmt);
            }
        }

    }, {
        create: factory
    });

    return TextRenderer;
}();





function setAttr(el, name, value) {
    return el.setAttribute(name, value);
};

function removeAttr(el, name) {
    return el.removeAttribute(name);
};

function getAttrMap(node) {
    var map = {},
        i, l, a,
        attrs = node.attributes;

    for (i = 0, l = attrs.length; i < l; i++) {
        a = attrs[i];
        map[a.name] = a.value;
    }

    return map;
};




var Promise = function(){

    var PENDING     = 0,
        FULFILLED   = 1,
        REJECTED    = 2,

        queue       = [],
        qRunning    = false,


        nextTick    = typeof process != strUndef ?
                        process.nextTick :
                        function(fn) {
                            setTimeout(fn, 0);
                        },

        // synchronous queue of asynchronous functions:
        // callbacks must be called in "platform stack"
        // which means setTimeout/nextTick;
        // also, they must be called in a strict order.
        nextInQueue = function() {
            qRunning    = true;
            var next    = queue.shift();
            nextTick(function(){
                next[0].apply(next[1], next[2]);
                if (queue.length) {
                    nextInQueue();
                }
                else {
                    qRunning = false;
                }
            }, 0);
        },

        /**
         * add to execution queue
         * @param {Function} fn
         * @param {Object} scope
         * @param {[]} args
         * @ignore
         */
        next        = function(fn, scope, args) {
            args = args || [];
            queue.push([fn, scope, args]);
            if (!qRunning) {
                nextInQueue();
            }
        },

        /**
         * returns function which receives value from previous promise
         * and tries to resolve next promise with new value returned from given function(prev value)
         * or reject on error.
         * promise1.then(success, failure) -> promise2
         * wrapper(success, promise2) -> fn
         * fn(promise1 resolve value) -> new value
         * promise2.resolve(new value)
         *
         * @param {Function} fn
         * @param {Promise} promise
         * @returns {Function}
         * @ignore
         */
        wrapper     = function(fn, promise) {
            return function(value) {
                try {
                    promise.resolve(fn(value));
                }
                catch (thrownError) {
                    promise.reject(thrownError);
                }
            };
        };


    /**
     * @class Promise
     */


    /**
     * @method Promise
     * @param {Function} fn {
     *  @description Function that accepts two parameters: resolve and reject functions.
     *  @param {function} resolve {
     *      @param {*} value
     *  }
     *  @param {function} reject {
     *      @param {*} reason
     *  }
     * }
     * @param {Object} context
     * @returns {Promise}
     * @constructor
     */

    /**
     * @method Promise
     * @param {Thenable} thenable
     * @returns {Promise}
     * @constructor
     */

    /**
     * @method Promise
     * @param {*} value Value to resolve promise with
     * @returns {Promise}
     * @constructor
     */


    /**
     * @method Promise
     * @returns {Promise}
     * @constructor
     */
    var Promise = function(fn, context) {

        if (fn instanceof Promise) {
            return fn;
        }

        if (!(this instanceof Promise)) {
            return new Promise(fn, context);
        }

        var self = this,
            then;

        self._fulfills   = [];
        self._rejects    = [];
        self._dones      = [];
        self._fails      = [];

        if (arguments.length > 0) {

            if (then = isThenable(fn)) {
                if (fn instanceof Promise) {
                    fn.then(
                        bind(self.resolve, self),
                        bind(self.reject, self));
                }
                else {
                    (new Promise(then, fn)).then(
                        bind(self.resolve, self),
                        bind(self.reject, self));
                }
            }
            else if (isFunction(fn)) {
                try {
                    fn.call(context,
                            bind(self.resolve, self),
                            bind(self.reject, self));
                }
                catch (thrownError) {
                    self.reject(thrownError);
                }
            }
            else {
                self.resolve(fn);
            }
        }
    };

    extend(Promise.prototype, {

        _state: PENDING,

        _fulfills: null,
        _rejects: null,
        _dones: null,
        _fails: null,

        _wait: 0,

        _value: null,
        _reason: null,

        _triggered: false,

        isPending: function() {
            return this._state == PENDING;
        },

        isFulfilled: function() {
            return this._state == FULFILLED;
        },

        isRejected: function() {
            return this._state == REJECTED;
        },

        _cleanup: function() {
            var self    = this;

            self._fulfills = null;
            self._rejects = null;
            self._dones = null;
            self._fails = null;
        },

        _processValue: function(value, cb) {

            var self    = this,
                then;

            if (self._state != PENDING) {
                return;
            }

            if (value === self) {
                self._doReject(new TypeError("cannot resolve promise with itself"));
                return;
            }

            try {
                if (then = isThenable(value)) {
                    if (value instanceof Promise) {
                        value.then(
                            bind(self._processResolveValue, self),
                            bind(self._processRejectReason, self));
                    }
                    else {
                        (new Promise(then, value)).then(
                            bind(self._processResolveValue, self),
                            bind(self._processRejectReason, self));
                    }
                    return;
                }
            }
            catch (thrownError) {
                if (self._state == PENDING) {
                    self._doReject(thrownError);
                }
                return;
            }

            cb.call(self, value);
        },


        _callResolveHandlers: function() {

            var self    = this;

            self._done();

            var cbs  = self._fulfills,
                cb;

            while (cb = cbs.shift()) {
                next(cb[0], cb[1], [self._value]);
            }

            self._cleanup();
        },


        _doResolve: function(value) {
            var self    = this;

            self._value = value;
            self._state = FULFILLED;

            if (self._wait == 0) {
                self._callResolveHandlers();
            }
        },

        _processResolveValue: function(value) {
            this._processValue(value, this._doResolve);
        },

        /**
         * @param {*} value
         */
        resolve: function(value) {

            var self    = this;

            if (self._triggered) {
                return self;
            }

            self._triggered = true;
            self._processResolveValue(value);

            return self;
        },


        _callRejectHandlers: function() {

            var self    = this;

            self._fail();

            var cbs  = self._rejects,
                cb;

            while (cb = cbs.shift()) {
                next(cb[0], cb[1], [self._reason]);
            }

            self._cleanup();
        },

        _doReject: function(reason) {

            var self        = this;

            self._state     = REJECTED;
            self._reason    = reason;

            if (self._wait == 0) {
                self._callRejectHandlers();
            }
        },


        _processRejectReason: function(reason) {
            this._processValue(reason, this._doReject);
        },

        /**
         * @param {*} reason
         */
        reject: function(reason) {

            var self    = this;

            if (self._triggered) {
                return self;
            }

            self._triggered = true;

            self._processRejectReason(reason);

            return self;
        },

        /**
         * @param {Function} resolve -- called when this promise is resolved; returns new resolve value
         * @param {Function} reject -- called when this promise is rejects; returns new reject reason
         * @returns {Promise} new promise
         */
        then: function(resolve, reject) {

            var self            = this,
                promise         = new Promise,
                state           = self._state;

            if (state == PENDING || self._wait != 0) {

                if (resolve && isFunction(resolve)) {
                    self._fulfills.push([wrapper(resolve, promise), null]);
                }
                else {
                    self._fulfills.push([promise.resolve, promise])
                }

                if (reject && isFunction(reject)) {
                    self._rejects.push([wrapper(reject, promise), null]);
                }
                else {
                    self._rejects.push([promise.reject, promise]);
                }
            }
            else if (state == FULFILLED) {

                if (resolve && isFunction(resolve)) {
                    next(wrapper(resolve, promise), null, [self._value]);
                }
                else {
                    promise.resolve(self._value);
                }
            }
            else if (state == REJECTED) {
                if (reject && isFunction(reject)) {
                    next(wrapper(reject, promise), null, [self._reason]);
                }
                else {
                    promise.reject(self._reason);
                }
            }

            return promise;
        },

        /**
         * @param {Function} reject -- same as then(null, reject)
         * @returns {Promise} new promise
         */
        "catch": function(reject) {
            return this.then(null, reject);
        },

        _done: function() {

            var self    = this,
                cbs     = self._dones,
                cb;

            while (cb = cbs.shift()) {
                try {
                    cb[0].call(cb[1] || null, self._value);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
        },

        /**
         * @param {Function} fn -- function to call when promise is resolved
         * @param {Object} context -- function's "this" object
         * @returns {Promise} same promise
         */
        done: function(fn, context) {
            var self    = this,
                state   = self._state;

            if (state == FULFILLED && self._wait == 0) {
                try {
                    fn.call(context || null, self._value);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
            else if (state == PENDING) {
                self._dones.push([fn, context]);
            }

            return self;
        },

        _fail: function() {

            var self    = this,
                cbs     = self._fails,
                cb;

            while (cb = cbs.shift()) {
                try {
                    cb[0].call(cb[1] || null, self._reason);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
        },

        /**
         * @param {Function} fn -- function to call when promise is rejected.
         * @param {Object} context -- function's "this" object
         * @returns {Promise} same promise
         */
        fail: function(fn, context) {

            var self    = this,
                state   = self._state;

            if (state == REJECTED && self._wait == 0) {
                try {
                    fn.call(context || null, self._reason);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
            else if (state == PENDING) {
                self._fails.push([fn, context]);
            }

            return self;
        },

        /**
         * @param {Function} fn -- function to call when promise resolved or rejected
         * @param {Object} context -- function's "this" object
         * @return {Promise} same promise
         */
        always: function(fn, context) {
            this.done(fn, context);
            this.fail(fn, context);
            return this;
        },

        /**
         * @returns {object} then: function, done: function, fail: function, always: function
         */
        promise: function() {
            var self = this;
            return {
                then: bind(self.then, self),
                done: bind(self.done, self),
                fail: bind(self.fail, self),
                always: bind(self.always, self)
            };
        },

        after: function(value) {

            var self = this;

            if (isThenable(value)) {

                self._wait++;

                var done = function() {
                    self._wait--;
                    if (self._wait == 0 && self._state != PENDING) {
                        self._state == FULFILLED ?
                            self._callResolveHandlers() :
                            self._callRejectHandlers();
                    }
                };

                if (isFunction(value.done)) {
                    value.done(done);
                }
                else {
                    value.then(done);
                }
            }

            return self;
        }
    }, true, false);


    /**
     * @param {function} fn
     * @param {object} context
     * @param {[]} args
     * @returns {Promise}
     * @static
     */
    Promise.fcall = function(fn, context, args) {
        return Promise.resolve(fn.apply(context, args || []));
    };

    /**
     * @param {*} value
     * @returns {Promise}
     * @static
     */
    Promise.resolve = function(value) {
        var p = new Promise;
        p.resolve(value);
        return p;
    };


    /**
     * @param {*} reason
     * @returns {Promise}
     * @static
     */
    Promise.reject = function(reason) {
        var p = new Promise;
        p.reject(reason);
        return p;
    };


    /**
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
     * @static
     */
    Promise.all = function(promises) {

        if (!promises.length) {
            return Promise.resolve(null);
        }

        var p       = new Promise,
            len     = promises.length,
            values  = new Array(len),
            cnt     = len,
            i,
            item,
            done    = function(value, inx) {
                values[inx] = value;
                cnt--;

                if (cnt == 0) {
                    p.resolve(values);
                }
            };

        for (i = 0; i < len; i++) {

            (function(inx){
                item = promises[i];

                if (item instanceof Promise) {
                    item.done(function(value){
                        done(value, inx);
                    })
                        .fail(p.reject, p);
                }
                else if (isThenable(item) || isFunction(item)) {
                    (new Promise(item))
                        .done(function(value){
                            done(value, inx);
                        })
                        .fail(p.reject, p);
                }
                else {
                    done(item, inx);
                }
            })(i);
        }

        return p;
    };

    /**
     * @param {Promise|*} promise1
     * @param {Promise|*} promise2
     * @param {Promise|*} promiseN
     * @returns {Promise}
     * @static
     */
    Promise.when = function() {
        return Promise.all(arguments);
    };

    /**
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
     * @static
     */
    Promise.allResolved = function(promises) {

        if (!promises.length) {
            return Promise.resolve(null);
        }

        var p       = new Promise,
            len     = promises.length,
            values  = [],
            cnt     = len,
            i,
            item,
            settle  = function(value) {
                values.push(value);
                proceed();
            },
            proceed = function() {
                cnt--;
                if (cnt == 0) {
                    p.resolve(values);
                }
            };

        for (i = 0; i < len; i++) {
            item = promises[i];

            if (item instanceof Promise) {
                item.done(settle).fail(proceed);
            }
            else if (isThenable(item) || isFunction(item)) {
                (new Promise(item)).done(settle).fail(proceed);
            }
            else {
                settle(item);
            }
        }

        return p;
    };

    /**
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
     * @static
     */
    Promise.race = function(promises) {

        if (!promises.length) {
            return Promise.resolve(null);
        }

        var p   = new Promise,
            len = promises.length,
            i,
            item;

        for (i = 0; i < len; i++) {
            item = promises[i];

            if (item instanceof Promise) {
                item.done(p.resolve, p).fail(p.reject, p);
            }
            else if (isThenable(item) || isFunction(item)) {
                (new Promise(item)).done(p.resolve, p).fail(p.reject, p);
            }
            else {
                p.resolve(item);
            }

            if (!p.isPending()) {
                break;
            }
        }

        return p;
    };

    /**
     * @param {[]} functions -- array of promises or resolve values or functions
     * @returns {Promise}
     * @static
     */
    Promise.waterfall = function(functions) {

        if (!functions.length) {
            return Promise.resolve(null);
        }

        var first   = functions.shift(),
            promise = isFunction(first) ? Promise.fcall(first) : Promise.resolve(fn),
            fn;

        while (fn = functions.shift()) {
            if (isThenable(fn)) {
                promise = promise.then(function(fn){
                    return function(){
                        return fn;
                    };
                }(fn));
            }
            else if (isFunction(fn)) {
                promise = promise.then(fn);
            }
            else {
                promise.resolve(fn);
            }
        }

        return promise;
    };

    Promise.counter = function(cnt) {

        var promise     = new Promise;

        promise.countdown = function() {
            cnt--;
            if (cnt == 0) {
                promise.resolve();
            }
        };

        return promise;
    };

    return Promise;
}();



var aIndexOf    = Array.prototype.indexOf;

if (!aIndexOf) {
    aIndexOf = Array.prototype.indexOf = function (searchElement, fromIndex) {

        var k;

        // 1. Let O be the result of calling ToObject passing
        //    the this value as the argument.
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }

        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get
        //    internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If len is 0, return -1.
        if (len === 0) {
            return -1;
        }

        // 5. If argument fromIndex was passed let n be
        //    ToInteger(fromIndex); else let n be 0.
        var n = +fromIndex || 0;

        if (Math.abs(n) === Infinity) {
            n = 0;
        }

        // 6. If n >= len, return -1.
        if (n >= len) {
            return -1;
        }

        // 7. If n >= 0, then Let k be n.
        // 8. Else, n<0, Let k be len - abs(n).
        //    If k is less than 0, then let k be 0.
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        // 9. Repeat, while k < len
        while (k < len) {
            var kValue;
            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the
            //    HasProperty internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            //    i.  Let elementK be the result of calling the Get
            //        internal method of O with the argument ToString(k).
            //   ii.  Let same be the result of applying the
            //        Strict Equality Comparison Algorithm to
            //        searchElement and elementK.
            //  iii.  If same is true, return k.
            if (k in O && O[k] === searchElement) {
                return k;
            }
            k++;
        }
        return -1;
    };
}








var Renderer = function(){

    var handlers                = null,
        createText              = TextRenderer.create,

        nodeChildren = function(res, el, fn, fnScope, finish, cnt) {

            var children = [],
                i, len;

            if (res && res !== true) {
                if (res.nodeType) {
                    cnt.countdown += 1;
                    eachNode(res, fn, fnScope, finish, cnt);
                    return;
                }
                else {
                    children = slice.call(res);
                }
            }

            if (!children.length) {
                if (el.childNodes) {
                    children    = toArray(el.childNodes);
                }
                else if (el.length) {
                    children    = toArray(el);
                }
            }

            len = children.length;

            cnt.countdown += len;

            for(i = -1;
                ++i < len;
                eachNode(children[i], fn, fnScope, finish, cnt)){}
        },


        collectNodes    = function(coll, add) {

            if (add) {
                if (add.nodeType) {
                    coll.push(add);
                }
                else if (isArray(add)) {
                    for (var i = -1, l = add.length; ++i < l; collectNodes(coll, add[i])){}
                }
            }
        },

        //rSkipTag = /^(script|template|mjs-template|style)$/i,

        skipMap = {
            "script": true,
            "template": true,
            "mjs-template": true,
            "style": true
        },

        eachNode = function(el, fn, fnScope, finish, cnt) {

            if (!el) {
                return;
            }

            var res,
                tag = el.nodeName;

            if (!cnt) {
                cnt = {countdown: 1};
            }

            if (tag && skipMap[tag.toLowerCase()]) { //tag.match(rSkipTag)) {
                --cnt.countdown == 0 && finish && finish.call(fnScope);
                return;
            }

            res = fn.call(fnScope, el);

            if (res !== false) {

                if (isThenable(res)) {

                    res.done(function(response){

                        if (response !== false) {
                            nodeChildren(response, el, fn, fnScope, finish, cnt);
                        }

                        --cnt.countdown == 0 && finish && finish.call(fnScope);
                    });
                    return; // prevent countdown
                }
                else {
                    nodeChildren(res, el, fn, fnScope, finish, cnt);
                }
            }

            --cnt.countdown == 0 && finish && finish.call(fnScope);
        },

        observer = new Observable;

    return defineClass({

        $class: "Renderer",

        id: null,
        el: null,
        scope: null,
        texts: null,
        parent: null,

        $init: function(el, scope, parent) {
            var self            = this;

            self.id             = nextUid();
            self.el             = el;
            self.scope          = scope;
            self.texts          = [];
            self.parent         = parent;

            if (scope instanceof Scope) {
                scope.$on("destroy", self.$destroy, self);
            }

            if (parent) {
                parent.on("destroy", self.$destroy, self);
            }
        },

        on: function(event, fn, context) {
            return observer.on(event + '-' + this.id, fn, context);
        },

        once: function(event, fn, context) {
            return observer.once(event + '-' + this.id, fn, context);
        },

        un: function(event, fn, context) {
            return observer.un(event + '-' + this.id, fn, context);
        },

        createChild: function(node) {
            return new Renderer(node, this.scope, this);
        },

        getEl: function() {
            return this.el;
        },

        runHandler: function(f, parentScope, node, value) {

            var self    = this,
                scope   = f.$isolateScope ?
                          parentScope.$newIsolated() :
                          (f.$breakScope  ?
                           parentScope.$new() :
                           parentScope),
                app     = parentScope.$app,
                inject  = {
                    $scope: scope,
                    $node: node,
                    $attrValue: value,
                    $renderer: self
                },
                args    = [scope, node, value, self],
                inst    = app.inject(f, null, inject, args);

            if (app && f.$registerBy && inst) {
                if (isThenable(inst)) {
                    inst.done(function(cmp){
                        app.registerCmp(cmp, parentScope, f.$registerBy);
                    });
                }
                else {
                    app.registerCmp(inst, parentScope, f.$registerBy);
                }
            }

            return f.$stopRenderer ? false : inst;
        },

        processNode: function(node) {

            var self        = this,
                nodeType    = node.nodeType,
                texts       = self.texts,
                scope       = self.scope,
                textRenderer,
                recursive,
                n;

            // text node
            if (nodeType == 3) {

                recursive       = getAttr(node.parentNode, "mjs-recursive") !== null;
                textRenderer    = createText(scope, node.textContent || node.nodeValue, null, texts.length, recursive);

                if (textRenderer) {
                    textRenderer.subscribe(self.onTextChange, self);
                    texts.push({
                        node: node,
                        tr: textRenderer
                    });
                    self.renderText(texts.length - 1);
                }

            }

            // element node
            else if (nodeType == 1) {

                if (!handlers) {
                    handlers = Directive.getAttributes();
                }

                var tag     = node.tagName.toLowerCase(),
                    defers  = [],
                    nodes   = [],
                    i, f, len,
                    map,
                    attrValue,
                    name,
                    res;

                n = "tag." + tag;
                if (f = nsGet(n, true)) {

                    res = self.runHandler(f, scope, node);

                    if (res === false) {
                        return false;
                    }
                    if (isThenable(res)) {
                        defers.push(res);
                    }
                    else {
                        collectNodes(nodes, res);
                    }
                }

                map = getAttrMap(node);

                for (i = 0, len = handlers.length; i < len; i++) {
                    name    = handlers[i].name;

                    if ((attrValue = map[name]) !== undf) {

                        removeAttr(node, name);

                        res     = self.runHandler(handlers[i].handler, scope, node, attrValue);

                        map[name] = null;

                        if (res === false) {
                            return false;
                        }
                        if (isThenable(res)) {
                            defers.push(res);
                        }
                        else {
                            collectNodes(nodes, res);
                        }
                    }
                }

                if (defers.length) {
                    var deferred = new Promise;
                    Promise.all(defers).done(function(values){
                        collectNodes(nodes, values);
                        deferred.resolve(nodes);
                    });
                    return deferred;
                }

                recursive = map["mjs-recursive"] !== undf;
                delete map["mjs-recursive"];

                //var attrs   = toArray(node.attributes);

                for (i in map) {

                    if (map[i] !== null) {

                        textRenderer = createText(scope, map[i], null, texts.length, recursive);

                        if (textRenderer) {
                            removeAttr(node, i);
                            textRenderer.subscribe(self.onTextChange, self);
                            texts.push({
                                node: node,
                                attr: i,
                                tr:   textRenderer
                            });
                            self.renderText(texts.length - 1);
                        }
                    }
                }

                return nodes.length ? nodes : true;
            }

            return true;
        },

        process: function() {
            var self    = this;
            eachNode(self.el, self.processNode, self, self.onProcessingFinished, {countdown: 1});
        },

        onProcessingFinished: function() {
            observer.trigger("rendered-" + this.id, this);
        },


        onTextChange: function(textRenderer, inx) {
            this.renderText(inx);
        },

        renderText: function(inx) {

            var self        = this,
                text        = self.texts[inx],
                res         = text.tr.getString(),
                attrName    = text.attr;

            if (attrName) {

                if (attrName == "value") {
                    text.node.value = res;
                }
                else if (attrName == "class") {
                    text.node.className = res;
                }
                else if (attrName == "src") {
                    text.node.src = res;
                }

                setAttr(text.node, attrName, res);
            }
            else {
                text.node.textContent = res;
                text.node.nodeValue = res;
            }
        },


        destroy: function() {

            var self    = this,
                texts   = self.texts,
                i, len;

            for (i = -1, len = texts.length; ++i < len; texts[i].tr.$destroy()) {}

            if (self.parent) {
                self.parent.un("destroy", self.$destroy, self);
            }

            observer.trigger("destroy-" + self.id);
        }

    });

}();






var Text = function(){

    var pluralDef       = function($number, $locale) {

            if ($locale == "pt_BR") {
                // temporary set a locale for brasilian
                $locale = "xbr";
            }

            if ($locale.length > 3) {
                $locale = $locale.substr(0, -$locale.lastIndexOf('_'));
            }

            switch($locale) {
                case 'bo':
                case 'dz':
                case 'id':
                case 'ja':
                case 'jv':
                case 'ka':
                case 'km':
                case 'kn':
                case 'ko':
                case 'ms':
                case 'th':
                case 'tr':
                case 'vi':
                case 'zh':
                    return 0;
                    break;

                case 'af':
                case 'az':
                case 'bn':
                case 'bg':
                case 'ca':
                case 'da':
                case 'de':
                case 'el':
                case 'en':
                case 'eo':
                case 'es':
                case 'et':
                case 'eu':
                case 'fa':
                case 'fi':
                case 'fo':
                case 'fur':
                case 'fy':
                case 'gl':
                case 'gu':
                case 'ha':
                case 'he':
                case 'hu':
                case 'is':
                case 'it':
                case 'ku':
                case 'lb':
                case 'ml':
                case 'mn':
                case 'mr':
                case 'nah':
                case 'nb':
                case 'ne':
                case 'nl':
                case 'nn':
                case 'no':
                case 'om':
                case 'or':
                case 'pa':
                case 'pap':
                case 'ps':
                case 'pt':
                case 'so':
                case 'sq':
                case 'sv':
                case 'sw':
                case 'ta':
                case 'te':
                case 'tk':
                case 'ur':
                case 'zu':
                    return ($number == 1) ? 0 : 1;

                case 'am':
                case 'bh':
                case 'fil':
                case 'fr':
                case 'gun':
                case 'hi':
                case 'ln':
                case 'mg':
                case 'nso':
                case 'xbr':
                case 'ti':
                case 'wa':
                    return (($number == 0) || ($number == 1)) ? 0 : 1;

                case 'be':
                case 'bs':
                case 'hr':
                case 'ru':
                case 'sr':
                case 'uk':
                    return (($number % 10 == 1) && ($number % 100 != 11)) ?
                           0 :
                           ((($number % 10 >= 2) && ($number % 10 <= 4) &&
                             (($number % 100 < 10) || ($number % 100 >= 20))) ? 1 : 2);

                case 'cs':
                case 'sk':
                    return ($number == 1) ? 0 : ((($number >= 2) && ($number <= 4)) ? 1 : 2);

                case 'ga':
                    return ($number == 1) ? 0 : (($number == 2) ? 1 : 2);

                case 'lt':
                    return (($number % 10 == 1) && ($number % 100 != 11)) ?
                           0 :
                           ((($number % 10 >= 2) &&
                             (($number % 100 < 10) || ($number % 100 >= 20))) ? 1 : 2);

                case 'sl':
                    return ($number % 100 == 1) ?
                           0 :
                           (($number % 100 == 2) ?
                                1 :
                                ((($number % 100 == 3) || ($number % 100 == 4)) ? 2 : 3));

                case 'mk':
                    return ($number % 10 == 1) ? 0 : 1;

                case 'mt':
                    return ($number == 1) ?
                           0 :
                           ((($number == 0) || (($number % 100 > 1) && ($number % 100 < 11))) ?
                                1 :
                                ((($number % 100 > 10) && ($number % 100 < 20)) ? 2 : 3));

                case 'lv':
                    return ($number == 0) ? 0 : ((($number % 10 == 1) && ($number % 100 != 11)) ? 1 : 2);

                case 'pl':
                    return ($number == 1) ?
                           0 :
                           ((($number % 10 >= 2) && ($number % 10 <= 4) &&
                             (($number % 100 < 12) || ($number % 100 > 14))) ? 1 : 2);

                case 'cy':
                    return ($number == 1) ? 0 : (($number == 2) ? 1 : ((($number == 8) || ($number == 11)) ? 2 : 3));

                case 'ro':
                    return ($number == 1) ?
                           0 :
                           ((($number == 0) || (($number % 100 > 0) && ($number % 100 < 20))) ? 1 : 2);

                case 'ar':
                    return ($number == 0) ?
                           0 :
                           (($number == 1) ?
                                1 :
                                (($number == 2) ?
                                    2 :
                                    ((($number >= 3) && ($number <= 10)) ?
                                        3 :
                                        ((($number >= 11) && ($number <= 99)) ? 4 : 5))));

                default:
                    return 0;
            }
        };


    var Text = function(locale) {

        var self    = this;
        self.store  = {};
        if (locale) {
            self.locale = locale;
        }
    };

    extend(Text.prototype, {

        store: null,
        locale: "en",

        setLocale: function(locale) {
            this.locale = locale;
        },

        set: function(key, value) {
            var store = this.store;
            if (store[key] === undf) {
                store[key] = value;
            }
        },

        load: function(keys) {
            extend(this.store, keys, false, false);
        },

        get: function(key) {
            var self    = this;
            return self.store[key] ||
                   (self === globalText ? '-- ' + key + ' --' : globalText.get(key));
        },

        plural: function(key, number) {
            var self    = this,
                strings = self.get(key),
                def     = pluralDef(number, self.locale);

            if (!isArray(strings)) {
                if (isPlainObject(strings)) {
                    if (strings[number]) {
                        return strings[number];
                    }
                    if (number == 1 && strings.one != undf) {
                        return strings.one;
                    }
                    else if (number < 0 && strings.negative != undf) {
                        return strings.negative;
                    }
                    else {
                        return strings.other;
                    }
                }
                return strings;
            }
            else {
                return strings[def];
            }
        },

        destroy: function() {

            this.store = null;

        }

    }, true, false);


    var globalText  = new Text;

    Text.global     = function() {
        return globalText;
    };

    return Text;
}();




/**
 * @mixin ObservableMixin
 */
var ObservableMixin = ns.add("mixin.Observable", {

    /**
     * @type {Observable}
     */
    $$observable: null,

    $beforeInit: function(cfg) {

        var self = this;

        self.$$observable = new Observable;

        if (cfg && cfg.callback) {
            var ls = cfg.callback,
                context = ls.context,
                i;

            ls.context = null;

            for (i in ls) {
                if (ls[i]) {
                    self.$$observable.on(i, ls[i], context || self);
                }
            }

            cfg.callback = null;
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
        this.$$observable.trigger("beforedestroy", this);
    },

    $afterDestroy: function() {
        var self = this;
        self.$$observable.trigger("destroy", self);
        self.$$observable.destroy();
        self.$$observable = null;
    }
});





var Provider = function(){

    var VALUE       = 1,
        CONSTANT    = 2,
        FACTORY     = 3,
        SERVICE     = 4,
        PROVIDER    = 5,
        globalProvider;

    var Provider = function() {
        this.store  = {};
    };

    extend(Provider.prototype, {

        store: null,

        instantiate: function(fn, context, args, isClass) {

            if (fn.$instantiate) {
                return fn.$instantiate.apply(fn, args);
            }
            else if (isClass) {
                return instantiate(fn, args);
            }
            else {
                return fn.apply(context, args);
            }
        },

        inject: function(injectable, context, currentValues, callArgs, isClass) {

            currentValues   = currentValues || {};
            callArgs        = callArgs || [];

            var self = this;

            if (isFunction(injectable)) {

                if (injectable.inject) {
                    var tmp = slice.call(injectable.inject);
                    tmp.push(injectable);
                    injectable = tmp;
                }
                else {
                    return self.instantiate(injectable, context, callArgs, isClass);
                }
            }

            injectable  = slice.call(injectable);

            var values  = [],
                fn      = injectable.pop(),
                i, l;

            for (i = -1, l = injectable.length; ++i < l;
                 values.push(self.resolve(injectable[i], currentValues))) {}

            return Promise.all(values).then(function(values){
                return self.instantiate(fn, context, values, isClass);
            });
        },

        value: function(name, value) {
            this.store[name] = {
                type: VALUE,
                value: value
            };
        },

        constant: function(name, value) {
            var store = this.store;
            if (!store[name]) {
                store[name] = {
                    type: CONSTANT,
                    value: value
                };
            }
        },

        factory: function(name, fn, context, singleton) {

            if (isBool(context)) {
                singleton = context;
                context = null;
            }

            this.store[name] = {
                type: FACTORY,
                singleton: singleton,
                fn: fn,
                context: context
            };
        },

        service: function(name, constr, singleton) {
            this.store[name] = {
                type: SERVICE,
                singleton: singleton,
                fn: constr
            };
        },

        provider: function(name, constr) {

            this.store[name + "Provider"] = {
                name: name,
                type: PROVIDER,
                fn: constr,
                instance: null
            };
        },


        resolve: function(name, currentValues) {

            var self    = this,
                store   = self.store,
                type,
                item,
                res;

            if (currentValues[name] !== undf) {
                return currentValues[name];
            }

            if (item = store[name]) {

                type    = item.type;

                if (type == VALUE || type == CONSTANT) {
                    return item.value;
                }
                else if (type == FACTORY) {
                    res = self.inject(item.fn, item.context, currentValues);
                }
                else if (type == SERVICE) {
                    res = self.inject(item.fn, null, currentValues, null, true);
                }
                else if (type == PROVIDER) {

                    if (!item.instance) {

                        item.instance = Promise.resolve(
                                self.inject(item.fn, null, currentValues)
                            )
                            .done(function(instance){
                                item.instance = instance;
                                store[item.name] = {
                                    type: FACTORY,
                                    fn: instance.$get,
                                    context: instance
                                };
                            });
                    }

                    return item.instance;
                }

                if (item.singleton) {
                    item.type = VALUE;
                    item.value = res;

                    if (type == FACTORY && isThenable(res)) {
                        res.done(function(value){
                            item.value = value;
                        });
                    }
                }

                return currentValues[name] = res;
            }
            else {

                if (store[name + "Provider"]) {
                    self.resolve(name + "Provider", currentValues);
                    return self.resolve(name, currentValues);
                }

                if (self === globalProvider) {
                    throw "Could not provide value for " + name;
                }
                else {
                    return globalProvider.resolve(name);
                }
            }
        },

        destroy: function() {
            this.store = null;
            this.scope = null;
        }

    }, true, false);

    Provider.global = function() {
        return globalProvider;
    };

    globalProvider = new Provider;

    return Provider;
}();





var ProviderMixin = {

    /**
     * @type {Provider}
     */
    $$provider: null,

    $beforeInit: function() {

        this.$$provider = new Provider;

    },

    value: function() {
        var p = this.$$provider;
        return p.value.apply(p, arguments);
    },

    constant: function() {
        var p = this.$$provider;
        return p.constant.apply(p, arguments);
    },

    factory: function() {
        var p = this.$$provider;
        return p.factory.apply(p, arguments);
    },

    service: function() {
        var p = this.$$provider;
        return p.service.apply(p, arguments);
    },

    provider: function() {
        var p = this.$$provider;
        return p.provider.apply(p, arguments);
    },

    resolve: function() {
        var p = this.$$provider;
        return p.resolve.apply(p, arguments);
    },

    inject: function() {
        var p = this.$$provider;
        return p.inject.apply(p, arguments);
    },

    $afterDestroy: function() {

        this.$$provider.destroy();
        this.$$provider = null;

    }

};






defineClass({

    $class: "App",
    $mixins: [ObservableMixin, ProviderMixin],

    lang: null,
    scope: null,
    renderer: null,
    cmpListeners: null,
    components: null,

    $init: function(node, data) {

        var self        = this,
            scope       = data instanceof Scope ? data : new Scope(data),
            args;

        removeAttr(node, "mjs-app");

        scope.$app      = self;
        self.$super();

        self.lang       = new Text;

        self.scope          = scope;
        self.cmpListeners   = {};
        self.components     = {};

        self.factory('$parentCmp', ['$node', self.getParentCmp], self);
        self.value('$app', self);
        self.value('$rootScope', scope.$root);
        self.value('$lang', self.lang);

        self.renderer       = new Renderer(node, scope);

        args = slice.call(arguments);
        args[1] = scope;
        self.initApp.apply(self, args);
    },

    initApp: emptyFn,

    run: function() {
        this.renderer.process();
    },


    getParentCmp: function(node) {

        var self    = this,
            parent  = node.parentNode,
            id;

        while (parent) {

            if (id = getAttr(parent, "cmp-id")) {
                return self.getCmp(id);
            }

            parent = parent.parentNode;
        }

        return null;
    },

    onAvailable: function(cmpId, fn, context) {

        var self = this,
            cmpListeners = self.cmpListeners,
            components = self.components;

        if (!cmpListeners[cmpId]) {
            cmpListeners[cmpId] = new Promise;
        }

        if (fn) {
            cmpListeners[cmpId].done(fn, context);
        }

        if (components[cmpId]) {
            cmpListeners[cmpId].resolve(components[cmpId])
        }

        return cmpListeners[cmpId];
    },

    getCmp: function(id) {
        return this.components[id] || null;
    },

    registerCmp: function(cmp, scope, byKey) {
        var self = this,
            id = cmp[byKey],
            deregister = function() {
                delete self.cmpListeners[id];
                delete self.components[id];
            };

        self.components[id] = cmp;

        if (self.cmpListeners[id]) {
            self.cmpListeners[id].resolve(cmp);
        }

        if (cmp.on) {
            cmp.on("destroy", deregister);
        }
        scope.$on("$destroy", deregister);
    },

    destroy: function() {

        var self    = this;

        self.renderer.$destroy();
        self.scope.$destroy();
        self.lang.destroy();

        self.$super();
    }

});



var isAttached = function(){
    var isAttached = function isAttached(node) {

        if (node === window) {
            return true;
        }
        if (node.nodeType == 3) {
            if (node.parentElement) {
                return isAttached(node.parentElement);
            }
            else {
                return true;
            }
        }

        var html = document.documentElement;

        return node === html ? true : html.contains(node);
    };
    return isAttached;
}();




var data = function(){

    var dataCache   = {},

        getNodeId   = function(el) {
            return el._mjsid || (el._mjsid = nextUid());
        };

    /**
     * @param {Element} el
     * @param {String} key
     * @param {*} value optional
     */
    return function data(el, key, value) {
        var id  = getNodeId(el),
            obj = dataCache[id];

        if (value !== undf) {
            if (!obj) {
                obj = dataCache[id] = {};
            }
            obj[key] = value;
            return value;
        }
        else {
            return obj ? obj[key] : undf;
        }
    };

}();



function toFragment(nodes) {

    var fragment = document.createDocumentFragment(),
        i, l;

    if (isString(nodes)) {
        var tmp = document.createElement('div');
        tmp.innerHTML = nodes;
        nodes = tmp.childNodes;
    }

    if (nodes.nodeType) {
        fragment.appendChild(nodes);
    }
    else {
        if (nodes.item) {
            for (i = -1, l = nodes.length >>> 0; ++i !== l; fragment.appendChild(nodes[0])) {}
        }
        else {
            for (i = -1, l = nodes.length; ++i !== l; fragment.appendChild(nodes[i])) {}
        }
    }

    return fragment;
};



/**
 * @param {[]|Element} node
 * @returns {[]|Element}
 */
var clone = function clone(node) {

    var i, len, cloned;

    if (isArray(node)) {
        cloned = [];
        for (i = 0, len = node.length; i < len; i++) {
            cloned.push(clone(node[i]));
        }
        return cloned;
    }
    else if (node) {
        switch (node.nodeType) {
            // element
            case 1:
                return node.cloneNode(true);
            // text node
            case 3:
                return document.createTextNode(node.innerText || node.textContent);
            // document fragment
            case 11:
                return node.cloneNode(true);

            default:
                return null;
        }
    }

    return null;
};





var getAnimationPrefixes = function(){

    var domPrefixes         = ['Moz', 'Webkit', 'ms', 'O', 'Khtml'],
        animationDelay      = "animationDelay",
        animationDuration   = "animationDuration",
        transitionDelay     = "transitionDelay",
        transitionDuration  = "transitionDuration",
        transform           = "transform",
        transitionend       = null,
        prefixes            = null,

        probed              = false,

        detectCssPrefixes   = function() {

            var el = document.createElement("div"),
                animation = false,
                pfx,
                i, len;

            if (el.style['animationName'] !== undf) {
                animation = true;
            }
            else {
                for(i = 0, len = domPrefixes.length; i < len; i++) {
                    pfx = domPrefixes[i];
                    if (el.style[ pfx + 'AnimationName' ] !== undf) {
                        animation           = true;
                        animationDelay      = pfx + "AnimationDelay";
                        animationDuration   = pfx + "AnimationDuration";
                        transitionDelay     = pfx + "TransitionDelay";
                        transitionDuration  = pfx + "TransitionDuration";
                        transform           = pfx + "Transform";
                        break;
                    }
                }
            }

            if (animation) {
                if('ontransitionend' in window) {
                    // Chrome/Saf (+ Mobile Saf)/Android
                    transitionend = 'transitionend';
                }
                else if('onwebkittransitionend' in window) {
                    // Chrome/Saf (+ Mobile Saf)/Android
                    transitionend = 'webkitTransitionEnd';
                }
            }

            return animation;
        };



    return function() {

        if (!probed) {
            if (detectCssPrefixes()) {
                prefixes = {
                    animationDelay: animationDelay,
                    animationDuration: animationDuration,
                    transitionDelay: transitionDelay,
                    transitionDuration: transitionDuration,
                    transform: transform,
                    transitionend: transitionend
                };
            }
            probed = true;
        }


        return prefixes;
    };
}();



var getAnimationDuration = function(){

    var parseTime       = function(str) {
            if (!str) {
                return 0;
            }
            var time = parseFloat(str);
            if (str.indexOf("ms") == -1) {
                time *= 1000;
            }
            return time;
        },

        getMaxTimeFromPair = function(max, dur, delay) {

            var i, sum, len = dur.length;

            for (i = 0; i < len; i++) {
                sum = parseTime(dur[i]) + parseTime(delay[i]);
                max = Math.max(sum, max);
            }

            return max;
        },

        pfx                 = false,
        animationDuration   = null,
        animationDelay      = null,
        transitionDuration  = null,
        transitionDelay     = null;


    return function(el) {

        if (pfx === false) {
            pfx = getAnimationPrefixes();
            animationDuration = pfx ? pfx.animationDuration : null;
            animationDelay = pfx ? pfx.animationDelay : null;
            transitionDuration = pfx ? pfx.transitionDuration : null;
            transitionDelay = pfx ? pfx.transitionDelay : null;
        }

        if (!pfx) {
            return 0;
        }

        var style       = window.getComputedStyle ? window.getComputedStyle(el, null) : el.style,
            duration    = 0,
            animDur     = (style[animationDuration] || '').split(','),
            animDelay   = (style[animationDelay] || '').split(','),
            transDur    = (style[transitionDuration] || '').split(','),
            transDelay  = (style[transitionDelay] || '').split(',');

        duration    = Math.max(duration, getMaxTimeFromPair(duration, animDur, animDelay));
        duration    = Math.max(duration, getMaxTimeFromPair(duration, transDur, transDelay));

        return duration;
    };

}();



var getRegExp = function(){

    var cache = {};

    /**
     * @param {String} expr
     * @returns RegExp
     */
    return function getRegExp(expr) {
        return cache[expr] || (cache[expr] = new RegExp(expr));
    };
}();



/**
 * @param {String} cls
 * @returns {RegExp}
 */
function getClsReg(cls) {
    return getRegExp('(?:^|\\s)'+cls+'(?!\\S)');
};



/**
 * @param {Element} el
 * @param {String} cls
 */
function removeClass(el, cls) {
    if (cls) {
        el.className = el.className.replace(getClsReg(cls), '');
    }
};



var stopAnimation = function(el) {

    var queue = data(el, "mjsAnimationQueue"),
        current,
        position,
        stages;

    if (isArray(queue) && queue.length) {
        current = queue[0];

        if (current) {
            if (current.stages) {
                position = current.position;
                stages = current.stages;
                removeClass(el, stages[position]);
                removeClass(el, stages[position] + "-active");
            }
            if (current.deferred) {
                current.deferred.reject(current.el);
            }
        }
    }
    else if (isFunction(queue)) {
        queue(el);
    }
    else if (queue == "stop") {
        $(el).stop(true, true);
    }

    data(el, "mjsAnimationQueue", null);
};




/**
 * @param {Element} el
 * @param {String} cls
 * @returns {boolean}
 */
function hasClass(el, cls) {
    return cls ? getClsReg(cls).test(el.className) : false;
};



/**
 * @param {Element} el
 * @param {String} cls
 */
function addClass(el, cls) {
    if (cls && !hasClass(el, cls)) {
        el.className += " " + cls;
    }
};



var raf = function() {

    var raf,
        cancel;

    if (typeof window != strUndef) {
        var w   = window;
        raf     = w.requestAnimationFrame ||
                    w.webkitRequestAnimationFrame ||
                    w.mozRequestAnimationFrame;
        cancel  = w.cancelAnimationFrame ||
                    w.webkitCancelAnimationFrame ||
                    w.mozCancelAnimationFrame ||
                    w.webkitCancelRequestAnimationFrame;

        if (raf) {
            return function(fn) {
                var id = raf(fn);
                return function() {
                    cancel(id);
                };
            };
        }
    }

    return function(fn) {
        var id = setTimeout(fn, 0);
        return function() {
            clearTimeout(id);
        }
    };
}();

function addListener(el, event, func) {
    if (el.attachEvent) {
        el.attachEvent('on' + event, func);
    } else {
        el.addEventListener(event, func, false);
    }
};


function removeListener(el, event, func) {
    if (el.detachEvent) {
        el.detachEvent('on' + event, func);
    } else {
        el.removeEventListener(event, func, false);
    }
};




var animate = function(){


    var types           = {
            "show":     ["mjs-show"],
            "hide":     ["mjs-hide"],
            "enter":    ["mjs-enter"],
            "leave":    ["mjs-leave"],
            "move":     ["mjs-move"]
        },

        animId          = 0,

        prefixes        = false,
        cssAnimations   = false,

        dataParam       = "mjsAnimationQueue",

        callTimeout     = function(fn, startTime, duration) {
            var tick = function(){
                var time = (new Date).getTime();
                if (time - startTime >= duration) {
                    fn();
                }
                else {
                    raf(tick);
                }
            };
            raf(tick);
        },



        nextInQueue     = function(el) {
            var queue = data(el, dataParam),
                next;
            if (queue.length) {
                next = queue[0];
                animationStage(next.el, next.stages, 0, next.start, next.deferred, false, next.id, next.step);
            }
            else {
                data(el, dataParam, null);
            }
        },

        animationStage  = function animationStage(el, stages, position, startCallback,
                                                  deferred, first, id, stepCallback) {

            var stopped   = function() {
                var q = data(el, dataParam);
                if (!q || !q.length || q[0].id != id) {
                    deferred.reject(el);
                    return true;
                }
                return false;
            };

            var finishStage = function() {

                //if (prefixes.transitionend) {
                //    removeListener(el, prefixes.transitionend, finishStage);
                //}

                if (stopped()) {
                    return;
                }

                var thisPosition = position;

                position++;

                if (position == stages.length) {
                    deferred.resolve(el);
                    data(el, dataParam).shift();
                    nextInQueue(el);
                }
                else {
                    data(el, dataParam)[0].position = position;
                    animationStage(el, stages, position, null, deferred, false, id, stepCallback);
                }

                removeClass(el, stages[thisPosition]);
                removeClass(el, stages[thisPosition] + "-active");
            };

            var setStage = function() {

                if (!stopped()) {
                    addClass(el, stages[position] + "-active");

                    Promise.resolve(stepCallback && stepCallback(el, position, "active"))
                        .done(function(){
                            if (!stopped()) {

                                var duration = getAnimationDuration(el);

                                if (duration) {
                                    // i don't understand how transitionend works.
                                    // it just doesn't fire sometimes! :(

                                    //if (prefixes.transitionend) {
                                    //    addListener(el, prefixes.transitionend, finishStage);
                                    //}
                                    //else {
                                        callTimeout(finishStage, (new Date).getTime(), duration);
                                    //}
                                }
                                else {
                                    raf(finishStage);
                                }
                            }
                        });
                }

            };

            var start = function(){

                if (!stopped()) {
                    addClass(el, stages[position]);

                    Promise.waterfall([
                            stepCallback && stepCallback(el, position, "start"),
                            function(){
                                return startCallback ? startCallback(el) : null;
                            }
                        ])
                        .done(function(){
                            !stopped() && raf(setStage);
                        });
                }
            };



            first ? raf(start) : start();
        };


    var animate = function animate(el, animation, startCallback, checkIfEnabled, namespace, stepCallback) {

        if (prefixes === false) {
            prefixes        = getAnimationPrefixes();
            cssAnimations   = !!prefixes;
        }

        var deferred    = new Promise,
            queue       = data(el, dataParam) || [],
            id          = ++animId,
            attrValue   = getAttr(el, "mjs-animate"),
            stages,
            jsFn,
            before, after,
            options, context,
            duration;

        animation       = animation || attrValue;

        if (checkIfEnabled && isNull(attrValue)) {
            animation   = null;
        }

        if (animation) {

            if (isString(animation)) {
                if (animation.substr(0,1) == '[') {
                    stages  = (new Function('', 'return ' + animation))();
                }
                else {
                    stages      = types[animation];
                    animation   = namespace && namespace.get("animate." + animation, true);
                }
            }
            else if (isFunction(animation)) {
                jsFn = animation;
            }
            else if (isArray(animation)) {
                if (isString(animation[0])) {
                    stages = animation;
                }
                else {
                    before = animation[0];
                    after = animation[1];
                }
            }

            if (isPlainObject(animation)) {
                stages      = animation.stages;
                jsFn        = animation.fn;
                before      = animation.before;
                after       = animation.after;
                options     = animation.options ? extend({}, animation.options) : {};
                context     = animation.context || null;
                duration    = animation.duration || null;
                startCallback   = startCallback || options.start;
            }


            if (cssAnimations && stages) {

                queue.push({
                    el: el,
                    stages: stages,
                    start: startCallback,
                    step: stepCallback,
                    deferred: deferred,
                    position: 0,
                    id: id
                });
                data(el, dataParam, queue);

                if (queue.length == 1) {
                    animationStage(el, stages, 0, startCallback, deferred, true, id, stepCallback);
                }

                return deferred;
            }
            else {

                options = options || {};

                startCallback && (options.start = function(){
                    startCallback(el);
                });

                options.complete = function() {
                    deferred.resolve(el);
                };

                duration && (options.duration = duration);

                if (jsFn && isFunction(jsFn)) {
                    if (before) {
                        extend(el.style, before, true, false);
                    }
                    startCallback && startCallback(el);
                    data(el, dataParam, jsFn.call(context, el, function(){
                        deferred.resolve(el);
                    }));
                    return deferred;
                }
                else if (window.jQuery) {

                    var j = $(el);
                    before && j.css(before);
                    data(el, dataParam, "stop");

                    if (jsFn && isString(jsFn)) {
                        j[jsFn](options);
                        return deferred;
                    }
                    else if (after) {
                        j.animate(after, options);
                        return deferred;
                    }
                }
            }
        }

        // no animation happened

        if (startCallback) {
            var promise = startCallback(el);
            if (isThenable(promise)) {
                promise.done(function(){
                    deferred.resolve(el);
                });
            }
            else {
                deferred.resolve(el);
            }
        }
        else {
            deferred.resolve(el);
        }

        return deferred;
    };

    animate.addAnimationType     = function(name, stages) {
        types[name] = stages;
    };

    animate.stop = stopAnimation;
    animate.prefixes = prefixes;
    animate.cssAnimations = cssAnimations;

    return animate;
}();



var parseJSON = function() {

    return typeof JSON != strUndef ?
           function(data) {
               return JSON.parse(data);
           } :
           function(data) {
               return (new Function("return " + data))();
           };
}();





function parseXML(data, type) {

    var xml, tmp;

    if (!data || !isString(data)) {
        return null;
    }

    // Support: IE9
    try {
        tmp = new DOMParser();
        xml = tmp.parseFromString(data, type || "text/xml");
    } catch (thrownError) {
        xml = undf;
    }

    if (!xml || xml.getElementsByTagName("parsererror").length) {
        throw "Invalid XML: " + data;
    }

    return xml;
};



/**
 * Modified version of YASS (http://yass.webo.in)
 */

/**
 * Returns array of nodes or an empty array
 * @function select
 * @param {String} selector
 * @param {Element} root to look into
 */
var select = function() {

    var rGeneric    = /^[\w[:#.][\w\]*^|=!]*$/,
        rQuote      = /=([^\]]+)/,
        rGrpSplit   = / *, */,
        rRepPlus    = /(\([^)]*)\+/,
        rRepTild    = /(\[[^\]]+)~/,
        rRepAll     = /(~|>|\+)/,
        rSplitPlus  = / +/,
        rSingleMatch= /([^[:.#]+)?(?:#([^[:.#]+))?(?:\.([^[:.]+))?(?:\[([^!&^*|$[:=]+)([!$^*|&]?=)?([^:\]]+)?\])?(?::([^(]+)(?:\(([^)]+)\))?)?/,
        rNthNum     = /(?:(-?\d*)n)?(?:(%|-)(\d*))?/,
        rNonDig     = /\D/,
        rRepPrnth   = /[^(]*\(([^)]*)\)/,
        rRepAftPrn  = /\(.*/,
        rGetSquare  = /\[([^!~^*|$ [:=]+)([$^*|]?=)?([^ :\]]+)?\]/,

        doc         = document,
        bcn         = !!doc.getElementsByClassName,
        qsa         = !!doc.querySelectorAll,

        /*
         function calls for CSS2/3 modificatos. Specification taken from
         http://www.w3.org/TR/2005/WD-css3-selectors-20051215/
         on success return negative result.
         */
        mods        = {
            /* W3C: "an E element, first child of its parent" */
            'first-child': function (child) {
                /* implementation was taken from jQuery.1.2.6, line 1394 */
                return child.parentNode.getElementsByTagName('*')[0] !== child;
            },
            /* W3C: "an E element, last child of its parent" */
            'last-child': function (child) {
                var brother = child;
                /* loop in lastChilds while nodeType isn't element */
                while ((brother = brother.nextSibling) && brother.nodeType != 1) {}
                /* Check for node's existence */
                return !!brother;
            },
            /* W3C: "an E element, root of the document" */
            root: function (child) {
                return child.nodeName.toLowerCase() !== 'html';
            },
            /* W3C: "an E element, the n-th child of its parent" */
            'nth-child': function (child, ind) {
                var i = child.nodeIndex || 0,
                    a = ind[3] = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0,
                    b = ind[1];
                /* check if we have already looked into siblings, using exando - very bad */
                if (i) {
                    return !( (i + a) % b);
                } else {
                    /* in the other case just reverse logic for n and loop siblings */
                    var brother = child.parentNode.firstChild;
                    i++;
                    /* looping in child to find if nth expression is correct */
                    do {
                        /* nodeIndex expando used from Peppy / Sizzle/ jQuery */
                        if (brother.nodeType == 1 && (brother.nodeIndex = ++i) && child === brother && ((i + a) % b)) {
                            return 0;
                        }
                    } while (brother = brother.nextSibling);
                    return 1;
                }
            },
            /*
             W3C: "an E element, the n-th child of its parent,
             counting from the last one"
             */
            'nth-last-child': function (child, ind) {
                /* almost the same as the previous one */
                var i = child.nodeIndexLast || 0,
                    a = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0,
                    b = ind[1];
                if (i) {
                    return !( (i + a) % b);
                } else {
                    var brother = child.parentNode.lastChild;
                    i++;
                    do {
                        if (brother.nodeType == 1 && (brother.nodeLastIndex = i++) && child === brother && ((i + a) % b)) {
                            return 0;
                        }
                    } while (brother = brother.previousSibling);
                    return 1;
                }
            },
            /*
             Rrom w3.org: "an E element that has no children (including text nodes)".
             Thx to John, from Sizzle, 2008-12-05, line 416
             */
            empty: function (child) {
                return !!child.firstChild;
            },
            /* thx to John, stolen from Sizzle, 2008-12-05, line 413 */
            parent: function (child) {
                return !child.firstChild;
            },
            /* W3C: "an E element, only child of its parent" */
            'only-child': function (child) {
                return child.parentNode.getElementsByTagName('*').length != 1;
            },
            /*
             W3C: "a user interface element E which is checked
             (for instance a radio-button or checkbox)"
             */
            checked: function (child) {
                return !child.checked;
            },
            /*
             W3C: "an element of type E in language "fr"
             (the document language specifies how language is determined)"
             */
            lang: function (child, ind) {
                return child.lang !== ind && doc.documentElement.lang !== ind;
            },
            /* thx to John, from Sizzle, 2008-12-05, line 398 */
            enabled: function (child) {
                return child.disabled || child.type === 'hidden';
            },
            /* thx to John, from Sizzle, 2008-12-05, line 401 */
            disabled: function (child) {
                return !child.disabled;
            },
            /* thx to John, from Sizzle, 2008-12-05, line 407 */
            selected: function(elem){
                /*
                 Accessing this property makes selected-by-default
                 options in Safari work properly.
                 */
                var tmp = elem.parentNode.selectedIndex;
                return !elem.selected;
            }
        },

        attrRegCache = {},

        getAttrReg  = function(value) {
            return attrRegCache[value] || (attrRegCache[value] = new RegExp('(^| +)' + value + '($| +)'));
        },

        attrMods    = {
            /* W3C "an E element with a "attr" attribute" */
            '': function (child, name) {
                return getAttr(child, name) !== null;
            },
            /*
             W3C "an E element whose "attr" attribute value is
             exactly equal to "value"
             */
            '=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name)) && attrValue === value;
            },
            /*
             from w3.prg "an E element whose "attr" attribute value is
             a list of space-separated values, one of which is exactly
             equal to "value"
             */
            '&=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name)) && getAttrReg(value).test(attrValue);
            },
            /*
             from w3.prg "an E element whose "attr" attribute value
             begins exactly with the string "value"
             */
            '^=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name) + '') && !attrValue.indexOf(value);
            },
            /*
             W3C "an E element whose "attr" attribute value
             ends exactly with the string "value"
             */
            '$=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name) + '') &&
                       attrValue.indexOf(value) == attrValue.length - value.length;
            },
            /*
             W3C "an E element whose "attr" attribute value
             contains the substring "value"
             */
            '*=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name) + '') && attrValue.indexOf(value) != -1;
            },
            /*
             W3C "an E element whose "attr" attribute has
             a hyphen-separated list of values beginning (from the
             left) with "value"
             */
            '|=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name) + '') &&
                       (attrValue === value || !!attrValue.indexOf(value + '-'));
            },
            /* attr doesn't contain given value */
            '!=': function (child, name, value) {
                var attrValue;
                return !(attrValue = getAttr(child, name)) || !getAttrReg(value).test(attrValue);
            }
        };


    var select = function (selector, root) {

        /* clean root with document */
        root = root || doc;

        /* sets of nodes, to handle comma-separated selectors */
        var sets    = [],
            qsaErr  = null,
            idx, cls, nodes,
            i, node, ind, mod,
            attrs, attrName, eql, value;

        if (qsa) {
            /* replace not quoted args with quoted one -- Safari doesn't understand either */
            try {
                sets = toArray(root.querySelectorAll(selector.replace(rQuote, '="$1"')));
            }
            catch (thrownError) {
                qsaErr = true;
            }
        }

        if (!qsa || qsaErr) {

            /* quick return or generic call, missed ~ in attributes selector */
            if (rGeneric.test(selector)) {

                /*
                 some simple cases - only ID or only CLASS for the very first occurence
                 - don't need additional checks. Switch works as a hash.
                 */
                idx = 0;

                /* the only call -- no cache, thx to GreLI */
                switch (selector.charAt(0)) {

                    case '#':
                        idx = selector.slice(1);
                        sets = doc.getElementById(idx);

                        /*
                         workaround with IE bug about returning element by name not by ID.
                         Solution completely changed, thx to deerua.
                         Get all matching elements with this id
                         */
                        if (sets.id !== idx) {
                            sets = doc.all[idx];
                        }

                        sets = sets ? [sets] : [];
                        break;

                    case '.':

                        cls = selector.slice(1);

                        if (bcn) {

                            sets = toArray((idx = (sets = root.getElementsByClassName(cls)).length) ? sets : []);

                        } else {

                            /* no RegExp, thx to DenVdmj */
                            cls = ' ' + cls + ' ';

                            nodes = root.getElementsByTagName('*');
                            i = 0;

                            while (node = nodes[i++]) {
                                if ((' ' + node.className + ' ').indexOf(cls) != -1) {
                                    sets[idx++] = node;
                                }

                            }
                            sets = idx ? sets : [];
                        }
                        break;

                    case ':':

                        nodes   = root.getElementsByTagName('*');
                        i       = 0;
                        ind     = selector.replace(rRepPrnth,"$1");
                        mod     = selector.replace(rRepAftPrn,'');

                        while (node = nodes[i++]) {
                            if (mods[mod] && !mods[mod](node, ind)) {
                                sets[idx++] = node;
                            }
                        }
                        sets = idx ? sets : [];
                        break;

                    case '[':

                        nodes   = root.getElementsByTagName('*');
                        i       = 0;
                        attrs   = rGetSquare.exec(selector);
                        attrName    = attrs[1];
                        eql     = attrs[2] || '';
                        value   = attrs[3];

                        while (node = nodes[i++]) {
                            /* check either attr is defined for given node or it's equal to given value */
                            if (attrMods[eql] && (attrMods[eql](node, attrName, value) ||
                                                  (attrName === 'class' && attrMods[eql](node, 'className', value)))) {
                                sets[idx++] = node;
                            }
                        }
                        sets = idx ? sets : [];
                        break;

                    default:
                        sets = toArray((idx = (sets = root.getElementsByTagName(selector)).length) ? sets : []);
                        break;
                }

            } else {

                /* number of groups to merge or not result arrays */
                /*
                 groups of selectors separated by commas.
                 Split by RegExp, thx to tenshi.
                 */
                var groups  = selector.split(rGrpSplit),
                    gl      = groups.length - 1, /* group counter */
                    concat  = !!gl, /* if we need to concat several groups */
                    group,
                    singles,
                    singles_length,
                    single, /* to handle RegExp for single selector */
                    ancestor, /* to remember ancestor call for next childs, default is " " */
                /* for inner looping */
                    tag, id, klass, newNodes, J, child, last, childs, item, h;

                /* loop in groups, maybe the fastest way */
                while (group = groups[gl--]) {

                    /*
                     Split selectors by space - to form single group tag-id-class,
                     or to get heredity operator. Replace + in child modificators
                     to % to avoid collisions. Additional replace is required for IE.
                     Replace ~ in attributes to & to avoid collisions.
                     */
                    singles_length = (singles = group
                        .replace(rRepPlus,"$1%")
                        .replace(rRepTild,"$1&")
                        .replace(rRepAll," $1 ").split(rSplitPlus)).length;

                    i = 0;
                    ancestor = ' ';
                    /* is cleanded up with DOM root */
                    nodes = [root];

                    /*
                     John's Resig fast replace works a bit slower than
                     simple exec. Thx to GreLI for 'greed' RegExp
                     */
                    while (single = singles[i++]) {

                        /* simple comparison is faster than hash */
                        if (single !== ' ' && single !== '>' && single !== '~' && single !== '+' && nodes) {

                            single = single.match(rSingleMatch);

                            /*
                             Get all required matches from exec:
                             tag, id, class, attribute, value, modificator, index.
                             */
                            tag     = single[1] || '*';
                            id      = single[2];
                            klass   = single[3] ? ' ' + single[3] + ' ' : '';
                            attrName    = single[4];
                            eql     = single[5] || '';
                            mod     = single[7];

                            /*
                             for nth-childs modificator already transformed into array.
                             Example used from Sizzle, rev. 2008-12-05, line 362.
                             */
                            ind = mod === 'nth-child' || mod === 'nth-last-child' ?
                                  rNthNum.exec(
                                      single[8] === 'even' && '2n' ||
                                      single[8] === 'odd' && '2n%1' ||
                                      !rNonDig.test(single[8]) && '0n%' + single[8] ||
                                      single[8]
                                  ) :
                                  single[8];

                            /* new nodes array */
                            newNodes = [];

                            /*
                             cached length of new nodes array
                             and length of root nodes
                             */
                            idx = J = 0;

                            /* if we need to mark node with expando yeasss */
                            last = i == singles_length;

                            /* loop in all root nodes */
                            while (child = nodes[J++]) {
                                /*
                                 find all TAGs or just return all possible neibours.
                                 Find correct 'children' for given node. They can be
                                 direct childs, neighbours or something else.
                                 */
                                switch (ancestor) {
                                    case ' ':
                                        childs = child.getElementsByTagName(tag);
                                        h = 0;
                                        while (item = childs[h++]) {
                                            /*
                                             check them for ID or Class. Also check for expando 'yeasss'
                                             to filter non-selected elements. Typeof 'string' not added -
                                             if we get element with name="id" it won't be equal to given ID string.
                                             Also check for given attributes selector.
                                             Modificator is either not set in the selector, or just has been nulled
                                             by modificator functions hash.
                                             */
                                            if ((!id || item.id === id) &&
                                                (!klass || (' ' + item.className + ' ').indexOf(klass) != -1) &&
                                                (!attrName || (attrMods[eql] &&
                                                           (attrMods[eql](item, attrName, single[6]) ||
                                                            (attrName === 'class' &&
                                                             attrMods[eql](item, 'className', single[6]))))) &&
                                                !item.yeasss && !(mods[mod] ? mods[mod](item, ind) : mod)) {

                                                /*
                                                 Need to define expando property to true for the last step.
                                                 Then mark selected element with expando
                                                 */
                                                if (last) {
                                                    item.yeasss = 1;
                                                }
                                                newNodes[idx++] = item;
                                            }
                                        }
                                        break;
                                    /* W3C: "an F element preceded by an E element" */
                                    case '~':

                                        tag = tag.toLowerCase();

                                        /* don't touch already selected elements */
                                        while ((child = child.nextSibling) && !child.yeasss) {
                                            if (child.nodeType == 1 &&
                                                (tag === '*' || child.nodeName.toLowerCase() === tag) &&
                                                (!id || child.id === id) &&
                                                (!klass || (' ' + child.className + ' ').indexOf(klass) != -1) &&
                                                (!attrName || (attrMods[eql] &&
                                                           (attrMods[eql](item, attrName, single[6]) ||
                                                            (attrName === 'class' &&
                                                             attrMods[eql](item, 'className', single[6]))))) &&
                                                !child.yeasss &&
                                                !(mods[mod] ? mods[mod](child, ind) : mod)) {

                                                if (last) {
                                                    child.yeasss = 1;
                                                }
                                                newNodes[idx++] = child;
                                            }
                                        }
                                        break;

                                    /* W3C: "an F element immediately preceded by an E element" */
                                    case '+':
                                        while ((child = child.nextSibling) && child.nodeType != 1) {}
                                        if (child &&
                                            (child.nodeName.toLowerCase() === tag.toLowerCase() || tag === '*') &&
                                            (!id || child.id === id) &&
                                            (!klass || (' ' + item.className + ' ').indexOf(klass) != -1) &&
                                            (!attrName ||
                                             (attrMods[eql] && (attrMods[eql](item, attrName, single[6]) ||
                                                                (attrName === 'class' &&
                                                                 attrMods[eql](item, 'className', single[6]))))) &&
                                            !child.yeasss && !(mods[mod] ? mods[mod](child, ind) : mod)) {

                                            if (last) {
                                                child.yeasss = 1;
                                            }
                                            newNodes[idx++] = child;
                                        }
                                        break;

                                    /* W3C: "an F element child of an E element" */
                                    case '>':
                                        childs = child.getElementsByTagName(tag);
                                        i = 0;
                                        while (item = childs[i++]) {
                                            if (item.parentNode === child &&
                                                (!id || item.id === id) &&
                                                (!klass || (' ' + item.className + ' ').indexOf(klass) != -1) &&
                                                (!attrName || (attrMods[eql] &&
                                                           (attrMods[eql](item, attrName, single[6]) ||
                                                            (attrName === 'class' &&
                                                             attrMods[eql](item, 'className', single[6]))))) &&
                                                !item.yeasss &&
                                                !(mods[mod] ? mods[mod](item, ind) : mod)) {

                                                if (last) {
                                                    item.yeasss = 1;
                                                }
                                                newNodes[idx++] = item;
                                            }
                                        }
                                        break;
                                }
                            }

                            /* put selected nodes in local nodes' set */
                            nodes = newNodes;

                        } else {

                            /* switch ancestor ( , > , ~ , +) */
                            ancestor = single;
                        }
                    }

                    if (concat) {
                        /* if sets isn't an array - create new one */
                        if (!nodes.concat) {
                            newNodes = [];
                            h = 0;
                            while (item = nodes[h]) {
                                newNodes[h++] = item;
                            }
                            nodes = newNodes;
                            /* concat is faster than simple looping */
                        }
                        sets = nodes.concat(sets.length == 1 ? sets[0] : sets);

                    } else {

                        /* inialize sets with nodes */
                        sets = nodes;
                    }
                }

                /* define sets length to clean up expando */
                idx = sets.length;

                /*
                 Need this looping as far as we also have expando 'yeasss'
                 that must be nulled. Need this only to generic case
                 */
                while (idx--) {
                    sets[idx].yeasss = sets[idx].nodeIndex = sets[idx].nodeIndexLast = null;
                }
            }
        }

        /* return and cache results */
        return sets;
    };

    select.is = function(el, selector) {

        var els = select(selector, el.parentNode),
            i, l;

        for (i = -1, l = els.length; ++i < l;) {
            if (els[i] === el) {
                return true;
            }
        }
        return false;
    };

    return select;
}();





/*
* Contents of this file are partially taken from jQuery
*/

var ajax = function(){

    

    var rhash       = /#.*$/,

        rts         = /([?&])_=[^&]*/,

        rquery      = /\?/,

        rurl        = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

        rgethead    = /^(?:GET|HEAD)$/i,

        buildParams     = function(data, params, name) {

            var i, len;

            if (isPrimitive(data) && name) {
                params.push(encodeURIComponent(name) + "=" + encodeURIComponent(""+data));
            }
            else if (isArray(data) && name) {
                for (i = 0, len = data.length; i < len; i++) {
                    buildParams(data[i], params, name + "["+i+"]");
                }
            }
            else if (isObject(data)) {
                for (i in data) {
                    if (data.hasOwnProperty(i)) {
                        buildParams(data[i], params, name ? name + "["+i+"]" : i);
                    }
                }
            }
        },

        prepareParams   = function(data) {
            var params = [];
            buildParams(data, params, null);
            return params.join("&").replace(/%20/g, "+");
        },

        prepareUrl  = function(url, opt) {

            url.replace(rhash, "");

            if (opt.cache === false) {

                var stamp   = (new Date).getTime();

                return rts.test(url) ?
                    // If there is already a '_' parameter, set its value
                       url.replace(rts, "$1_=" + stamp) :
                    // Otherwise add one to the end
                       url + (rquery.test(url) ? "&" : "?" ) + "_=" + stamp;
            }

            if (opt.data && (!window.FormData || !(opt.data instanceof window.FormData))) {

                opt.data = !isString(opt.data) ? prepareParams(opt.data) : opt.data;

                if (rgethead.test(opt.method)) {
                    url += (rquery.test(url) ? "&" : "?") + opt.data;
                    opt.data = null;
                }
            }

            return url;
        },

        accepts     = {
            xml:        "application/xml, text/xml",
            html:       "text/html",
            script:     "text/javascript, application/javascript",
            json:       "application/json, text/javascript",
            text:       "text/plain",
            _default:   "*/*"
        },

        defaults    = {
            url:            null,
            data:           null,
            method:         "GET",
            headers:        null,
            username:       null,
            password:       null,
            cache:          null,
            dataType:       null,
            timeout:        0,
            contentType:    "application/x-www-form-urlencoded",
            xhrFields:      null,
            jsonp:          false,
            jsonpParam:     null,
            jsonpCallback:  null,
            transport:      null,
            replace:        false,
            selector:       null,
            form:           null,
            beforeSend:     null,
            progress:       null,
            uploadProgress: null,
            processResponse:null,
            callbackScope:  null
        },

        defaultSetup    = {},

        globalEvents    = new Observable,

        createXHR       = function() {

            var xhr;

            if (!window.XMLHttpRequest || !(xhr = new XMLHttpRequest())) {
                if (!(xhr = new ActiveXObject("Msxml2.XMLHTTP"))) {
                    if (!(xhr = new ActiveXObject("Microsoft.XMLHTTP"))) {
                        throw "Unable to create XHR object";
                    }
                }
            }

            return xhr;
        },

        globalEval      = function(code){
            var script, indirect = eval;
            if (code) {
                if (/^[^\S]*use strict/.test(code)) {
                    script = document.createElement("script");
                    script.text = code;
                    document.head.appendChild(script)
                        .parentNode.removeChild(script);
                } else {
                    indirect(code);
                }
            }
        },

        data2form       = function(data, form, name) {

            var i, input, len;

            if (!isObject(data) && !isFunction(data) && name) {
                input   = document.createElement("input");
                setAttr(input, "type", "hidden");
                setAttr(input, "name", name);
                setAttr(input, "value", data);
                form.appendChild(input);
            }
            else if (isArray(data) && name) {
                for (i = 0, len = data.length; i < len; i++) {
                    data2form(data[i], form, name + "["+i+"]");
                }
            }
            else if (isObject(data)) {
                for (i in data) {
                    if (data.hasOwnProperty(i)) {
                        data2form(data[i], form, name ? name + "["+i+"]" : i);
                    }
                }
            }
        },

        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
        serializeForm   = function(form) {

            var oField, sFieldType, nFile, sSearch = "";

            for (var nItem = 0; nItem < form.elements.length; nItem++) {

                oField = form.elements[nItem];

                if (getAttr(oField, "name") === null) {
                    continue;
                }

                sFieldType = oField.nodeName.toUpperCase() === "INPUT" ?
                             getAttr(oField, "type").toUpperCase() : "TEXT";

                if (sFieldType === "FILE") {
                    for (nFile = 0;
                         nFile < oField.files.length;
                         sSearch += "&" + encodeURIComponent(oField.name) + "=" +
                                    encodeURIComponent(oField.files[nFile++].name)){}

                } else if ((sFieldType !== "RADIO" && sFieldType !== "CHECKBOX") || oField.checked) {
                    sSearch += "&" + encodeURIComponent(oField.name) + "=" + encodeURIComponent(oField.value);
                }
            }

            return sSearch;
        },

        httpSuccess     = function(r) {
            try {
                return (!r.status && location && location.protocol == "file:")
                           || (r.status >= 200 && r.status < 300)
                           || r.status === 304 || r.status === 1223; // || r.status === 0;
            } catch(thrownError){}
            return false;
        },

        processData     = function(data, opt, ct) {

            var type        = opt ? opt.dataType : null,
                selector    = opt ? opt.selector : null,
                doc;

            if (!isString(data)) {
                return data;
            }

            ct = ct || "";

            if (type === "xml" || !type && ct.indexOf("xml") >= 0) {
                doc = parseXML(trim(data));
                return selector ? select(selector, doc) : doc;
            }
            else if (type === "html") {
                doc = parseXML(data, "text/html");
                return selector ? select(selector, doc) : doc;
            }
            else if (type == "fragment") {
                var fragment    = document.createDocumentFragment(),
                    div         = document.createElement("div");

                div.innerHTML   = data;

                while (div.firstChild) {
                    fragment.appendChild(div.firstChild);
                }

                return fragment;
            }
            else if (type === "json" || !type && ct.indexOf("json") >= 0) {
                return parseJSON(trim(data));
            }
            else if (type === "script" || !type && ct.indexOf("javascript") >= 0) {
                globalEval(data);
            }

            return data + "";
        };




    var AJAX    = function(opt) {

        var self        = this,
            href        = window ? window.location.href : "",
            local       = rurl.exec(href.toLowerCase()) || [],
            parts       = rurl.exec(opt.url.toLowerCase());

        self._opt       = opt;

        if (opt.crossDomain !== true) {
            opt.crossDomain = !!(parts &&
                                 (parts[1] !== local[1] || parts[2] !== local[2] ||
                                  (parts[3] || (parts[1] === "http:" ? "80" : "443")) !==
                                  (local[3] || (local[1] === "http:" ? "80" : "443"))));
        }

        var deferred    = new Promise,
            transport;

        if (opt.transport == "iframe" && !opt.form) {
            self.createForm();
            opt.form = self._form;
        }
        else if (opt.form) {
            self._form = opt.form;
            if (opt.method == "POST" && (!window || !window.FormData)) {
                opt.transport = "iframe";
            }
        }

        if (opt.form && opt.transport != "iframe") {
            if (opt.method == "POST") {
                opt.data = new FormData(opt.form);
            }
            else {
                opt.data = serializeForm(opt.form);
            }
        }

        opt.url = prepareUrl(opt.url, opt);

        if ((opt.crossDomain || opt.transport == "script") && !opt.form) {
            transport   = new ScriptTransport(opt, deferred, self);
        }
        else if (opt.transport == "iframe") {
            transport   = new IframeTransport(opt, deferred, self);
        }
        else {
            transport   = new XHRTransport(opt, deferred, self);
        }

        self._deferred      = deferred;
        self._transport     = transport;

        deferred.done(function(value) {
            globalEvents.trigger("success", value);
        });
        deferred.fail(function(reason) {
            globalEvents.trigger("error", reason);
        });
        deferred.always(function(){
            globalEvents.trigger("end");
        });

        globalEvents.trigger("start");


        if (opt.timeout) {
            self._timeout = setTimeout(bind(self.onTimeout, self), opt.timeout);
        }

        if (opt.jsonp) {
            self.createJsonp();
        }

        if (globalEvents.trigger("beforeSend", opt, transport) === false) {
            self._promise = Promise.reject();
        }
        if (opt.beforeSend && opt.beforeSend.call(opt.callbackScope, opt, transport) === false) {
            self._promise = Promise.reject();
        }

        if (!self._promise) {
            async(transport.send, transport);

            deferred.abort = bind(self.abort, self);
            deferred.always(self.destroy, self);

            self._promise = deferred;
        }
    };

    extend(AJAX.prototype, {

        _jsonpName: null,
        _transport: null,
        _opt: null,
        _deferred: null,
        _promise: null,
        _timeout: null,
        _form: null,
        _removeForm: false,

        promise: function() {
            return this._promise;
        },

        abort: function(reason) {
            this._transport.abort();
            this._deferred.reject(reason || "abort");
        },

        onTimeout: function() {
            this.abort("timeout");
        },

        createForm: function() {

            var self    = this,
                form    = document.createElement("form");

            form.style.display = "none";
            setAttr(form, "method", self._opt.method);

            data2form(self._opt.data, form, null);

            document.body.appendChild(form);

            self._form = form;
            self._removeForm = true;
        },

        createJsonp: function() {

            var self        = this,
                opt         = self._opt,
                paramName   = opt.jsonpParam || "callback",
                cbName      = opt.jsonpCallback || "jsonp_" + nextUid();

            opt.url += (rquery.test(opt.url) ? "&" : "?") + paramName + "=" + cbName;

            self._jsonpName = cbName;

            if (typeof window != strUndef) {
                window[cbName] = bind(self.jsonpCallback, self);
            }
            if (typeof global != strUndef) {
                global[cbName] = bind(self.jsonpCallback, self);
            }

            return cbName;
        },

        jsonpCallback: function(data) {

            var self    = this,
                res;

            try {
                res = self.processResponseData(data);
            }
            catch (thrownError) {
                if (self._deferred) {
                    self._deferred.reject(thrownError);
                }
                else {
                    error(thrownError);
                }
            }

            if (self._deferred) {
                self._deferred.resolve(res);
            }
        },

        processResponseData: function(data, contentType) {

            var self    = this,
                opt     = self._opt;

            data    = processData(data, opt, contentType);

            if (globalEvents.hasListener("processResponse")) {
                data    = globalEvents.trigger("processResponse", data, self._deferred);
            }

            if (opt.processResponse) {
                data    = opt.processResponse.call(opt.callbackScope, data, self._deferred);
            }

            return data;
        },

        processResponse: function(data, contentType) {

            var self        = this,
                deferred    = self._deferred,
                result;

            if (!self._opt.jsonp) {
                try {
                    result = self.processResponseData(data, contentType)
                }
                catch (thrownError) {
                    deferred.reject(thrownError);
                }

                deferred.resolve(result);
            }
            else {
                if (!data) {
                    deferred.reject("jsonp script is empty");
                    return;
                }

                try {
                    globalEval(data);
                }
                catch (thrownError) {
                    deferred.reject(thrownError);
                }

                if (deferred.isPending()) {
                    deferred.reject("jsonp script didn't invoke callback");
                }
            }
        },

        destroy: function() {

            var self    = this;

            if (self._timeout) {
                clearTimeout(self._timeout);
            }

            if (self._form && self._form.parentNode && self._removeForm) {
                self._form.parentNode.removeChild(self._form);
            }

            self._transport.destroy();

            self._transport = null;
            self._opt = null;
            self._deferred = null;
            self._promise = null;
            self._timeout = null;
            self._form = null;

            if (self._jsonpName) {
                if (typeof window != strUndef) {
                    delete window[self._jsonpName];
                }
                if (typeof global != strUndef) {
                    delete global[self._jsonpName];
                }
            }
        }
    }, true, false);



    var ajax    = function(url, opt) {

        opt = opt || {};

        if (url && !isString(url)) {
            opt = url;
        }
        else {
            opt.url = url;
        }

        if (!opt.url) {
            if (opt.form) {
                opt.url = getAttr(opt.form, "action");
            }
            if (!opt.url) {
                throw "Must provide url";
            }
        }

        extend(opt, defaultSetup, false, true);
        extend(opt, defaults, false, true);

        if (!opt.method) {
            if (opt.form) {
                opt.method = getAttr(opt.form, "method").toUpperCase() || "GET";
            }
            else {
                opt.method = "GET";
            }
        }
        else {
            opt.method = opt.method.toUpperCase();
        }

        return (new AJAX(opt)).promise();
    };

    ajax.setup  = function(opt) {
        extend(defaultSetup, opt, true, true);
    };

    ajax.on     = function() {
        globalEvents.on.apply(globalEvents, arguments);
    };

    ajax.un     = function() {
        globalEvents.un.apply(globalEvents, arguments);
    };

    ajax.get    = function(url, opt) {
        opt = opt || {};
        opt.method = "GET";
        return ajax(url, opt);
    };

    ajax.post   = function(url, opt) {
        opt = opt || {};
        opt.method = "POST";
        return ajax(url, opt);
    };

    ajax.load   = function(el, url, opt) {

        opt = opt || {};

        if (!isString(url)) {
            opt = url;
        }

        opt.dataType = "fragment";

        return ajax(url, opt).done(function(fragment){
            if (opt.replace) {
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
            }
            el.appendChild(fragment);
        });
    };

    ajax.loadScript = function(url) {
        return ajax(url, {transport: "script"});
    };

    ajax.submit = function(form, opt) {

        opt = opt || {};
        opt.form = form;

        return ajax(null, opt);
    };









    var XHRTransport     = function(opt, deferred, ajax) {

        var self    = this,
            xhr;

        self._xhr = xhr     = createXHR();
        self._deferred      = deferred;
        self._opt           = opt;
        self._ajax          = ajax;

        if (opt.progress) {
            addListener(xhr, "progress", bind(opt.progress, opt.callbackScope));
        }
        if (opt.uploadProgress && xhr.upload) {
            addListener(xhr.upload, "progress", bind(opt.uploadProgress, opt.callbackScope));
        }

        xhr.onreadystatechange = bind(self.onReadyStateChange, self);
    };

    extend(XHRTransport.prototype, {

        _xhr: null,
        _deferred: null,
        _ajax: null,

        setHeaders: function() {

            var self = this,
                opt = self._opt,
                xhr = self._xhr,
                i;

            if (opt.xhrFields) {
                for (i in opt.xhrFields) {
                    xhr[i] = opt.xhrFields[i];
                }
            }
            if (opt.data && opt.contentType) {
                xhr.setRequestHeader("Content-Type", opt.contentType);
            }
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("Accept",
                opt.dataType && accepts[opt.dataType] ?
                accepts[opt.dataType] + ", */*; q=0.01" :
                accepts._default
            );
            for (i in opt.headers) {
                xhr.setRequestHeader(i, opt.headers[i]);
            }

        },

        onReadyStateChange: function() {

            var self        = this,
                xhr         = self._xhr,
                deferred    = self._deferred;

            if (xhr.readyState === 0) {
                xhr.onreadystatechange = emptyFn;
                deferred.resolve(xhr);
                return;
            }

            if (xhr.readyState === 4) {
                xhr.onreadystatechange = emptyFn;

                if (httpSuccess(xhr)) {

                    self._ajax.processResponse(
                        isString(xhr.responseText) ? xhr.responseText : undf,
                        xhr.getResponseHeader("content-type") || ''
                    );
                }
                else {
                    deferred.reject(xhr);
                }
            }
        },

        abort: function() {
            var self    = this;
            self._xhr.onreadystatechange = emptyFn;
            self._xhr.abort();
        },

        send: function() {

            var self    = this,
                opt     = self._opt;

            try {
                self._xhr.open(opt.method, opt.url, true, opt.username, opt.password);
                self.setHeaders();
                self._xhr.send(opt.data);
            }
            catch (thrownError) {
                self._deferred.reject(thrownError);
            }
        },

        destroy: function() {
            var self    = this;

            self._xhr = null;
            self._deferred = null;
            self._opt = null;
            self._ajax = null;

        }

    }, true, false);



    var ScriptTransport  = function(opt, deferred, ajax) {


        var self        = this;

        self._opt       = opt;
        self._ajax      = ajax;
        self._deferred  = deferred;

    };

    extend(ScriptTransport.prototype, {

        _opt: null,
        _deferred: null,
        _ajax: null,
        _el: null,

        send: function() {

            var self    = this,
                script  = document.createElement("script");

            setAttr(script, "async", "async");
            setAttr(script, "charset", "utf-8");
            setAttr(script, "src", self._opt.url);

            addListener(script, "load", bind(self.onLoad, self));
            addListener(script, "error", bind(self.onError, self));

            document.head.appendChild(script);

            self._el = script;
        },

        onLoad: function(evt) {
            if (this._deferred) { // haven't been destroyed yet
                this._deferred.resolve(evt);
            }
        },

        onError: function(evt) {
            this._deferred.reject(evt);
        },

        abort: function() {
            var self    = this;

            if (self._el.parentNode) {
                self._el.parentNode.removeChild(self._el);
            }
        },

        destroy: function() {

            var self    = this;

            if (self._el.parentNode) {
                self._el.parentNode.removeChild(self._el);
            }

            self._el = null;
            self._opt = null;
            self._ajax = null;
            self._deferred = null;

        }

    }, true, false);



    var IframeTransport = function(opt, deferred, ajax) {
        var self        = this;

        self._opt       = opt;
        self._ajax      = ajax;
        self._deferred  = deferred;
    };

    extend(IframeTransport.prototype, {

        _opt: null,
        _deferred: null,
        _ajax: null,
        _el: null,

        send: function() {

            var self    = this,
                frame   = document.createElement("iframe"),
                id      = "frame-" + nextUid(),
                form    = self._opt.form;

            setAttr(frame, "id", id);
            setAttr(frame, "name", id);
            frame.style.display = "none";
            document.body.appendChild(frame);

            setAttr(form, "action", self._opt.url);
            setAttr(form, "target", id);

            addListener(frame, "load", bind(self.onLoad, self));
            addListener(frame, "error", bind(self.onError, self));

            self._el = frame;

            try {
                form.submit();
            }
            catch (thrownError) {
                self._deferred.reject(thrownError);
            }
        },

        onLoad: function() {

            var self    = this,
                frame   = self._el,
                doc,
                data;

            if (self._opt && !self._opt.jsonp) {
                doc		= frame.contentDocument || frame.contentWindow.document;
                data    = doc.body.innerHTML;
                self._ajax.processResponse(data);
            }
        },

        onError: function(evt) {
            this._deferred.reject(evt);
        },

        abort: function() {
            var self    = this;

            if (self._el.parentNode) {
                self._el.parentNode.removeChild(self._el);
            }
        },

        destroy: function() {
            var self    = this;

            if (self._el.parentNode) {
                self._el.parentNode.removeChild(self._el);
            }

            self._el = null;
            self._opt = null;
            self._ajax = null;
            self._deferred = null;

        }

    }, true, false);

    return ajax;
}();










var Template = function(){

    var observable      = new Observable,

        cache           = new Cache,

        getTemplate     = function(tplId) {

            var tpl = cache.get(tplId);

            if (typeof tpl == "string") {
                tpl = toFragment(tpl);
                cache.add(tplId, tpl);
            }

            return tpl;
        },

        findTemplate = function(tplId) {

            var tplNode     = document.getElementById(tplId),
                tag;

            if (tplNode) {

                tag         = tplNode.tagName.toLowerCase();

                if (tag == "script") {
                    var div = document.createElement("div");
                    div.innerHTML = tplNode.innerHTML;
                    return toFragment(div.childNodes);
                }
                else {
                    if ("content" in tplNode) {
                        return tplNode.content;
                    }
                    else {
                        return toFragment(tplNode.childNodes);
                    }
                }
            }
        },

        loadTemplate = function(tplUrl) {
            if (!cache.exists(tplUrl)) {
                return cache.add(tplUrl,
                    ajax(tplUrl, {dataType: 'fragment'})
                        .then(function(fragment){
                            return cache.add(tplUrl, fragment);
                        })
                );
            }
            return cache.get(tplUrl);
        },

        isExpression = function(str) {
            if (str.substr(0,1) == '.') {
                var second = str.substr(1,1);
                return !(second == '.' || second == '/');
            }
            return false;
        };

    cache.addFinder(findTemplate);

    return defineClass({

        $class:             "Template",

        _watcher:           null,
        _tpl:               null,
        _renderer:          null,
        _initial:           true,
        _fragment:          null,
        _id:                null,
        _originalNode:      null,
        _intendedShadow:    false,

        scope:              null,
        node:               null,
        tpl:                null,
        url:                null,
        ownRenderer:        false,
        initPromise:        null,
        tplPromise:         null,
        parentRenderer:     null,
        deferRendering:     false,
        replace:            false,
        shadow:             false,

        $init: function(cfg) {

            var self    = this;

            extend(self, cfg, true, false);

            var shadowRootSupported = !!document.documentElement.createShadowRoot;

            if (!shadowRootSupported) {
                self._intendedShadow = self.shadow;
                self.shadow = false;
            }

            self.id     = nextUid();

            self.tpl && (self.tpl = trim(self.tpl));
            self.url && (self.url = trim(self.url));

            var node    = self.node,
                tpl     = self.tpl || self.url;

            node && removeAttr(node, "mjs-include");

            if (self.shadow) {
                self._originalNode = node;
                self.node = node = node.createShadowRoot();
            }

            if (!node) {
                self.deferRendering = true;
            }

            if (tpl) {

                if (node && node.firstChild && !self.shadow) {
                    data(node, "mjs-transclude", toFragment(node.childNodes));
                }

                if (isExpression(tpl)) {
                    self._watcher = createWatchable(self.scope, tpl, self.onChange, self, null, ns);
                }

                if (self._watcher && !self.replace) {
                    self.ownRenderer        = true;
                }
                else if (self.shadow) {
                    self.ownRenderer        = true;
                }
                else if (self.replace) {
                    self.ownRenderer        = false;
                }

                 self.resolveTemplate();

                if (self._watcher && self.replace) {
                    self._watcher.unsubscribeAndDestroy(self.onChange, self);
                    self._watcher = null;
                }

                if (!self.deferRendering || !self.ownRenderer) {
                    self.tplPromise.done(self.applyTemplate, self);
                }
                if (self.ownRenderer && self.parentRenderer) {
                    self.parentRenderer.on("destroy", self.onParentRendererDestroy, self);
                }
            }
            else {
                if (!self.deferRendering && self.ownRenderer) {
                    self.doRender();
                }
            }

            if (self.scope instanceof Scope) {
                self.scope.$on("destroy", self.onScopeDestroy, self);
            }
        },


        doRender: function() {
            var self = this;
            if (!self._renderer) {
                self._renderer   = new Renderer(self.node, self.scope);
                self._renderer.on("rendered", self.onRendered, self);
                self._renderer.process();
            }
        },

        onRendered: function() {
            observable.trigger("rendered-" + this.id, this);
        },

        on: function(event, fn, context) {
            return observable.on(event + "-" + this.id, fn, context);
        },

        un: function(event, fn, context) {
            return observable.un(event + "-" + this.id, fn, context);
        },

        startRendering: function() {

            var self    = this,
                tpl     = self.tpl || self.url;

            if (self.deferRendering && self.node) {

                self.deferRendering = false;
                if (self.tplPromise) {
                    self.tplPromise.done(tpl ? self.applyTemplate : self.doRender, self);
                    return self.initPromise;
                }
                else {
                    tpl ? self.applyTemplate() : self.doRender();
                }
            }

            return null;
        },

        resolveTemplate: function() {

            var self    = this,
                url     = self.url,
                tpl     = self._watcher ?
                          self._watcher.getLastResult() :
                          (self.tpl || url);

            self.initPromise    = new Promise;
            self.tplPromise     = new Promise;

            if (self.ownRenderer) {
                self.initPromise.resolve(false);
            }

            new Promise(function(resolve){
                if (url) {
                    resolve(getTemplate(tpl) || loadTemplate(url));
                }
                else {
                    resolve(getTemplate(tpl) || toFragment(tpl));
                }
            })
                .done(function(fragment){
                    self._fragment = fragment;
                    self.tplPromise.resolve();
                    //!self.ownRenderer ? self.node : false
                })
                .fail(self.initPromise.reject, self.initPromise)
                .fail(self.tplPromise.reject, self.tplPromise);


        },

        onChange: function() {

            var self    = this;

            if (self._renderer) {
                self._renderer.$destroy();
                self._renderer = null;
            }

            self.resolveTemplate()
                .done(self.applyTemplate, self);
        },

        doApplyTemplate: function() {

            var self    = this,
                el      = self.node;

            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }

            if (self._intendedShadow) {
                self.makeTranscludes();
            }

            if (self.replace) {

                var frg = clone(self._fragment),
                    transclude = data(el, "mjs-transclude"),
                    children = slice.call(frg.childNodes);

                if (transclude) {
                    var tr = select("[mjs-transclude], mjs-transclude", frg);
                    if (tr.length) {
                        data(tr[0], "mjs-transclude", transclude);
                    }
                }

                el.parentNode.replaceChild(frg, el);

                self.node = children;
                self.initPromise.resolve(children);
            }
            else {
                el.appendChild(clone(self._fragment));
                self.initPromise.resolve(self.node);
            }

            if (self.ownRenderer) {
                self.doRender();
            }
        },

        applyTemplate: function() {

            var self        = this,
                el          = self.node,
                deferred    = new Promise;

            if (!self._initial) {
                animate(el, "leave", null, true)
                    .done(self.doApplyTemplate, self)
                    .done(deferred.resolve, deferred);
                animate(el, "enter", null, true);
            }
            else {
                self.doApplyTemplate();
                deferred.resolve();
            }

            self._initial = false;

            return deferred;
        },

        makeTranscludes: function() {

            var self    = this,
                fr      = self._fragment,
                cnts    = select("content", fr),
                el, next,
                tr, sel,
                i, l;

            for (i = 0, l = cnts.length; i < l;  i++) {

                tr      = document.createElement("mjs-transclude");
                el      = cnts[i];
                next    = el.nextSibling;
                sel     = getAttr(el, "select");

                sel && setAttr(tr, "select", sel);

                fr.removeChild(el);
                fr.insertBefore(tr, next);
            }
        },

        onParentRendererDestroy: function() {
            this._renderer.$destroy();
            this.$destroy();
        },

        onScopeDestroy: function() {
            this.$destroy();
        },

        destroy: function() {

            var self = this;

            if (self.shadow) {
                self._originalNode.createShadowRoot();
            }

            if (self._watcher) {
                self._watcher.unsubscribeAndDestroy(self.onChange, self);
            }
        }

    }, {
        cache: cache
    });
}();







/**
 * @namespace MetaphorJs
 * @class Component
 */
var Component = defineClass({

    $class: "MetaphorJs.Component",
    $mixins: [ObservableMixin],

    /**
     * @access protected
     * @var string
     */
    id:             null,

    originalId:     false,

    /**
     * @var Element
     * @access protected
     */
    node:           null,

    /**
     * @var string|Element
     * @access protected
     */
    renderTo:       null,

    /**
     * @var {boolean}
     */
    autoRender:     true,

    /**
     * @var bool
     * @access protected
     */
    rendered:       false,

    /**
     * @var bool
     * @access protected
     */
    hidden:         false,

    /**
     * @var bool
     * @access protected
     */
    destroyEl:      true,

    destroyScope:   false,

    /**
     * @var {MetaphorJs.view.Scope}
     */
    scope:          null,

    /**
     * @var {MetaphorJs.view.Template}
     */
    template:       null,

    templateUrl:    null,

    /**
     * @var string
     */
    tag:            null,


    /**
     * @constructor
     * @param {object} cfg {
     *      @type string id Element id
     *      @type string|Element el
     *      @type string|Element renderTo
     *      @type bool hidden
     *      @type bool destroyEl
     * }
     */
    $init: function(cfg) {

        var self    = this;

        self.$super(cfg);

        extend(self, cfg, true, false);

        if (!self.scope) {
            self.scope = new Scope;
        }

        if (cfg.as) {
            self.scope[cfg.as] = self;
        }

        if (self.node) {
            self.id = getAttr(self.node, "id");
            if (self.id) {
                self.originalId = true;
            }
        }

        self.id = self.id || "cmp-" + nextUid();

        if (!self.node) {
            self._createNode();
        }

        self.initComponent.apply(self, arguments);

        if (self.scope.$app){
            self.scope.$app.registerCmp(self, self.scope, "id");
        }

        var tpl = self.template,
            url = self.templateUrl;

        if (!tpl || !(tpl instanceof Template)) {
            self.template = tpl = new Template({
                scope: self.scope,
                node: self.node,
                deferRendering: !tpl,
                ownRenderer: true,
                tpl: tpl,
                url: url,
                shadow: self.constructor.$shadow
            });
        }
        else if (tpl instanceof Template) {
            // it may have just been created
            self.template.node = self.node;
        }

        if (self.parentRenderer) {
            self.parentRenderer.on("destroy", self.onParentRendererDestroy, self);
        }

        self._initElement();

        if (self.autoRender) {

            if (tpl.initPromise) {
                tpl.initPromise.done(self.render, self);
            }
            else {
                self.render();
            }
        }
    },

    _createNode: function() {

        var self    = this;
        self.node   = document.createElement(self.tag || 'div');
    },

    _initElement: function() {

        var self    = this,
            node    = self.node;

        setAttr(node, "id", self.id);
        setAttr(node, "cmp-id", self.id);

        if (self.hidden) {
            node.style.display = "none";
        }
    },

    render: function() {

        var self        = this;

        if (self.rendered) {
            return;
        }

        self.trigger('render', self);

        self.template.on("rendered", self.onRenderingFinished, self);
        self.template.startRendering();
    },

    onRenderingFinished: function() {
        var self = this;

        if (self.renderTo) {
            self.renderTo.appendChild(self.node);
        }
        else if (!isAttached(self.node)) {
            document.body.appendChild(self.node);
        }

        self.rendered   = true;
        self.afterRender();
        self.trigger('afterrender', self);
    },


    /**
     * @access public
     * @method
     */
    show: function() {
        var self    = this;
        if (!self.hidden) {
            return;
        }
        if (self.trigger('beforeshow', self) === false) {
            return false;
        }

        self.node.style.display = "block";

        self.hidden = false;
        self.onShow();
        self.trigger("show", self);
    },

    /**
     * @access public
     * @method
     */
    hide: function() {
        var self    = this;
        if (self.hidden) {
            return;
        }
        if (self.trigger('beforehide', self) === false) {
            return false;
        }

        self.node.style.display = "none";

        self.hidden = true;
        self.onHide();
        self.trigger("hide", self);
    },

    /**
     * @access public
     * @return bool
     */
    isHidden: function() {
        return this.hidden;
    },

    /**
     * @access public
     * @return bool
     */
    isRendered: function() {
        return this.rendered;
    },

    /**
     * @access public
     * @return bool
     */
    isDestroyed: function() {
        return this.destroyed;
    },

    /**
     * @access public
     * @return Element
     */
    getEl: function() {
        return this.node;
    },

    /**
     * @method
     * @access protected
     */
    initComponent:  emptyFn,

    /**
     * @method
     * @access protected
     */
    afterRender:    emptyFn,

    /**
     * @method
     * @access protected
     */
    onShow:         emptyFn,

    /**
     * @method
     * @access protected
     */
    onHide:         emptyFn,

    onParentRendererDestroy: function() {
        this.$destroy();
    },

    destroy:      function() {

        var self    = this;

        if (self.template) {
            self.template.$destroy();
        }

        if (self.destroyEl) {
            if (isAttached(self.node)) {
                self.node.parentNode.removeChild(self.node);
            }
        }
        else {
            removeAttr(self.node, "cmp-id");
            if (!self.originalId) {
                removeAttr(self.node, "id");
            }
        }

        if (self.destroyScope && self.scope) {
            self.scope.$destroy();
        }

        self.$super();
    }

});

/**
 * @md-end-class
 */





function isNumber(value) {
    return varType(value) === 1;
};





var Queue = function(cfg) {

    var self = this;

    cfg = cfg || {};

    self._queue = [];
    self._map = {};
    self.id = "$$" + nextUid();

    for (var i in cfg) {
        self[i] = cfg[i];
    }
};


Queue.REPLACE = 1;
Queue.ONCE = 2;
Queue.MULTIPLE = 3;
Queue.ONCE_EVER = 3;


extend(Queue.prototype, {

    _queue: null,
    _map: null,
    _nextRequested: false,
    _running: false,

    length: 0,
    id: null,
    async: true,
    auto: true,
    thenable: false,
    stack: false,
    context: null,
    mode: Queue.MULTIPLE,

    add: function(fn, context, args, mode, prepend, async) {

        var self    = this,
            qid     = self.id,
            id      = fn[qid] || nextUid(),
            item    = {
                id: id,
                fn: fn,
                context: context,
                args: args,
                async: async
            };

        mode = mode || self.mode;

        if (mode == Queue.ONCE_EVER && fn[qid]) {
            return fn[qid];
        }

        fn[qid] = id;

        if (self._map[id]) {
            if (mode == Queue.REPLACE) {
                self.remove(id);
            }
            else if (mode == Queue.ONCE) {
                return id;
            }
        }

        self._queue[prepend ? "unshift" : "push"](item);
        self._map[id] = item;

        self.length = self._queue.length;

        if (self.auto) {
            self.next();
        }

        return id;
    },

    append: function(fn, context, args, mode, async) {
        return this.add(fn, context, args, mode, false, async);
    },

    prepend: function(fn, context, args, mode, async) {
        return this.add(fn, context, args, mode, true, async);
    },

    remove: function(id) {
        var self = this,
            queue = self._queue,
            i, l;

        for (i = 0, l = queue.length; i < l; i++) {
            if (queue[i].id == id) {
                queue.splice(i, 1);
                break;
            }
        }
        delete self._map[id];
    },

    next: function() {

        var self    = this,
            item;

        if (self._running) {
            self._nextRequested = true;
            return;
        }

        self._nextRequested = false;

        item = self._queue[self.stack ? "pop" : "shift"]();
        self.length = self._queue.length;

        if (!item) {
            return;
        }

        self._running = true;

        delete self._map[item.id];

        if (!self.async && !item.async) {
            try {
                self._processResult(item.fn.apply(item.context || self.context, item.args || []));
            }
            catch (thrown) {
                error(thrown);
                self._finish();
                throw thrown;
            }
        }
        else {
            var timeout = 0;
            if (isNumber(item.async)) {
                timeout = item.async;
            }
            else if (isNumber(self.async)) {
                timeout = self.async;
            }
            async(function(){
                try {
                    self._processResult(item.fn.apply(item.context || self.context, item.args || []));
                }
                catch (thrown) {
                    error(thrown);
                    self._finish();
                    throw thrown;
                }
            }, null, null, timeout);
        }
    },

    _processResult: function(res) {
        var self = this;
        if (self.thenable && isThenable(res)) {
            res.then(function(){self._finish()}, function(){self._finish()});
        }
        else {
            self._finish();
        }
        return res;
    },

    _finish: function() {
        var self = this;
        self._running = false;
        if (self.auto || self._nextRequested) {
            self.next();
        }
    },

    destroy: function() {

        var self = this;

        self._queue = null;
        self._map = null;
        self.context = null;
        self._nextRequested = false;
        self._running = false;
        self.next = emptyFn;

    }
}, true, false);




var rToCamelCase = /-./g;

function toCamelCase(str) {
    return str.replace(rToCamelCase, function(match){
        return match.charAt(1).toUpperCase();
    });
};



var getNodeData = function() {

    var readDataSet = function(node) {
        var attrs = node.attributes,
            dataset = {},
            i, l, name;

        for (i = 0, l = attrs.length; i < l; i++) {
            name = attrs[i].name;
            if (name.indexOf("data-") === 0) {
                dataset[toCamelCase(name.substr(5))] = attrs[i].value;
            }
        }

        return dataset;
    };


    return function(node) {

        if (node.dataset) {
            return node.dataset;
        }

        var dataset;

        if ((dataset = data(node, "data")) !== undf) {
            return dataset;
        }

        dataset = readDataSet(node);
        data(node, "data", dataset);
        return dataset;
    };


}();



function getNodeConfig(node, scope, expr) {

    var cfg = data(node, "config"),
        config, dataset, i, val;

    if (cfg) {
        return cfg;
    }

    cfg = {};

    if (expr || (expr = getAttr(node, "mjs-config")) !== null) {
        removeAttr(node, "mjs-config");
        config = expr ? createGetter(expr)(scope || {}) : {};
        for (i in config){
            cfg[i] = config[i];
        }
    }

    dataset = getNodeData(node);

    for (i in dataset){
        val = dataset[i];
        cfg[i] = val === "" ? true : val;
    }

    data(node, "config", cfg);

    return cfg;
};


var ListRenderer = defineClass({

    $class: "ListRenderer",

    id: null,

    model: null,
    itemName: null,
    tpl: null,
    renderers: null,
    parentEl: null,
    prevEl: null,
    nextEl: null,
    trackBy: null,
    trackByWatcher: null,
    animateMove: false,
    animate: false,
    trackByFn: null,
    griDelegate: null,

    queue: null,

    buffered: false,
    bufferPlugin: null,

    $constructor: function(scope, node, expr) {

        var self    = this,
            cfg     = getNodeConfig(node, scope);

        self.animateMove    = !cfg.buffered && cfg.animateMove && animate.cssAnimations;
        self.animate        = !cfg.buffered && (getAttr(node, "mjs-animate") !== null || cfg.animate);
        self.id             = cfg.id || nextUid();

        removeAttr(node, "mjs-animate");

        if (self.animate && self.animateMove) {
            self.$plugins.push("ListAnimatedMove");
        }
        if (cfg.observable) {
            self.$plugins.push("Observable");
        }

        if (cfg.buffered) {
            self.buffered = true;
            self.$plugins.push("ListBuffered");
        }
    },

    $init: function(scope, node, expr) {

        var self = this;

        removeAttr(node, "mjs-include");

        self.parseExpr(expr);

        self.tpl        = node;
        self.renderers  = [];
        self.prevEl     = node.previousSibling;
        self.nextEl     = node.nextSibling;
        self.parentEl   = node.parentNode;
        self.node       = node;
        self.scope      = scope;

        self.queue      = new Queue({
            async: false, auto: true, thenable: true,
            stack: false, context: self, mode: Queue.ONCE
        });

        self.parentEl.removeChild(node);

        self.afterInit(scope, node);

        self.queue.add(self.render, self, [toArray(self.watcher.getLastResult())]);
    },

    afterInit: function(scope, node) {

        var self        = this,
            cfg         = getNodeConfig(node, scope);

        self.watcher    = createWatchable(scope, self.model, self.onChange, self, null, ns);
        self.trackBy    = cfg.trackBy;
        if (self.trackBy && self.trackBy != '$') {
            self.trackByWatcher = createWatchable(scope, self.trackBy, self.onChangeTrackBy, self, null, ns);
        }
        else if (self.trackBy != '$' && !self.watcher.hasInputPipes()) {
            self.trackBy    = '$$'+self.watcher.id;
        }

        self.griDelegate = bind(self.scopeGetRawIndex, self);
    },

    trigger: emptyFn,

    /*
     * <!-- render and re-render
     */

    render: function(list) {

        var self        = this,
            renderers   = self.renderers,
            tpl         = self.tpl,
            parent      = self.parentEl,
            next        = self.nextEl,
            buffered    = self.buffered,
            fragment    = document.createDocumentFragment(),
            el,
            i, len;

        for (i = 0, len = list.length; i < len; i++) {
            el = tpl.cloneNode(true);
            renderers.push(self.createItem(el, list, i));
            if (!buffered) {
                fragment.appendChild(el);
                renderers[i].attached = true;
            }
        }

        if (!buffered) {
            parent.insertBefore(fragment, next);
            self.doUpdate();

        }
        else {
            self.bufferPlugin.getScrollOffset();
            self.bufferPlugin.updateScrollBuffer();
        }

        self.trigger("render", self);
    },

    doUpdate: function(start, end, action, renderOnly) {

        var self        = this,
            renderers   = self.renderers,
            index       = start || 0,
            cnt         = renderers.length,
            x           = end || cnt - 1,
            list        = self.watcher.getLastResult(),
            trackByFn   = self.getTrackByFunction();

        if (x > cnt - 1) {
            x = cnt - 1;
        }

        for (; index <= x; index++) {

            if (action && renderers[index].action != action) {
                continue;
            }

            self.renderItem(index, renderers, list, trackByFn, renderOnly);
        }
    },

    renderItem: function(index, rs, list, trackByFn, renderOnly) {

        var self = this;

        list = list || self.watcher.getLastResult();
        rs = rs || self.renderers;
        trackByFn = trackByFn || self.getTrackByFunction();

        var item        = rs[index],
            scope       = item.scope,
            last        = rs.length - 1,
            even        = !(index % 2);

        if (renderOnly && item.rendered) {
            return;
        }

        scope.$index    = index;
        scope.$first    = index === 0;
        scope.$last     = index === last;
        scope.$even     = even;
        scope.$odd      = !even;
        scope.$trackId  = trackByFn(list[index]);
        scope.$getRawIndex = self.griDelegate;

        if (!item.renderer) {

            item.renderer  = new Renderer(item.el, scope);
            item.renderer.process();
            item.rendered = true;
        }
        else {
            scope.$check();
        }
    },


    createItem: function(el, list, index) {

        var self        = this,
            iname       = self.itemName,
            itemScope   = self.scope.$new();

        itemScope[iname]    = self.getListItem(list, index);

        return {
            index: index,
            action: "enter",
            el: el,
            scope: itemScope,
            attached: false,
            rendered: false
        };
    },

    /*
     * render and re-render -->
     */

    /*
     * <!-- reflect changes
     */

    onChange: function(current, prev) {
        var self = this;
        self.queue.prepend(self.applyChanges, self, [prev], Queue.REPLACE);
    },

    applyChanges: function(prevList) {

        var self        = this,
            renderers   = self.renderers,
            tpl         = self.tpl,
            index       = 0,
            list        = toArray(self.watcher.getLastResult()),
            updateStart = null,
            animateMove = self.animateMove,
            animateAll  = self.animate,
            newrs       = [],
            iname       = self.itemName,
            origrs      = renderers.slice(),
            doesMove    = false,
            prevr,
            prevrInx,
            i, len,
            r,
            action,
            translates,
            prs         = self.watcher.getMovePrescription(prevList, self.getTrackByFunction(), list);


        // redefine renderers
        for (i = 0, len = prs.length; i < len; i++) {

            action = prs[i];

            if (isNumber(action)) {
                prevrInx    = action;
                prevr       = renderers[prevrInx];

                if (prevrInx != index && isNull(updateStart)) {
                    updateStart = i;
                }

                prevr.action = "move";
                prevr.scope[iname] = self.getListItem(list, i);
                doesMove = animateMove;

                newrs.push(prevr);
                renderers[prevrInx] = null;
                index++;
            }
            else {
                if (isNull(updateStart)) {
                    updateStart = i;
                }
                r = self.createItem(tpl.cloneNode(true), list, i);
                newrs.push(r);
                // add new elements to old renderers
                // so that we could correctly determine positions
            }
        }

        self.renderers  = newrs;


        if (animateAll) {

            self.doUpdate(updateStart, null, "enter");

            if (doesMove) {
                translates = self.calculateTranslates(newrs, origrs, renderers);
            }

            var animPromises    = [],
                startAnimation  = new Promise,
                applyFrom       = new Promise,
                donePromise     = new Promise,
                animReady       = Promise.counter(newrs.length),
                startCallback   = function(){
                    animReady.countdown();
                    return startAnimation;
                };

            // destroy old renderers and remove old elements
            for (i = 0, len = renderers.length; i < len; i++) {
                r = renderers[i];
                if (r) {
                    r.scope.$destroy();

                    stopAnimation(r.el);
                    animPromises.push(animate(r.el, "leave", null, false, ns)
                        .done(function(el){
                            el.style.visibility = "hidden";
                        }));
                }
            }

            for (i = 0, len = newrs.length; i < len; i++) {
                r = newrs[i];
                stopAnimation(r.el);

                r.action == "enter" ?
                animPromises.push(animate(r.el, "enter", startCallback, false, ns)) :
                animPromises.push(
                    self.moveAnimation(
                        r.el,
                        doesMove ? translates[i][0] : null,
                        doesMove ? translates[i][1] : null,
                        startCallback,
                        applyFrom
                    )
                );
            }

            animReady.done(function(){
                raf(function(){
                    applyFrom.resolve();
                    self.applyDomPositions(renderers);
                    if (!doesMove) {
                        self.doUpdate(updateStart, null, "move");
                    }
                    raf(function(){
                        startAnimation.resolve();
                    });
                    self.trigger("change", self);
                });
            });

            Promise.all(animPromises).always(function(){
                raf(function(){
                    self.doUpdate(updateStart || 0);
                    self.removeOldElements(renderers);
                    if (doesMove) {
                        self.doUpdate(updateStart, null, "move");
                        for (i = 0, len = newrs.length; i < len; i++) {
                            r = newrs[i];
                            r.el.style[animate.prefixes.transform] = null;
                            r.el.style[animate.prefixes.transform] = "";
                        }
                    }
                    donePromise.resolve();
                });
            });

            return donePromise;
        }
        else {
            if (!self.buffered) {
                self.applyDomPositions();
                self.doUpdate(updateStart || 0);
                self.removeOldElements(renderers);
            }
            else {
                self.bufferPlugin.getScrollOffset();
                self.removeOldElements(renderers);
                self.queue.append(self.bufferPlugin.updateScrollBuffer, self.bufferPlugin, [true]);
            }
            self.trigger("change", self);
        }
    },


    removeOldElements: function(rs) {
        var i, len, r,
            parent = this.parentEl;

        for (i = 0, len = rs.length; i < len; i++) {
            r = rs[i];
            if (r && r.attached) {
                r.attached = false;
                parent.removeChild(r.el);
            }
        }
    },


    applyDomPositions: function(oldrs) {

        var self        = this,
            rs          = self.renderers,
            parent      = self.parentEl,
            prevEl      = self.prevEl,
            fc          = prevEl ? prevEl.nextSibling : parent.firstChild,
            next,
            i, l, el, r;

        for (i = 0, l = rs.length; i < l; i++) {
            r = rs[i];
            el = r.el;

            if (oldrs && oldrs[i]) {
                next = oldrs[i].el.nextSibling;
            }
            else {
                next = i > 0 ? (rs[i-1].el.nextSibling || fc) : fc;
            }

            if (next && el.nextSibling !== next) {
                parent.insertBefore(el, next);
            }
            else if (!next) {
                parent.appendChild(el);
            }
            r.attached = true;

        }
    },

    /*
     * reflect changes -->
     */


    /*
     * <!-- configurable item functions
     */


    getListItem: function(list, index) {
        return list[index];
    },

    onChangeTrackBy: function(val) {
        this.trackByFn = null;
        this.trackBy = val;
    },

    getTrackByFunction: function() {

        var self = this,
            trackBy;

        if (!self.trackByFn) {

            trackBy = self.trackBy;

            if (!trackBy || trackBy == '$') {
                self.trackByFn = function(item) {
                    return isPrimitive(item) ? item : undf;
                };
            }
            else if (isFunction(trackBy)) {
                self.trackByFn = trackBy;
            }
            else {
                self.trackByFn = function(item){
                    return item && !isPrimitive(item) ? item[trackBy] : undf;
                };
            }
        }

        return self.trackByFn;
    },


    scopeGetRawIndex: function(id) {

        if (id === undf) {
            return -1;
        }

        var self        = this,
            list        = self.watcher.getUnfilteredValue(),
            trackByFn   = self.getTrackByFunction(),
            i, l;

        for (i = 0, l = list.length; i < l; i++) {
            if (trackByFn(list[i]) === id) {
                return i;
            }
        }

        return -1;
    },

    /*
     * configurable item functions -->
     */


    /*
     * <!-- move animation - plugin.ListAnimatedMove
     */

    getNodePositions: function(tmp, rs, oldrs) {
        return {};
    },

    calculateTranslates: function(newRenderers, origRenderers, withDeletes) {
        return [];
    },

    moveAnimation: function(el, to, from, startCallback, applyFrom) {
        return animate(el, "move", startCallback, false, ns);
    },

    /*
     * move animation -->
     */


    /*
     * <!-- buffered list
     */


    scrollTo: function() {
        // not implemented
    },


    /*
     * buffered list -->
     */


    parseExpr: function(expr) {

        var tmp = expr.split(" "),
            i, len,
            model, name,
            row;

        for (i = 0, len = tmp.length; i < len; i++) {

            row = tmp[i];

            if (row == "" || row == "in") {
                continue;
            }

            if (!name) {
                name = row;
            }
            else {
                model = tmp.slice(i).join(" ");
                break;
            }
        }

        this.model = model;
        this.itemName = name || "item";
    },


    destroy: function() {

        var self        = this,
            renderers   = self.renderers,
            i, len;

        for (i = 0, len = renderers.length; i < len; i++) {
            renderers[i].renderer.$destroy();
        }

        if (self.trackByWatcher) {
            self.trackByWatcher.unsubscribeAndDestroy();
        }

        self.queue.destroy();
        self.watcher.unsubscribeAndDestroy(self.onChange, self);
    }

}, {
    $stopRenderer: true,
    $registerBy: "id"
});





function resolveComponent(cmp, cfg, scope, node, args) {

    var hasCfg  = cfg !== false;

    cfg         = cfg || {};
    args        = args || [];

    scope       = scope || cfg.scope; // || new Scope;
    node        = node || cfg.node;

    cfg.scope   = cfg.scope || scope;
    cfg.node    = cfg.node || node;

    var constr      = isString(cmp) ? nsGet(cmp) : cmp;

    if (!constr) {
        throw "Component " + cmp + " not found";
    }

    if (scope && constr.$isolateScope) {
        cfg.scope   = scope = scope.$newIsolated();
    }

    var i,
        defers      = [],
        tpl         = constr.template || cfg.template || null,
        tplUrl      = constr.templateUrl || cfg.templateUrl || null,
        app         = scope ? scope.$app : null,
        gProvider   = Provider.global(),
        injectFn    = app ? app.inject : gProvider.inject,
        injectCt    = app ? app : gProvider,
        cloak       = node ? getAttr(node, "mjs-cloak") : null,
        inject      = {
            $node: node || null,
            $scope: scope || null,
            $config: cfg || null,
            $args: args || null
        };

    if (constr.resolve) {

        for (i in constr.resolve) {
            (function(name){
                var d = new Promise,
                    fn;

                defers.push(d.done(function(value){
                    inject[name] = value;
                    cfg[name] = value;
                    args.push(value);
                }));

                fn = constr.resolve[i];

                if (isFunction(fn)) {
                    d.resolve(fn(scope, node));
                }
                else if (isString(fn)) {
                    d.resolve(injectFn.resolve(fn));
                }
                else {
                    d.resolve(
                        injectFn.call(
                            injectCt, fn, null, extend({}, inject, cfg, false, false)
                        )
                    );
                }

            }(i));
        }
    }

    if (hasCfg && (tpl || tplUrl)) {

        cfg.template = new Template({
            scope: scope,
            node: node,
            deferRendering: true,
            ownRenderer: true,
            shadow: constr.$shadow,
            tpl: tpl,
            url: tplUrl
        });

        defers.push(cfg.template.initPromise);

        if (node && node.firstChild) {
            data(node, "mjs-transclude", toFragment(node.childNodes));
        }
    }

    hasCfg && args.unshift(cfg);

    var p;

    if (defers.length) {
        p = new Promise;

        Promise.all(defers).done(function(){
            p.resolve(
                injectFn.call(
                    injectCt, constr, null, extend({}, inject, cfg, false, false), args
                )
            );
        });
    }
    else {
        p = Promise.resolve(
            injectFn.call(
                injectCt, constr, null, extend({}, inject, cfg, false, false), args
            )
        );
    }

    if (node && p.isPending() && cloak !== null) {
        cloak ? addClass(node, cloak) : node.style.visibility = "hidden";
        p.then(function() {
            cloak ? removeClass(node, cloak) : node.style.visibility = "";
        });
    }

    if (node) {
        p.then(function(){
            removeClass(node, "mjs-cloak");
        });
    }

    return p;
};




function returnTrue() {
    return true;
};



// from jQuery

var DomEvent = function(src) {

    if (src instanceof DomEvent) {
        return src;
    }

    // Allow instantiation without the 'new' keyword
    if (!(this instanceof DomEvent)) {
        return new DomEvent(src);
    }


    var self    = this;

    for (var i in src) {
        if (!self[i]) {
            try {
                self[i] = src[i];
            }
            catch (thrownError){}
        }
    }


    // Event object
    self.originalEvent = src;
    self.type = src.type;

    if (!self.target && src.srcElement) {
        self.target = src.srcElement;
    }


    var eventDoc, doc, body,
        button = src.button;

    // Calculate pageX/Y if missing and clientX/Y available
    if (self.pageX === undf && !isNull(src.clientX)) {
        eventDoc = self.target ? self.target.ownerDocument || document : document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        self.pageX = src.clientX +
                      ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
                      ( doc && doc.clientLeft || body && body.clientLeft || 0 );
        self.pageY = src.clientY +
                      ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
                      ( doc && doc.clientTop  || body && body.clientTop  || 0 );
    }

    // Add which for click: 1 === left; 2 === middle; 3 === right
    // Note: button is not normalized, so don't use it
    if ( !self.which && button !== undf ) {
        self.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
    }

    // Events bubbling up the document may have been marked as prevented
    // by a handler lower down the tree; reflect the correct value.
    self.isDefaultPrevented = src.defaultPrevented ||
                              src.defaultPrevented === undf &&
                                  // Support: Android<4.0
                              src.returnValue === false ?
                              returnTrue :
                              returnFalse;


    // Create a timestamp if incoming event doesn't have one
    self.timeStamp = src && src.timeStamp || (new Date).getTime();
};

// Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
extend(DomEvent.prototype, {

    isDefaultPrevented: returnFalse,
    isPropagationStopped: returnFalse,
    isImmediatePropagationStopped: returnFalse,

    preventDefault: function() {
        var e = this.originalEvent;

        this.isDefaultPrevented = returnTrue;
        e.returnValue = false;

        if ( e && e.preventDefault ) {
            e.preventDefault();
        }
    },
    stopPropagation: function() {
        var e = this.originalEvent;

        this.isPropagationStopped = returnTrue;

        if ( e && e.stopPropagation ) {
            e.stopPropagation();
        }
    },
    stopImmediatePropagation: function() {
        var e = this.originalEvent;

        this.isImmediatePropagationStopped = returnTrue;

        if ( e && e.stopImmediatePropagation ) {
            e.stopImmediatePropagation();
        }

        this.stopPropagation();
    }
}, true, false);




function normalizeEvent(originalEvent) {
    return new DomEvent(originalEvent);
};





var mhistory = function(){

    var win,
        history,
        location,
        observable      = new Observable,
        api             = {},
        params          = {},

        pushState,
        replaceState,

        windowLoaded    = typeof window == "undefined",
        rURL            = /(?:(\w+:))?(?:\/\/(?:[^@]*@)?([^\/:\?#]+)(?::([0-9]+))?)?([^\?#]*)(?:(\?[^#]+)|\?)?(?:(#.*))?/,

        pushStateSupported,
        hashChangeSupported,
        useHash;

    observable.createEvent("beforeLocationChange", false);

    var initWindow = function() {
        win                 = window;
        history             = win.history;
        location            = win.location;
        pushStateSupported  = !!history.pushState;
        hashChangeSupported = "onhashchange" in win;
        useHash             = pushStateSupported && (navigator.vendor || "").match(/Opera/);
    };

    var preparePath = function(url) {

        var base = location.protocol + '//' + location.hostname;
        if (location.port) {
            base += ':' + location.port;
        }

        url = url.replace(base, '');

        if (!pushStateSupported) {
            url = encodeURIComponent(url);
        }

        if (url.substr(0, 1) == "?") {
            url = location.pathname + url;
        }

        if (useHash) {
            url = url.replace("?", "#");
        }

        return url;
    };

    var sameHostLink = function(url) {

        var matches = url.match(rURL);

        if (matches[1] && location.protocol != matches[1]) {
            return false;
        }

        if (matches[2] && location.hostname != matches[2]) {
            return false;
        }

        if (!matches[2] && !matches[3]) {
            return true;
        }

        return location.port == matches[3];
    };

    var getPathFromUrl  = function(url) {

        url = "" + url;

        // 0 - full url, 1 - protocol, 2 - host, 3 - port, 4 - path, 5 - search, 6 - hash
        var matches = url.match(rURL),
            path,
            hash;

        if (!pushStateSupported || useHash) {
            hash    = matches[6];
            if (hash.substr(0,1) == "!") {
                path    = hash.substr(1);
            }
        }

        if (!path) {
            path    = matches[4];

            if (matches[5]) {
                path    += matches[5];
            }
        }

        return path;
    };

    var samePathLink = function(url) {
        return getPathFromUrl(url) == getPathFromUrl(location);
    };

    var setHash = function(hash) {
        if (hash) {
            location.hash = "!" + hash;
        }
        else {
            location.hash = "";
        }
    };

    var getCurrentUrl = function() {
        var loc;

        if (pushStateSupported) {
            loc = location.pathname + location.search + location.hash;
        }
        else {
            loc = location.hash.substr(1);

            if (loc) {
                if (loc.substr(0, 1) == "!") {
                    loc = loc.substr(1);
                }
                loc = decodeURIComponent(loc);
            }
            else {
                loc = location.pathname + location.search;
            }
        }

        return loc;
    };

    var getParam = function(name, url){
        var ex = params[name].extractor;
        if (isFunction(ex)) {
            return ex(url, name);
        }
        else {
            var match = url.match(ex);
            return match ? match.pop() : null;
        }
    };

    var checkParamChange = function(url){
        var i,
            prev, val;

        for (i in params) {
            prev    = params[i].value;
            val     = getParam(i, url);
            params[i].value = val;
            if (val != prev) {
                observable.trigger("change-" + i, val, prev, i, url);
            }
        }
    };

    var onLocationChange = function(){
        var url = getCurrentUrl();
        triggerEvent("locationChange", url);
        checkParamChange(url);
    };

    var triggerEvent = function triggerEvent(event, data) {
        var url = data || getCurrentUrl();
        return observable.trigger(event, url);
    };

    var init = function() {

        initWindow();

        // normal pushState
        if (pushStateSupported) {

            history.origPushState       = history.pushState;
            history.origReplaceState    = history.replaceState;

            addListener(win, "popstate", onLocationChange);

            pushState = function(url) {
                if (triggerEvent("beforeLocationChange", url) === false) {
                    return false;
                }
                history.origPushState(null, null, preparePath(url));
                onLocationChange();
            };


            replaceState = function(url) {
                if (triggerEvent("beforeLocationChange", url) === false) {
                    return false;
                }
                history.origReplaceState(null, null, preparePath(url));
                onLocationChange();
            };
        }
        else {

            // onhashchange
            if (hashChangeSupported) {

                replaceState = pushState = function(url) {
                    if (triggerEvent("beforeLocationChange", url) === false) {
                        return false;
                    }
                    async(setHash, null, [preparePath(url)]);
                };

                addListener(win, "hashchange", onLocationChange);
            }
            // iframe
            else {

                var frame   = null,
                    initialUpdate = false;

                var createFrame = function() {
                    frame   = document.createElement("iframe");
                    frame.src = 'about:blank';
                    frame.style.display = 'none';
                    document.body.appendChild(frame);
                };

                win.onIframeHistoryChange = function(val) {
                    if (!initialUpdate) {
                        async(function(){
                            setHash(val);
                            onLocationChange();
                        });
                    }
                };

                var pushFrame = function(value) {
                    var frameDoc = frame.contentWindow.document;
                    frameDoc.open();
                    //update iframe content to force new history record.
                    frameDoc.write('<html><head><title>' + document.title +
                                   '</title><script type="text/javascript">' +
                                   'var hashValue = "'+value+'";'+
                                   'window.top.onIframeHistoryChange(hashValue);' +
                                   '</script>' +
                                   '</head><body>&nbsp;</body></html>'
                    );
                    frameDoc.close();
                };

                var replaceFrame = function(value) {
                    frame.contentWindow.hashValue = value;
                };


                pushState = function(url) {
                    if (triggerEvent("beforeLocationChange", url) === false) {
                        return false;
                    }
                    pushFrame(preparePath(url));
                };

                replaceState = function(url) {
                    if (triggerEvent("beforeLocationChange", url) === false) {
                        return false;
                    }
                    replaceFrame(preparePath(url));
                };

                var initFrame = function(){
                    createFrame();
                    initialUpdate = true;
                    pushFrame(preparePath(location.hash.substr(1)));
                    initialUpdate = false;
                };

                if (windowLoaded) {
                    initFrame();
                }
                else {
                    addListener(win, "load", initFrame);
                }
            }
        }



        addListener(document.documentElement, "click", function(e) {

            e = normalizeEvent(e || win.event);

            var a = e.target,
                href;

            while (a && a.nodeName.toLowerCase() != "a") {
                a = a.parentNode;
            }

            if (a) {

                href = getAttr(a, "href");

                if (href && href.substr(0,1) != "#" && !getAttr(a, "target") &&
                    sameHostLink(href) && !samePathLink(href)) {

                    history.pushState(null, null, getPathFromUrl(href));

                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }

            return null;
        });

        init = emptyFn;
    };


    if (typeof window != "undefined" && window.document) {
        addListener(window, "load", function() {
            windowLoaded = true;
        });
    }

    return extend(api, observable.getApi(), {

        push: function(url) {
            init();
            history.pushState(null, null, url);
        },

        replace: function(url) {
            init();
            history.replaceState(null, null, url);
        },

        current: function() {
            init();
            return getCurrentUrl();
        },

        init: function() {
            return init();
        },

        polyfill: function() {
            init();
            window.history.pushState = function(state, title, url) {
                pushState(url);
            };
            window.history.replaceState = function(state, title, url) {
                replaceState(url);
            };
        },

        getParam: function(name){
            return params[name] ? params[name].value : null;
        },

        addParam: function(name, extractor) {
            init();
            if (!params[name]) {
                if (!extractor) {
                    extractor = getRegExp(name + "=([^&]+)")
                }
                else if (!isFunction(extractor)) {
                    extractor = isString(extractor) ? getRegExp(extractor) : extractor;
                }

                params[name] = {
                    name: name,
                    value: null,
                    extractor: extractor
                };
                params[name].value = getParam(name, getCurrentUrl());
            }
        }

    });

}();




var currentUrl = mhistory.current;





defineClass({

    $class: "View",

    /**
     * [
     *  {
     *      reg: /.../,
     *      cmp: 'Cmp.Name',
     *      params: [name, name...], // param index in array is the same as reg match number - 1
     *      template: '',
     *      isolateScope: bool
     *  }
     * ]
     */
    route: null,
    node: null,
    scope: null,
    cmp: null,
    id: null,

    currentComponent: null,
    watchable: null,
    defaultCmp: null,

    $init: function(cfg)  {

        var self    = this;

        extend(self, cfg, true, false);

        var node = self.node,
            viewCfg = getNodeConfig(node, self.scope);

        extend(self, viewCfg, true, false);

        if (node && node.firstChild) {
            data(node, "mjs-transclude", toFragment(node.childNodes));
        }

        if (!self.id) {
            self.id = nextUid();
        }

        self.scope.$app.registerCmp(self, self.scope, "id");

        if (self.route) {
            mhistory.init();
            mhistory.on("locationChange", self.onLocationChange, self);
            self.onLocationChange();
        }
        else if (self.cmp) {
            self.watchable = createWatchable(self.scope, self.cmp, self.onCmpChange, self, null, ns);
            self.onCmpChange();
        }
    },

    onCmpChange: function() {

        var self    = this,
            cmp     = self.watchable.getLastResult() || self.defaultCmp;

        self.clearComponent();

        if (cmp) {
            self.setComponent(cmp);
        }
    },

    onLocationChange: function() {

        var self    = this,
            url     = currentUrl(),
            routes  = self.route,
            def,
            i, len,
            r, matches;

        for (i = 0, len = routes.length; i < len; i++) {
            r = routes[i];

            if (r.reg && (matches = url.match(r.reg))) {
                self.changeRouteComponent(r, matches);
                return;
            }
            if (r['default'] && !def) {
                def = r;
            }
        }

        self.clearComponent();

        if (def) {
            self.setRouteComponent(def, []);
        }
        else if (self.defaultCmp) {
            self.setComponent(self.defaultCmp);
        }
    },

    changeRouteComponent: function(route, matches) {
        var self = this;
        stopAnimation(self.node);
        self.clearComponent();
        self.setRouteComponent(route, matches);
    },

    clearComponent: function() {
        var self    = this,
            node    = self.node;

        if (self.currentComponent) {

            animate(node, "leave", null, true).done(function(){

                self.currentComponent.destroy();
                self.currentComponent = null;

                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }
            });
        }

    },

    setRouteComponent: function(route, matches) {

        var self    = this,
            node    = self.node,
            params  = route.params;

        animate(node, "enter", function(){

            var args    = matches || [],
                cfg     = {
                    destroyEl: false,
                    node: node,
                    scope: route.$isolateScope ?
                           self.scope.$newIsolated() :
                           self.scope.$new()
                },
                i, l;

            if (route.as) {
                cfg.as = route.as;
            }
            if (route.template) {
                cfg.template = route.template;
            }

            args.shift();

            if (params) {
                for (i = -1, l = params.length; ++i < l; cfg[params[i]] = args[i]){}
            }

            return resolveComponent(
                    route.cmp || "MetaphorJs.Component",
                    cfg,
                    cfg.scope,
                    node,
                    null,
                    args
                )
                .done(function(newCmp){
                    self.currentComponent = newCmp;
                });

        }, true);
    },

    setComponent: function(cmp) {

        var self    = this,
            node    = self.node;

        animate(node, "enter", function(){

            var cfg     = isObject(cmp) ? cmp : {},
                cls     = (isString(cmp) ? cmp : null) || "MetaphorJs.Component",
                scope   = cfg.scope || self.scope.$new();

            cfg.destroyEl = false;

            return resolveComponent(cls, cfg, scope, node).done(function(newCmp){
                self.currentComponent = newCmp;
            });

        }, true);
    },

    destroy: function() {

        var self    = this;

        self.clearComponent();

        if (self.route) {
            mhistory.un("locationchange", self.onLocationChange, self);
            self.route = null;
        }

        if (self.watchable) {
            self.watchable.unsubscribeAndDestroy(self.onCmpChange, self);
            self.watchable = null;
        }

        self.scope = null;
        self.currentComponent = null;

        self.$super();
    }
});








Directive.registerAttribute("mjs-app", 100, returnFalse);

function isField(el) {
    var tag	= el.nodeName.toLowerCase(),
        type = el.type;
    if (tag == 'input' || tag == 'textarea' || tag == 'select') {
        if (type != "submit" && type != "reset" && type != "button") {
            return true;
        }
    }
    return false;
};



/**
 * @param {Element} elem
 */
var getValue = function(){


    var rreturn = /\r/,

        hooks = {

        option: function(elem) {
            var val = elem.getAttribute("value") || elem.value;

            return val != undf ?
                   val :
                   trim( elem.innerText || elem.textContent );
        },

        select: function(elem) {

            var value, option,
                options = elem.options,
                index = elem.selectedIndex,
                one = elem.type === "select-one" || index < 0,
                values = one ? null : [],
                max = one ? index + 1 : options.length,
                disabled,
                i = index < 0 ?
                    max :
                    one ? index : 0;

            // Loop through all the selected options
            for ( ; i < max; i++ ) {
                option = options[ i ];

                disabled = option.disabled ||
                           option.parentNode.disabled;

                // IE6-9 doesn't update selected after form reset (#2551)
                if ((option.selected || i === index) && !disabled ) {
                    // Get the specific value for the option
                    value = getValue(option);

                    // We don't need an array for one selects
                    if ( one ) {
                        return value;
                    }

                    // Multi-Selects return an array
                    values.push( value );
                }
            }

            return values;
        },

        radio: function( elem ) {
            return isNull(elem.getAttribute("value")) ? "on" : elem.value;
        },

        checkbox: function( elem ) {
            return isNull(elem.getAttribute("value")) ? "on" : elem.value;
        }
    };

    return function(elem) {

        var hook, ret;

        hook = hooks[elem.type] || hooks[elem.nodeName.toLowerCase()];

        if (hook && (ret = hook(elem, "value")) !== undf) {
            return ret;
        }

        ret = elem.value;

        return isString(ret) ?
            // Handle most common string cases
               ret.replace(rreturn, "") :
            // Handle cases where value is null/undef or number
               ret == null ? "" : ret;

    };
}();



/**
 * @param {*} val
 * @param {[]} arr
 * @returns {boolean}
 */
function inArray(val, arr) {
    return arr ? (aIndexOf.call(arr, val) != -1) : false;
};



/**
 * @param {Element} el
 * @param {*} val
 */
var setValue = function() {

    var hooks = {
        select:  function(elem, value) {

            var optionSet, option,
                options     = elem.options,
                values      = toArray(value),
                i           = options.length,
                selected,
                setIndex    = -1;

            while ( i-- ) {
                option      = options[i];
                selected    = inArray(option.value, values);

                if (selected) {
                    setAttr(option, "selected", "selected");
                    option.selected = true;
                    optionSet = true;
                }
                else {
                    removeAttr(option, "selected");
                }

                if (!selected && !isNull(getAttr(option, "mjs-default-option"))) {
                    setIndex = i;
                }
            }

            // Force browsers to behave consistently when non-matching value is set
            if (!optionSet) {
                elem.selectedIndex = setIndex;
            }

            return values;
        }
    };

    hooks["radio"] = hooks["checkbox"] = function(elem, value) {
        if (isArray(value) ) {
            return (elem.checked = inArray(getValue(elem), value));
        }
    };


    return function(el, val) {

        if (el.nodeType !== 1) {
            return;
        }

        // Treat null/undefined as ""; convert numbers to string
        if (isNull(val)) {
            val = "";
        }
        else if (isNumber(val)) {
            val += "";
        }

        var hook = hooks[el.type] || hooks[el.nodeName.toLowerCase()];

        // If set returns undefined, fall back to normal setting
        if (!hook || hook(el, val, "value") === undf) {
            el.value = val;
        }
    };
}();
/**
 * @param {Element} elem
 * @returns {boolean}
 */
function isSubmittable(elem) {
    var type	= elem.type ? elem.type.toLowerCase() : '';
    return elem.nodeName.toLowerCase() == 'input' && type != 'radio' && type != 'checkbox';
};

var isAndroid = function(){

    var android = null;

    return function isAndroid() {

        if (android === null) {
            android = parseInt((/android (\d+)/i.exec(navigator.userAgent) || [])[1], 10) || false;
        }

        return android;
    };

}();


var isIE = function(){

    var msie;

    return function isIE() {

        if (msie === null) {
            var ua = navigator.userAgent;
            msie = parseInt((/msie (\d+)/i.exec(ua) || [])[1], 10);
            if (isNaN(msie)) {
                msie = parseInt((/trident\/.*; rv:(\d+)/i.exec(ua) || [])[1], 10) || false;
            }
        }

        return msie;
    };
}();



/**
 * @param {String} event
 * @return {boolean}
 */
var browserHasEvent = function(){

    var eventSupport = {};

    return function browserHasEvent(event) {
        // IE9 implements 'input' event it's so fubared that we rather pretend that it doesn't have
        // it. In particular the event is not fired when backspace or delete key are pressed or
        // when cut operation is performed.

        if (eventSupport[event] === undf) {

            if (event == 'input' && isIE() == 9) {
                return eventSupport[event] = false;
            }

            var divElm = document.createElement('div');
            eventSupport[event] = !!('on' + event in divElm);
        }

        return eventSupport[event];
    };
}();




var Input = function(el, changeFn, changeFnContext, submitFn) {

    var self    = this,
        cfg     = getNodeConfig(el),
        type;

    self.el             = el;
    self.cb             = changeFn;
    self.scb            = submitFn;
    self.cbContext      = changeFnContext;
    self.inputType      = type = (cfg.type || el.type.toLowerCase());
    self.listeners      = [];
    self.submittable    = isSubmittable(el);

    if (type == "radio") {
        self.initRadioInput();
    }
    else if (type == "checkbox") {
        self.initCheckboxInput();
    }
    else {
        self.initTextInput();
    }
};

extend(Input.prototype, {

    el: null,
    inputType: null,
    cb: null,
    scb: null,
    cbContext: null,
    listeners: [],
    radio: null,
    submittable: false,

    destroy: function() {

        var self        = this,
            type        = self.inputType,
            listeners   = self.listeners,
            radio       = self.radio,
            el          = self.el,
            i, ilen,
            j, jlen;

        for (i = 0, ilen = listeners.length; i < ilen; i++) {
            if (type == "radio") {
                for (j = 0, jlen = radio.length; j < jlen; j++) {
                    removeListener(radio[j], listeners[i][0], listeners[i][1]);
                }
            }
            else {
                removeListener(el, listeners[i][0], listeners[i][1]);
            }
        }

        for (i in self) {
            if (self.hasOwnProperty(i)) {
                self[i] = null;
            }
        }
    },

    initRadioInput: function() {

        var self    = this,
            el      = self.el,
            name    = el.name,
            radio,
            i, len;


        self.radio  = radio = select("input[name="+name+"]", el.ownerDocument);

        self.onRadioInputChangeDelegate = bind(self.onRadioInputChange, self);
        self.listeners.push(["click", self.onRadioInputChangeDelegate]);

        for (i = 0, len = radio.length; i < len; i++) {
            addListener(radio[i], "click", self.onRadioInputChangeDelegate);
        }
    },

    initCheckboxInput: function() {

        var self    = this;

        self.onCheckboxInputChangeDelegate = bind(self.onCheckboxInputChange, self);

        self.listeners.push(["click", self.onCheckboxInputChangeDelegate]);
        addListener(self.el, "click", self.onCheckboxInputChangeDelegate);
    },

    initTextInput: function() {

        var composing   = false,
            self        = this,
            node        = self.el,
            listeners   = self.listeners,
            timeout;

        // In composition mode, users are still inputing intermediate text buffer,
        // hold the listener until composition is done.
        // More about composition events:
        // https://developer.mozilla.org/en-US/docs/Web/API/CompositionEvent
        if (!isAndroid()) {

            var compositionStart    = function() {
                composing = true;
            };

            var compositionEnd  = function() {
                composing = false;
                listener();
            };

            listeners.push(["compositionstart", compositionStart]);
            listeners.push(["compositionend", compositionEnd]);

            addListener(node, "compositionstart", compositionStart);
            addListener(node, "compositionend", compositionEnd);
        }

        var listener = self.onTextInputChangeDelegate = function() {
            if (composing) {
                return;
            }
            self.onTextInputChange();
        };

        // if the browser does support "input" event, we are fine - except on
        // IE9 which doesn't fire the
        // input event on backspace, delete or cut
        if (browserHasEvent('input')) {
            listeners.push(["input", listener]);
            addListener(node, "input", listener);

        } else {

            var deferListener = function(ev) {
                if (!timeout) {
                    timeout = window.setTimeout(function() {
                        listener(ev);
                        timeout = null;
                    }, 0);
                }
            };

            var keydown = function(event) {
                event = event || window.event;
                var key = event.keyCode;

                if (key == 13 && self.submittable && self.scb) {
                    return self.scb.call(self.cbContext, event);
                }

                // ignore
                //    command            modifiers                   arrows
                if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) {
                    return;
                }

                deferListener(event);
            };

            listeners.push(["keydown", keydown]);
            addListener(node, "keydown", keydown);

            // if user modifies input value using context menu in IE,
            // we need "paste" and "cut" events to catch it
            if (browserHasEvent('paste')) {

                listeners.push(["paste", deferListener]);
                listeners.push(["cut", deferListener]);

                addListener(node, "paste", deferListener);
                addListener(node, "cut", deferListener);
            }
        }

        // if user paste into input using mouse on older browser
        // or form autocomplete on newer browser, we need "change" event to catch it

        listeners.push(["change", listener]);
        addListener(node, "change", listener);
    },

    processValue: function(val) {

        switch (this.inputType) {
            case "number":
                val     = parseInt(val, 10);
                if (isNaN(val)) {
                    val = 0;
                }
                break;
        }

        return val;
    },

    onTextInputChange: function() {

        var self    = this,
            val     = self.getValue();

        if (self.cb) {
            self.cb.call(self.cbContext, val);
        }
    },

    onCheckboxInputChange: function() {

        var self    = this,
            node    = self.el;

        if (self.cb) {
            self.cb.call(self.cbContext, node.checked ? (getAttr(node, "value") || true) : false);
        }
    },

    onRadioInputChange: function(e) {

        e = e || window.event;

        var self    = this,
            trg     = e.target || e.srcElement;

        if (self.cb) {
            self.cb.call(self.cbContext, trg.value);
        }
    },

    setValue: function(val) {

        var self    = this,
            type    = self.inputType,
            radio,
            i, len;

        if (type == "radio") {

            radio = self.radio;

            for (i = 0, len = radio.length; i < len; i++) {
                radio[i].checked = radio[i].value == val;
            }
        }
        else if (type == "checkbox") {
            var node        = self.el;
            node.checked    = val === true || val == node.value;
        }
        else {
            setValue(self.el, val);
        }
    },

    getValue: function() {

        var self    = this,
            type    = self.inputType,
            radio,
            i, l;

        if (type == "radio") {
            radio = self.radio;
            for (i = 0, l = radio.length; i < l; i++) {
                if (radio[i].checked) {
                    return radio[i].value;
                }
            }
            return null;
        }
        else if (type == "checkbox") {
            return self.el.checked ? (getAttr(self.el, "value") || true) : false;
        }
        else {
            return self.processValue(getValue(self.el));
        }
    }
}, true, false);

Input.getValue = getValue;
Input.setValue = setValue;








Directive.registerAttribute("mjs-bind", 1000, defineClass({

    $extends: Directive,

    isInput: false,
    input: null,
    lockInput: null,
    recursive: false,
    textRenderer: null,

    $init: function(scope, node, expr) {

        var self    = this,
            cfg     = getNodeConfig(node, scope);

        self.isInput    = isField(node);
        self.recursive  = cfg.recursive || getAttr(node, "mjs-recursive") !== null;
        self.lockInput  = cfg.lockInput;

        removeAttr(node, "mjs-recursive");

        if (self.isInput) {
            self.input  = new Input(node, self.onInputChange, self);
        }

        if (self.recursive) {
            self.scope  = scope;
            self.node   = node;
            self.textRenderer = new TextRenderer(scope, '{{' + expr + '}}', null, null, true);
            self.textRenderer.subscribe(self.onTextRendererChange, self);
            self.onTextRendererChange();

            if (scope instanceof Scope) {
                scope.$on("destroy", self.onScopeDestroy, self);
            }
        }
        else {
            self.$super(scope, node, expr);
        }
    },

    onInputChange: function() {

        var self = this;
        if (self.lockInput) {
            self.onChange();
        }
    },

    onTextRendererChange: function() {

        var self    = this;
        self.updateElement(self.textRenderer.getString());
    },

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult();

        self.updateElement(val);
    },

    updateElement: function(val) {

        var self = this;

        if (self.isInput) {
            self.input.setValue(val);
        }
        else {
            self.node[typeof self.node.textContent == "string" ? "textContent" : "innerText"] = val;
        }
    },

    destroy: function() {

        var self    = this;

        if (self.textRenderer) {
            self.textRenderer.$destroy();
            self.textRenderer = null;
        }

        if (self.input) {
            self.input.destroy();
            self.input = null;
        }

        self.$super();
    }
}));






Directive.registerAttribute("mjs-bind-html", 1000, defineClass({

    $extends: "attr.mjs-bind",

    updateElement: function(val) {
        this.node.innerHTML = val;
    }
}));




Directive.registerAttribute("mjs-break-if", 500, function(scope, node, expr){

    var res = !!createGetter(expr)(scope);

    if (res) {
        node.parentNode.removeChild(node);
    }

    return !res;
});





(function(){

    var toggleClass = function(node, cls, toggle, doAnim) {

        var has;

        if (toggle !== null) {
            if (toggle == hasClass(node, cls)) {
                return;
            }
            has = !toggle;
        }
        else {
            has = hasClass(node, cls);
        }

        if (has) {
            if (doAnim) {
                animate(node, [cls + "-remove"], null, true).done(function(){
                    removeClass(node, cls);
                });
            }
            else {
                removeClass(node, cls);
            }
        }
        else {
            if (doAnim) {
                animate(node, [cls + "-add"], null, true).done(function(){
                    addClass(node, cls);
                });
            }
            else {
                addClass(node, cls);
            }
        }
    };

    Directive.registerAttribute("mjs-class", 1000, defineClass({

        $extends: Directive,

        initial: true,

        onChange: function() {

            var self    = this,
                node    = self.node,
                clss    = self.watcher.getLastResult(),
                prev    = self.watcher.getPrevValue(),
                i;

            stopAnimation(node);

            if (isString(clss)) {
                if (prev) {
                    toggleClass(node, prev, false, false);
                }
                toggleClass(node, clss, null, !self.initial);
            }
            else if (isArray(clss)) {
                var l;
                for (i = -1, l = clss.length; ++i < l; toggleClass(node, clss[i], true, !self.initial)){}
            }
            else {
                for (i in clss) {
                    toggleClass(node, i, clss[i] ? true : false, !self.initial);
                }
            }

            self.initial = false;
        }
    }));

}());




Directive.registerAttribute("mjs-cmp-prop", 200,
    ['$parentCmp', '$node', '$attrValue', function(parentCmp, node, expr){
    if (parentCmp) {
        parentCmp[expr] = node;
    }
}]);



(function(){

    var cmpAttr = function(scope, node, expr, parentRenderer){


        var cmpName,
            as,
            tmp,
            i, len,
            part,
            nodeCfg = getNodeConfig(node, scope);

        tmp     = expr.split(' ');

        for (i = 0, len = tmp.length; i < len; i++) {

            part = tmp[i];

            if (part == '' || part == 'as') {
                continue;
            }

            if (!cmpName) {
                cmpName = part;
            }
            else {
                as      = part;
            }
        }


        var cfg     = extend({
            scope: scope,
            node: node,
            as: as,
            parentRenderer: parentRenderer,
            destroyScope: true
        }, nodeCfg, false, false);

        var constr = nsGet(cmpName, true);

        resolveComponent(cmpName, cfg, scope, node);

        return !!constr.$shadow;
    };

    cmpAttr.$breakScope = true;

    Directive.registerAttribute("mjs-cmp", 200, cmpAttr);

}());



Directive.registerAttribute("mjs-config", 50, function(scope, node, expr){
    getNodeConfig(node, scope, expr);
});






Directive.registerAttribute("mjs-each", 100, ListRenderer);




var createFunc = functionFactory.createFunc;



(function(){

    var events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover',
                  'mouseout', 'mousemove', 'keydown', 'keyup', 'keypress', 'submit',
                  'focus', 'blur', 'copy', 'cut', 'paste', 'enter'],
        i, len;

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            var eventName = name;

            if (eventName == "enter") {
                eventName = "keyup";
            }

            Directive.registerAttribute("mjs-" + name, 1000, function(scope, node, expr){

                var fn  = createFunc(expr);

                addListener(node, eventName, function(e){

                    e = normalizeEvent(e || window.event);

                    if (name == "enter" && e.keyCode != 13) {
                        return null;
                    }

                    scope.$event = e;

                    fn(scope);

                    scope.$event = null;

                    scope.$root.$check();

                    e.preventDefault();
                    return false;
                });
            });
        }(events[i]));
    }

}());






Directive.registerAttribute("mjs-show", 500, defineClass({

    $extends: Directive,

    initial: true,
    display: "",

    $init: function(scope, node, expr) {

        var self    = this,
            cfg = getNodeConfig(node, scope);

        self.display = cfg.display || "";

        self.$super(scope, node, expr);
    },

    runAnimation: function(show) {

        var self    = this,
            style   = self.node.style,
            done    = function() {
                if (!show) {
                    style.display = "none";
                }
                else {
                    style.display = self.display;
                }
            };

        self.initial ? done() : animate(
            self.node,
            show ? "show" : "hide",
            function() {
                if (show) {
                    style.display = self.display;
                }
            },
            true)
            .done(done);
    },

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult();

        self.runAnimation(val);

        self.initial = false;
    }
}));







Directive.registerAttribute("mjs-hide", 500, defineClass({

    $extends: "attr.mjs-show",

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult();

        self.runAnimation(!val);
        self.initial = false;
    }
}));






Directive.registerAttribute("mjs-if", 500, defineClass({

    $extends: Directive,

    parentEl: null,
    prevEl: null,
    el: null,
    initial: true,

    $init: function(scope, node, expr) {

        var self    = this;

        self.parentEl   = node.parentNode;
        self.prevEl     = node.previousSibling;

        self.$super(scope, node, expr);

    },

    onScopeDestroy: function() {

        var self    = this;

        self.prevEl = null;
        self.parentEl = null;

        self.$super();
    },

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult(),
            parent  = self.parentEl,
            node    = self.node;

        var show    = function(){
            if (self.prevEl) {
                parent.insertBefore(node, self.prevEl ? self.prevEl.nextSibling : null);
            }
            else {
                parent.appendChild(node);
            }
        };

        var hide    = function() {
            parent.removeChild(node);
        };

        if (val) {
            if (!isAttached(node)) {
                self.initial ? show() : animate(node, "enter", show, true);
            }
        }
        else {
            if (isAttached(node)) {
                self.initial ? hide() : animate(node, "leave", null, true).done(hide);
            }
        }

        self.initial = false;
    }
}));





Directive.registerAttribute("mjs-ignore", 0, returnFalse);





Directive.registerAttribute("mjs-include", 900, function(scope, node, tplExpr, parentRenderer){

    var tpl = new Template({
        scope: scope,
        node: node,
        url: tplExpr,
        parentRenderer: parentRenderer
    });

    if (tpl.ownRenderer) {
        return false;
    }
    else {
        return tpl.initPromise;
    }
});





Directive.registerAttribute("mjs-init", 250, function(scope, node, expr){
    createFunc(expr)(scope);
});








Directive.registerAttribute("mjs-model", 1000, defineClass({

    $extends: Directive,

    inProg: false,
    input: null,
    binding: null,

    autoOnChange: false,

    $init: function(scope, node, expr) {

        var self    = this,
            cfg     = getNodeConfig(node, scope);

        self.node           = node;
        self.input          = new Input(node, self.onInputChange, self);
        self.binding        = cfg.binding || "both";

        self.$super(scope, node, expr);

        var inputValue      = self.input.getValue(),
            scopeValue      = self.watcher.getLastResult();

        if (scopeValue != inputValue) {
            // scope value takes priority
            if (self.binding != "input" && scopeValue != undf) {
                self.onChange(scopeValue);
            }
            else if (self.binding != "scope" && inputValue != undf) {
                self.onInputChange(inputValue);
            }
        }
    },

    onInputChange: function(val) {

        var self    = this,
            scope   = self.scope;

        if (self.binding != "scope") {

            if (val && isString(val) && val.indexOf('\\{') != -1) {
                val = val.replace(/\\{/g, '{');
            }

            if (self.watcher.getLastResult() == val) {
                return;
            }

            self.watcher.setValue(val);

            self.inProg = true;
            if (scope instanceof Scope) {
                scope.$root.$check();
            }
            else {
                self.watcher.checkAll();
            }
            self.inProg = false;
        }
    },

    destroy: function() {

        var self        = this;
        self.input.destroy();
        self.$super();
    },


    onChange: function() {

        var self    = this,
            val     = self.watcher.getLastResult(),
            ie;

        if (self.binding != "input" && !self.inProg) {
            if ((ie = isIE()) && ie < 8) {
                async(self.input.setValue, self.input, [val]);
            }
            else {
                self.input.setValue(val);
            }
        }
    }


}));






Directive.registerAttribute("mjs-options", 100, defineClass({

    $extends: Directive,

    model: null,
    getterFn: null,
    defOption: null,
    prevGroup: null,
    groupEl: null,
    fragment: null,

    $init: function(scope, node, expr) {

        var self    = this;

        self.parseExpr(expr);

        self.node       = node;
        self.scope      = scope;
        self.defOption  = node.options.length ? node.options[0] : null;

        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }

        self.defOption && setAttr(self.defOption, "mjs-default-option", "");

        try {
            self.watcher    = createWatchable(scope, self.model, self.onChange, self, null, ns);
        }
        catch (thrownError) {
            error(thrownError);
        }

        self.render(toArray(self.watcher.getValue()));
    },

    onChange: function() {
        this.render(toArray(this.watcher.getValue()));
    },

    renderOption: function(item, index, scope) {

        var self        = this,
            parent      = self.groupEl || self.fragment,
            msie        = isIE(),
            config,
            option;

        scope.item      = item;
        scope.$index    = index;
        config          = self.getterFn(scope);

        config.group    != undf && (config.group = ""+config.group);

        if (config.group !== self.prevGroup) {

            if (config.group){
                self.groupEl = parent = document.createElement("optgroup");
                setAttr(parent, "label", config.group);
                if (config.disabledGroup) {
                    setAttr(parent, "disabled", "disabled");
                }
                self.fragment.appendChild(parent);
            }
            else {
                parent = self.fragment;
                self.groupEl = null;
            }
        }
        self.prevGroup  = config.group;

        option  = document.createElement("option");
        setAttr(option, "value", config.value);
        option.text = config.name;

        if (msie && msie < 9) {
            option.innerHTML = config.name;
        }
        if (config.disabled) {
            setAttr(option, "disabled", "disabled");
        }

        parent.appendChild(option);
    },

    render: function(list) {

        var self        = this,
            node        = self.node,
            value       = getValue(node),
            def         = self.defOption,
            tmpScope    = self.scope.$new(),
            msie        = isIE(),
            parent, next,
            i, len;

        self.fragment   = document.createDocumentFragment();
        self.prevGroup  = null;
        self.groupEl    = null;

        while(node.firstChild) {
            node.removeChild(node.firstChild);
        }

        for (i = 0, len = list.length; i < len; i++) {
            self.renderOption(list[i], i, tmpScope);
        }

        if (def) {
            node.insertBefore(def, node.firstChild);
        }

        tmpScope.$destroy();

        // ie6 gives "unspecified error when trying to set option.selected"
        // on node.appendChild(fragment);
        // somehow this get fixed by detaching dom node
        // and attaching it back
        if (msie && msie < 8) {
            next = node.nextSibling;
            parent = node.parentNode;
            parent.removeChild(node);
        }

        node.appendChild(self.fragment);
        self.fragment = null;

        if (msie && msie < 8) {
            parent.insertBefore(node, next);
        }

        setValue(node, value);
    },


    parseExpr: function(expr) {

        var splitIndex  = expr.indexOf(" in "),
            model, item;

        if (splitIndex == -1) {
            model   = expr;
            item    = '{name: .item, value: .$index}';
        }
        else {
            model   = expr.substr(splitIndex + 4);
            item    = expr.substr(0, splitIndex);
        }

        this.model = model;
        this.getterFn = createGetter(item);
    }

}));







(function(){

    var booleanAttrs = ["selected", "checked", "disabled", "readonly", "open", "required"],
        i, l;

    var PropertyDirective = defineClass({

        $extends: Directive,

        propName: null,

        $init: function(scope, node, expr, propName) {
            this.propName = propName;
            this.$super(scope, node, expr);
        },

        onChange: function(val) {

            var name = this.propName;

            val = !!val;

            if (val) {
                setAttr(this.node, name, name);
            }
            else {
                removeAttr(this.node, name);
            }
        }
    });

    for (i = 0, l = booleanAttrs.length; i < l; i++) {
        (function(name){

            Directive.registerAttribute("mjs-" + name, 1000, function(scope, node, expr){
                return new PropertyDirective(scope, node, expr, name);
            });

        }(booleanAttrs[i]));
    }

}());




var preloadImage = function() {

    var cache = {},
        cacheCnt = 0;


    return function preloadImage(src) {

        if (cache[src]) {
            return Promise.resolve(src);
        }

        if (cacheCnt > 1000) {
            cache = {};
            cacheCnt = 0;
        }

        var img = document.createElement("img"),
            style = img.style,
            deferred = new Promise;

        addListener(img, "load", function() {
            cache[src] = true;
            cacheCnt++;
            document.body.removeChild(img);
            deferred.resolve(src);
        });

        style.position = "absolute";
        style.visibility = "hidden";
        style.left = "-10000px";
        style.top = "0";
        img.src = src;
        document.body.appendChild(img);

        return deferred;
    };

}();




Directive.registerAttribute("mjs-src", 1000, defineClass({

    $extends: Directive,

    queue: null,
    usePreload: true,

    $constructor: function(scope, node, expr) {

        var self = this,
            cfg = getNodeConfig(node, scope);

        if (cfg.deferred) {
            self.$plugins.push("SrcDeferred");
        }

        self.$super(scope, node, expr);
    },

    $init: function(scope, node, expr) {

        var self = this,
            cfg = getNodeConfig(node, scope);

        if (cfg.noPreload) {
            self.usePreload = false;
        }

        self.queue = new Queue({auto: true, async: true, mode: Queue.ONCE, thenable: true});
        self.$super(scope, node, expr);
    },


    onChange: function() {
        var self = this;
        self.queue.add(self.doChange, self);
    },

    doChange: function() {
        var self = this,
            src = self.watcher.getLastResult();

        if (self.usePreload) {
            return preloadImage(src).done(function(){
                if (self && self.node) {
                    raf(function(){
                        self.node.src = src;
                        setAttr(self.node, "src", src);
                    });
                }
            });
        }
        else {
            self.node.src = src;
            setAttr(self.node, "src", src);
        }
    },

    destroy: function() {
        this.queue.destroy();
        this.$super();
    }
}));



function parentData(node, key) {

    var val;

    while (node) {
        val = data(node ,key);
        if (val !== undf) {
            return val;
        }
        node  = node.parentNode;
    }

    return undf;
};



function transclude(node, replace) {

    var contents  = parentData(node, 'mjs-transclude');

    if (contents) {

        if (node.firstChild) {
            data(node, "mjs-transclude", toFragment(node.childNodes));
        }

        var parent      = node.parentNode,
            next        = node.nextSibling,
            cloned      = clone(contents),
            children    = toArray(cloned.childNodes);

        if (replace) {
            parent.removeChild(node);
            parent.insertBefore(cloned, next);
        }
        else {
            node.appendChild(cloned);
        }

        return children;
    }

    return null;
};



Directive.registerAttribute("mjs-transclude", 1000, function(scope, node) {
    return transclude(node);
});



Directive.registerAttribute("mjs-view", 200, function(scope, node, cls) {
    resolveComponent(cls || "MetaphorJs.View", {scope: scope, node: node}, scope, node)
    return false;
});




var tmpDumped = false;

Directive.registerTag("mjs-if", function(scope, node) {

    var expr = getAttr(node, "value"),
        res = !!createGetter(expr)(scope);

    if (!res) {
        node.parentNode.removeChild(node);
        return false;
    }
    else {
        var nodes = toArray(node.childNodes),
            frg = toFragment(node.childNodes),
            next = node.nextSibling;

        node.parentNode.insertBefore(frg, next);
        node.parentNode.removeChild(node);

        return nodes;
    }

});



Directive.registerTag("mjs-include", function(scope, node, value, parentRenderer) {


    var tpl = new Template({
        scope: scope,
        node: node,
        url: getAttr(node, "src"),
        parentRenderer: parentRenderer,
        replace: true
    });

    return tpl.initPromise;

});




Directive.registerTag("mjs-transclude", function(scope, node) {
    return transclude(node, true);
});



nsAdd("filter.collect", function(input, scope, prop) {

    var res = [],
        i, l, val;

    for (i = 0, l = input.length; i < l; i++) {
        val = input[i][prop];
        if (val != undf) {
            res.push(val);
        }
    }

    return res;
});




var filterArray = function(){


    var compareValues = function(value, to, opt) {

            if (isFunction(to)) {
                return to(value, opt);
            }
            else if (to === "" || to === undf) {
                return true;
            }
            else if (value === undf) {
                return false;
            }
            else if (isBool(value)) {
                return value === to;
            }
            else if (to instanceof RegExp) {
                return to.test("" + value);
            }
            else if (opt == "strict") {
                return ""+value === ""+to;
            }
            else if (opt === true || opt === null || opt === undf) {
                return ""+value.indexOf(to) != -1;
            }
            else if (opt === false) {
                return ""+value.indexOf(to) == -1;
            }
            return false;
        },

        compare = function(value, by, opt) {

            if (isPrimitive(value)) {
                if (by.$ === undf) {
                    return true;
                }
                else {
                    return compareValues(value, by.$, opt);
                }
            }

            var k, i;
            for (k in by) {
                if (k == '$') {
                    for (i in value) {
                        if (compareValues(value[i], by.$, opt)) {
                            return true;
                        }
                    }
                }
                else {
                    if (compareValues(value[k], by[k], opt)) {
                        return true;
                    }
                }
            }

            return false;
        };

    var filterArray = function filterArray(a, by, opt) {

        if (!isPlainObject(by)) {
            by = {$: by};
        }

        var ret = [],
            i, l;

        for (i = -1, l = a.length; ++i < l;) {
            if (compare(a[i], by, opt)) {
                ret.push(a[i]);
            }
        }

        return ret;
    };

    filterArray.compare = compare;

    return filterArray;

}();



nsAdd("filter.filter", function(val, scope, by, opt) {
    return filterArray(val, by, opt);
});







nsAdd("filter.join", function(input, scope, separator) {

    separator = separator || ", ";

    if (input && input.length) {
        if (!isArray(input)){
            input = toArray(input);
        }
        return input.join(separator);
    }

    return "";
});



nsAdd("filter.l", function(key, scope) {
    return scope.$app.lang.get(key);
});




nsAdd("filter.limitTo", function(input, scope, limit){

    var isS = isString(input);

    if (!isArray(input) && !isS) {
        return input;
    }

    if (Math.abs(Number(limit)) === Infinity) {
        limit = Number(limit);
    } else {
        limit = parseInt(limit, 10);
    }

    if (isS) {
        //NaN check on limit
        if (limit) {
            return limit >= 0 ? input.slice(0, limit) : input.slice(limit, input.length);
        } else {
            return "";
        }
    }

    var out = [],
        i, n;

    // if abs(limit) exceeds maximum length, trim it
    if (limit > input.length)
        limit = input.length;
    else if (limit < -input.length)
        limit = -input.length;

    if (limit > 0) {
        i = 0;
        n = limit;
    } else {
        i = input.length + limit;
        n = input.length;
    }

    for (; i<n; i++) {
        out.push(input[i]);
    }

    return out;
});




nsAdd("filter.linkify", function(input, scope, target){
    target = target ? ' target="'+target+'"' : "";
    if (input) {
        var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return input.replace(exp, '<a href="$1"'+target+'>$1</a>');
    }
    return "";
});




nsAdd("filter.lowercase", function(val){
    return val.toLowerCase();
});

var dateFormats = {};





nsAdd("filter.moment",  function(val, scope, format) {
    format  = dateFormats[format] || format;
    return moment(val).format(format);
});


var numberFormats = {};







nsAdd("filter.numeral",  function(val, scope, format) {
    format  = numberFormats[format] || format;
    return numeral(val).format(format);
});



nsAdd("filter.p", function(key, scope, number) {
    return scope.$app.lang.plural(key, parseInt(number, 10) || 0);
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



nsAdd("filter.sortBy", function(val, scope, field, dir) {
    return sortArray(val, field, dir);
});




nsAdd("filter.split", function(input, scope, sep, limit) {

    limit       = limit || undf;
    sep         = sep || "/\\n|,/";

    if (!input) {
        return [];
    }

    input       = "" + input;

    if (sep.substr(0,1) == '/' && sep.substr(sep.length - 1) == "/") {
        sep = getRegExp(sep.substring(1, sep.length-1));
    }

    var list = input.split(sep, limit),
        i, l;

    for (i = -1, l = list.length; ++i < l; list[i] = trim(list[i])){}

    return list;
});





nsAdd("filter.toArray", function(input){

    if (isPlainObject(input)) {
        var list = [],
            k;
        for (k in input) {
            if (input.hasOwnProperty(k)) {
                list.push({key: k, value: input[k]});
            }
        }
        return list;
    }

    return toArray(input);
});



nsAdd("filter.ucfirst", function(val){
    return val.substr(0, 1).toUpperCase() + val.substr(1);
});




nsAdd("filter.uppercase", function(val){
    return val.toUpperCase();
});



/**
 * @param {Function} fn
 * @param {Window} w optional window object
 */
function onReady(fn, w) {

    var done    = false,
        top     = true,
        win     = w || window,
        root, doc,

        init    = function(e) {
            if (e.type == 'readystatechange' && doc.readyState != 'complete') {
                return;
            }

            removeListener(e.type == 'load' ? win : doc, e.type, init);

            if (!done && (done = true)) {
                fn.call(win, e.type || e);
            }
        },

        poll = function() {
            try {
                root.doScroll('left');
            } catch(thrownError) {
                setTimeout(poll, 50);
                return;
            }

            init('poll');
        };

    doc     = win.document;
    root    = doc.documentElement;

    if (doc.readyState == 'complete') {
        fn.call(win, 'lazy');
    }
    else {
        if (doc.createEventObject && root.doScroll) {
            try {
                top = !win.frameElement;
            } catch(thrownError) {}

            top && poll();
        }
        addListener(doc, 'DOMContentLoaded', init);
        addListener(doc, 'readystatechange', init);
        addListener(win, 'load', init);
    }
};



function initApp(node, cls, data, autorun) {

    try {
        var p = resolveComponent(cls || "MetaphorJs.App", false, data, node, [node, data]);

        if (autorun !== false) {
            return p.done(function(app){
                app.run();
            });
        }
        else {
            return p;
        }
    }
    catch (thrownError) {
        error(thrownError);
        return Promise.reject(thrownError);
    }
};



function run(w, appData) {

    var win = w || window;

    if (!win) {
        throw "Window object neither defined nor provided";
    }

    onReady(function() {

        var appNodes    = select("[mjs-app]", win.document),
            i, l, el;

        for (i = -1, l = appNodes.length; ++i < l;){
            el      = appNodes[i];
            initApp(el, getAttr(el, "mjs-app"), appData, true);
        }
    }, win);

};


/**
 * @class Base
 * @extends BaseClass
 */
var DocumentorBase = cs.define({

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

var fs = require("fs");

var isFile = function(filePath) {
    return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
};




var isDir = function(dirPath) {
    return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
};

var path = require("path");

var getFileList = function(directory, ext) {

    var fileList,
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

            if (isFile(filePath)) {
                if (!ext) {
                    files.push(filePath);
                }
                else if (typeof ext == "string" && path.extname(filePath).substr(1) == ext) {
                    files.push(filePath);
                }
                else if (path.extname(filePath).substr(1).match(ext)) {
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



var DocumentorFlag = DocumentorBase.$extend({

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




var DocumentorItem = (function(){


    var DocumentorItem = DocumentorBase.$extend({

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
                    f = content instanceof DocumentorFlag ?
                            content :
                            new DocumentorFlag(flag, content, null, null, self.file);
                    self.flags[flag].push(f);
                    added.push(f);
                });
            }
            else {
                f = content instanceof DocumentorFlag ?
                        content :
                        new DocumentorFlag(flag, content, null, null, self.file);
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


        exportData: function(currentParent, noChildren) {

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
                    flags: {},
                    plainFlags: {},
                    booleanFlags: [],
                    children: {}
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
                    exprt.description.push(flag.exportData());
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
                            exprt.flags[k].push(flag.exportData());
                            exprt.plainFlags[k].push(flag.content);
                        }
                    });
                }
            }


            if (!noChildren) {

                self.eachItem(function (child) {

                    if (child.file.hidden) {
                        return;
                    }

                    var type = child.type;

                    if (!exprt.children.hasOwnProperty(type)) {
                        exprt.children[type] = [];
                    }

                    exprt.children[type].push(child.exportData(self));

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


    return DocumentorItem;


}());





/**
 * @class Comment
 */
var DocumentorComment = DocumentorBase.$extend({

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



function hideLinks(comment) {

    comment = comment.replace(/{\s*@(link|tutorial|code|page)[^{@]+}/ig, function(match){
        if (match.substr(match.length - 2) == '\\') {
            return match;
        }
        return '[#' + match.substring(2, match.length - 1) + ']';
    });

    return comment;

};



var DocumentorFile = function(){

    var all = {};

    /**
     * @class
     * @extends Base
     */
    var DocumentorFile = DocumentorBase.$extend({


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

                    cmtObj = new DocumentorComment({
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
                if (item && !(item instanceof DocumentorItem)) {
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

                        new DocumentorItem({
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
                all[filePath] = new DocumentorFile({
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

    return DocumentorFile;

}();



var DocumentorContent = DocumentorBase.$extend({

    id: null,
    group: null,
    content: null,
    title: null,
    description: null,
    file: null,
    fileType: null,

    $init: function(id, content) {

        var self = this;

        if (typeof id != "object") {
            self.id = id;
            self.content = content;
        }
        else {
            extend(self, id, true, false);
        }

        self.$super();
    },

    getContent: function() {

        if (this.file) {
            return fs.readFileSync(this.file).toString();
        }
        else {
            return this.content;
        }
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




(function(){

    var cache = Template.cache,
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

}());







var Documentor = DocumentorBase.$extend({

    files: null,
    root: null,
    hooks: null,
    id: null,
    map: null,
    content: null,

    $init: function(){

        var self = this;

        self.id = nextUid();
        self.files = {};
        self.map = {};
        self.content = [];
        self.root = new DocumentorItem({
            doc: self,
            type: "root",
            file: new DocumentorFile({
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


            var file = DocumentorFile.get(filePath, self, extend({}, options, {
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

    addHooks: function(dir) {

    },

    addContent: function(id, content) {
        this.content.push(new DocumentorContent(id, content));
    },

    prepare: function() {

        var self = this;

        self.loadTemplates(path.normalize(__dirname + "/../assets/templates"));

        self.eachItem("resolveFullName");
        self.eachItem("resolveInheritanceNames");
        self.eachItem("applyInheritance");
        self.eachItem("resolveOtherNames");

        self.pcall("prepareItems", self);
        self.pcall("prepaceContent", self);

        self.pcall("sortItems", self);
        self.pcall("sortContent", self);
    },


    eachItem: function(fn, context) {
        this.root.eachItem(fn, context);
    },


    loadTemplates: function(dir) {

        var self = this;

        self.eachHook(dir, "html", function(name, file){
            Template.cache.add(name, fs.readFileSync(file).toString());
        });
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
        DocumentorFile.clear();

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



var fsextra = require("fs.extra");

var DocumentorRenderer = DocumentorBase.$extend({

    doc: null,
    outDir: null,


    $init: function(doc, cfg) {
        
        var self = this;

        extend(self, cfg, true, false);

        self.doc = doc;
    },


    cleanupOutDir: function() {

    },

    copyToOut: function() {

    },

    writeOut: function(out) {
        if  (this.out) {
            fs.writeFileSync(this.out, out);
        }
        else {
            process.stdout.write(out);
        }
    },


    render: function() {

    }

});




var JsonFile = function(jsonFilePath) {

    var self    = this;

    self.path   = path.normalize(jsonFilePath);
    self.base   = path.dirname(self.path) + '/';
    self.build  = {};
    self.test   = [];
    self.push   = [];
    self.mixin  = {};

    var json    = require(self.path),
        key;

    for (key in json) {
        self[key] = json[key];
    }

    self.rawBuild   = self.build;
    self.build      = {};
};

JsonFile.prototype = {

    /**
     * @type {string}
     */
    path: null,

    /**
     * @type {string}
     */
    base: null,

    /**
     * @type {string}
     */
    target: null,

    /**
     * @type {bool}
     */
    compile: true,

    /**
     * @type {[]}
     */
    test: null,

    /**
     * @type {string}
     */
    version: null,

    /**
     * @type {[]}
     */
    push: null,

    /**
     * @type {Object}
     */
    mixin: null,

    /**
     * @type {Object}
     */
    build: null,

    /**
     * @type {Object}
     */
    rawBuild: null,

    getRawBuild: function(name) {
        return this.rawBuild[name];
    }

};

var all = {};

JsonFile.get = function(filePath) {
    filePath = path.normalize(filePath);
    if (!all[filePath]) {
        all[filePath] = new JsonFile(filePath);
    }
    return all[filePath];
};






var isFile = function(filePath) {
    return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
};




var isDir = function(dirPath) {
    return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
};



var resolveFileList = function(base, filename, ext) {

    var fileList,
        dir,
        filePath,
        levels = 0,
        files = [];

    if (filename.substr(filename.length - 1) == "*") {
        levels++;
    }
    if (filename.substr(filename.length - 2) == "**") {
        levels++;
    }

    var readDir = function(dir) {
        fileList    = fs.readdirSync(dir);

        fileList.forEach(function(filename) {
            filePath = path.normalize(dir + "/" + filename);
            if (isFile(filePath)) {
                if (!ext) {
                    files.push(filePath);
                }
                else if (typeof ext == "string" && path.extname(filePath) == "." + ext) {
                    files.push(filePath);
                }
                else if (path.extname(filePath).match(ext)) {
                    files.push(filePath);
                }
            }
            else if (isDir(filePath) && levels > 1) {
                readDir(filePath);
            }
        });
    };

    if (levels > 0) {
        dir     = path.normalize(base + filename.substr(0, filename.length - (levels + 1)));
        readDir(dir);
    }
    else {
        files   = [path.normalize(base + filename)];
    }

    return files;
};

var rStrict         = new RegExp("'use "+ "strict'|" + '"use ' + 'strict";?', "g"),
    rRequires       = /([^\s]+)\s*=\s*require\(['|"]([^)]+)['|"]\)\s*,?/,
    rInclude        = /[^=\s]?\s*(require\(['|"]([^)]+)['|"]\);?)/,
    rEmptyVar       = /var[\s|,]*;/g,
    rVarSpace       = /var\s+/g,
    rTrailComma     = /,\s*;/g,

    

    allFiles        = {},

    getOrCreate     = function(file) {

        if (!allFiles[file]) {
            allFiles[file] = new File(file);
        }

        return allFiles[file];
    };




var File = function(filePath, temporary) {

    var self    = this;

    self.base       = path.dirname(filePath) + "/";
    self.path       = filePath;
    self.as         = [];
    self.requires   = [];
    self.requiredBy = [];

    self.reqNames   = {};

    self.temporary  = temporary;

    self.process();
    self.findUnused();
};

File.prototype = {

    base: null,
    path: null,
    content: "",
    as: null,
    requires: null,
    requiredBy: null,
    processed: false,
    reqNames: null,

    temporary: false,

    /**
     * @param {Object} options
     * @returns {string}
     */
    getContent: function(options) {

        var self        = this,
            content     = self.content,
            as          = self.as.slice(),
            inx,
            match,
            name, funcName;

        options = options || {};

        if (!options.keepExports && content.indexOf("module.exports") != -1) {

            if (options.returnExports) {

                content     = content.replace(/module\.exports\s*=/, "return");

            }
            else {

                match       = /module\.exports\s*=\s*([^(\['"+. ]+)\s*;/.exec(content);
                name        = match ? match[1] : null;

                match       = /module\.exports\s*=\s*function\s+([^( ]+)/i.exec(content);
                funcName    = match ? match[1] : null;

                if (name && (inx = as.indexOf(name)) != -1) {
                    as.splice(inx, 1);
                }

                if (name && as.length == 0) {
                    content = content.replace(/module\.exports\s*=\s*[^;]+;/, "");
                }
                else {

                    if (as.length == 0 || (funcName && as.length == 1 && as[0] == funcName)) {
                        content = content.replace(/module\.exports\s*=\s*/, "");
                        //throw "No export names found for " + self.path + "; required by: " + self.requiredBy.join(", ");
                    }
                    else {

                        if (as.length > 1) {
                            content = "var " + as.join(", ") + ";\n" + content;
                            content = content.replace("module.exports", as.join(" = "));
                        }
                        else {

                            content = content.replace("module.exports", "var " + as[0]);
                        }
                    }
                }
            }

            content = content.replace(rStrict, "");
        }

        return content;
    },

    process:function() {

        var self        = this,
            content     = fs.readFileSync(self.path).toString(),
            base        = self.base,
            start       = 0,
            required,
            matches;

        if (self.processed) {
            return;
        }

        while (matches = rRequires.exec(content.substr(start))) {

            required    = matches[2];

            if (required.indexOf(".js") == -1) {
                start += matches.index + required.length;
                continue;
            }

            required    = path.normalize(base + required);
            content     = content.replace(matches[0], "");

            if (!isFile(required)) {
                throw required + " required in " + self.path + " does not exist";
            }

            self.reqNames[matches[1]] = required;

            required    = getOrCreate(required);
            required.addAs(matches[1]);

            if (required.doesRequire(self.path)) {
                throw "Two files require each other: " + required.path + " <-> " + self.path;
            }

            self.addRequired(required.path);
            required.addRequiredBy(self.path);
        }

        content = content.replace(rEmptyVar, "");
        content = content.replace(rTrailComma, ";");
        start   = 0;

        while (matches = rInclude.exec(content.substr(start))) {

            required    = matches[2];

            if (required.indexOf(".js") == -1) {
                start += required.length;
                continue;
            }

            content     = content.replace(matches[1], "");
            required    = path.normalize(base + required);

            if (!isFile(required)) {
                throw required + " required in " + self.path + " does not exist";
            }

            required    = getOrCreate(required);

            if (required.doesRequire(self.path)) {
                throw "Two files require each other: " + required.path + " <-> " + self.path;
            }

            self.addRequired(required.path);
            required.addRequiredBy(self.path);
        }


        self.content    = content;
        self.processed  = true;
    },

    doesRequire: function(file) {
        return this.requires.indexOf(file) != -1;
    },

    addRequired: function(file) {
        var self = this;

        if (self.requires.indexOf(file) == -1) {
            self.requires.push(file);
        }
    },

    addRequiredBy: function(file) {
        this.requiredBy.push(file);
    },

    addAs: function(as) {
        var self = this;

        if (as == "*") {
            as = path.basename(self.path, ".js");
        }

        if (self.as.indexOf(as) == -1) {
            self.as.push(as);
        }
    },

    findUnused: function() {
        var self        = this,
            content     = self.content,
            name,
            reg;

        for (name in self.reqNames) {

            reg = new RegExp('[^a-zA-Z0-9]'+name+'[^a-zA-Z0-9]');

            if (!content.match(reg)) {
                console.log("Unused requirement " + name + " in " + self.path);
            }
        }
    }
};

File.getOrCreate = getOrCreate;

File.exists = function(filePath) {
    return !!allFiles[filePath];
};

File.get = function(filePath) {
    return allFiles[filePath];
};

File.removeDupReqs = function(content) {

    var matches,
        required,
        name,
        start = 0,
        used = {};

    while (matches = rRequires.exec(content.substr(start))) {

        name        = matches[1];
        required    = matches[2];

        if (used[name]) {
            content = content.substr(0, start + matches.index) +
                      content.substr(start + matches.index + matches[0].length);
        }
        else {
            used[name] = true;
            start += matches.index + matches[0].length;
        }
    }

    content = content.replace(rEmptyVar, "");
    content = content.replace(rTrailComma, ";");
    content = content.replace(rVarSpace, "var ");

    return content;
};





var Build = function(jsonFile, name) {

    var self    = this;

    self.name           = name;
    self.jsonFile       = jsonFile;
    self.files          = [];
    self.fileOptions    = {};

    var raw = typeof name == "string" ?
                jsonFile.getRawBuild(name) || jsonFile.mixin[name] :
                name,
        key;

    if (raw) {
        for (key in raw) {
            self[key] = raw[key];
        }

        self.collectFiles(raw);
        self.prepareBuildList();
    }
};

Build.prototype = {

    /**
     * @type {string}
     */
    name: null,

    /**
     * @type {JsonFile}
     */
    jsonFile: null,

    /**
     * @type {[]}
     */
    files: null,

    /**
     * @type {[]}
     */
    buildList: null,

    /**
     * @type {bool}
     */
    wrap: false,

    /**
     * @type {string}
     */
    target: "",

    /**
     * @type {string}
     */
    specificTarget: null,

    /**
     * @type {bool}
     */
    compile: true,

    /**
     * @type {Object}
     */
    allOmits: null,

    /**
     * @type {Object}
     */
    allReplaces: null,

    /**
     * @type {object}
     */
    fileOptions: null,

    collectFiles: function(raw) {

        var self        = this,
            all         = {},
            allFiles    = [],
            allOmits    = {},
            allReplaces = {},

            addFile = function(path, props, temporary) {
                if (!all[path]) {
                    all[path] = props || {};
                }
                else {
                    var oldProps = all[path];
                    if (!oldProps) {
                        all[path] = props;
                    }
                    else {
                        var key, oldVal;
                        for (key in props) {
                            if (typeof oldProps[key] == "undefined") {
                                oldProps[key] = props[key];
                            }
                            else if (key == "as") {
                                oldVal = oldProps[key];
                                if (typeof oldVal == "string") {
                                    oldProps[key] = [oldVal];
                                }
                                oldProps[key].push(props[key]);
                            }
                        }
                    }
                }

                if (temporary) {
                    all[path].temporary = true;
                }
            },

            getMixin = function(jsonFile, name) {
                return jsonFile.mixin[name] || {};
            },

            renderMixin = function(jsonFile, name, props) {

                var raw = jsonFile.getRawBuild(name) || jsonFile.mixin[name],
                    ext = raw.extension || "js",
                    tmp = "/tmp/mjs-build-tmp-" + (new Date).getTime() + "." + ext,
                    r = require,
                    Builder = r("./Builder.js");

                raw.specificTarget = tmp;

                var builder = new Builder(raw, jsonFile);
                builder.build();

                addFile(tmp, props);
            },

            processMixin = function(mixin, jsonFile, props) {

                var files   = mixin.files || [],
                    omit    = mixin.omit || [],
                    replace = mixin.replace || [],
                    mixins  = mixin.mixins || [],
                    base    = jsonFile.base,
                    ext     = mixin.extension || "js";

                mixins.forEach(function(item){
                    if (typeof item == "string") {
                        processMixin(getMixin(jsonFile, item), jsonFile);
                    }
                    else {
                        var json = JsonFile.get(jsonFile.base + item[0]);
                        processMixin(getMixin(json, item[1]), json);
                    }
                });

                omit.forEach(function(omitFile){
                    var list = resolveFileList(jsonFile.base, omitFile, ext);
                    list.forEach(function(omitFile){
                        allOmits[omitFile] = true;
                    });
                });

                replace.forEach(function(row){
                    allReplaces[path.normalize(base + row[0])] = path.normalize(base + row[1]);
                });

                files.forEach(function(file){
                    processFileItem(file, jsonFile);
                });
            },

            processFileItem = function(fileDef, jsonFile){

                if (typeof fileDef == "string") {
                    fileDef = [fileDef];
                }

                var file = fileDef[0],
                    list,
                    json,
                    ext;

                // mixin
                if (file.indexOf('.') == -1 && file.indexOf('*') == -1) {
                    if (fileDef[1]) {
                        renderMixin(jsonFile, file, fileDef[1]);
                    }
                    else {
                        processMixin(getMixin(jsonFile, file), jsonFile);
                    }
                }
                else if (path.extname(file) == ".json") {
                    json = JsonFile.get(jsonFile.base + file);
                    if (fileDef[2]) {
                        renderMixin(json, fileDef[1], fileDef[2]);
                    }
                    else {
                        processMixin(getMixin(json, fileDef[1]), json);
                    }
                }
                else {
                    ext = path.extname(file).substr(1) || jsonFile.extension || "js";
                    list = resolveFileList(jsonFile.base, file, ext);
                    list.forEach(function(file){
                        addFile(file, fileDef[1]);
                    });
                }
            };

        processMixin(raw, self.jsonFile);

        var file;

        for (file in all) {
            while (allReplaces[file]) {
                file = allReplaces[file];
            }
            if (!allOmits[file]) {
                allFiles.push([file, all[file] || {}]);

                if (all[file]) {
                    self.fileOptions[file] = all[file];
                }
            }
        }

        self.allOmits = allOmits;
        self.allReplaces = allReplaces;
        self.files = allFiles;
    },

    prepareBuildList: function() {

        var self        = this,
            buildList   = [],
            included    = {},
            stack       = [],
            omit        = self.allOmits,
            replace     = self.allReplaces;

        var processFile = function(file) {

            stack.push(file.path);

            if (stack.length > 50) {
                console.log(stack);
                throw "Recursive requirement";
            }

            file.requires.forEach(function(requiredFile){
                while (replace[requiredFile]) {
                    requiredFile = replace[requiredFile];
                }
                if (!omit[requiredFile]) {
                    processFile(File.get(requiredFile));
                }
            });

            if (!included[file.path]) {
                included[file.path] = true;
                buildList.push(file.path);
            }

            stack.pop();
        };

        this.files.forEach(function(filePath){
            processFile(File.getOrCreate(filePath[0]));
        });

        var options = self.fileOptions;

        buildList.forEach(function(filePath){

            var opt = options[filePath],
                file;

            if (opt && opt.as) {
                file = File.getOrCreate(filePath);
                if (typeof opt.as == "string") {
                    file.addAs(opt.as);
                }
                else {
                    opt.as.forEach(function(as) {
                        file.addAs(as);
                    });
                }
            }

        });

        this.buildList = buildList;
    }

};





var minimist = require("minimist");

var DocumentorRunner = DocumentorBase.$extend({

    run: function(runCfg, runData, runOptions) {

        var self        = this,
            args        = minimist(process.argv.slice(2), {boolean: true}),
            profileName = args._[0] || "",
            json        = process.cwd() + "/metaphorjs.json",
            jsonFile    = fs.existsSync(json) ? new JsonFile(json) : null,
            profile     = jsonFile && jsonFile.docs && jsonFile.docs[profileName] ?
                          jsonFile.docs[profileName] : {},
            data        = extend({}, profile.data, runData, true, false),
            cfg         = extend({}, profile, runCfg, true, false),
            options     = extend({}, profile.options, runOptions, true, false),
            doc         = new Documentor;

        delete cfg.data;
        delete cfg.options;

        extend(data, self.prepareArgsData(args), true, false);
        extend(options, self.prepareArgsOptions(args), true, false);
        extend(cfg, self.prepareArgsCfg(args), true, false);

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

        if (cfg.files && jsonFile) {
            self.loadFiles(cfg, doc, jsonFile);
        }

        if (cfg.src) {
            self.loadSrc(cfg, doc, jsonFile);
        }

        if (cfg.templates) {
            self.loadTemplates(cfg, doc, jsonFile);
        }


        var rendererCls = doc.getRenderer(cfg.renderer || "default");

        if (!rendererCls) {
            throw "Cannot find renderer " + rendererCls;
        }

        doc.prepare();

        var renderer = new rendererCls(doc, extend({}, options, {

            data: data,
            out: cfg.out

        }, true, false));

        renderer.writeOut(renderer.render());
    },

    runInit: function(cfg, doc, jsonFile) {

        var initFile = this.preparePath(cfg.init, jsonFile),
            r = require;

        if (initFile) {
            r(initFile)(doc);
        }
    },

    loadFiles: function(cfg, doc, jsonFile) {
        var build = new Build(jsonFile);
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

    loadTemplates: function(cfg, doc, jsonFile) {

        if (typeof cfg.templates == "string") {
            cfg.templates = [cfg.templates];
        }

        var self = this;

        cfg.templates.forEach(function(hoorDir){

            var dir = self.preparePath(hoorDir, jsonFile);

            if (dir) {
                doc.loadTemplates(dir);
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

    run: function() {

        var runner = new DocumentorRunner;
        runner.run();

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

    var classes = function(name, displayName, groupName) {
        return {
            name: name,
            children: ["method", "property", "const", "event", "!param"],
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

var fse = require("fs.extra"),
    jsdom = require("jsdom");


globalCache.add("renderer.default", DocumentorRenderer.$extend({

    data: null,
    templateDir: null,
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
            self.templateDir = path.normalize(__dirname + "/../assets/renderer/default");
        }

        self.doc.loadTemplates(self.templateDir + "/templates");

        self.types = {};

        self.data.items = [];

        if (!self.data.topMenu) {
            self.data.topMenu = [];
            self.prepareTopMenu();
        }

        self.prepareSections();
    },

    getType: function(type, file) {

        var self = this,
            ext = file.ext;

        if (!self.types[ext + ":" + type]) {
            self.types[ext + ":" + type] = file.pcall("getItemType", type, file);
        }

        return self.types[ext + ":" + type];
    },

    prepareTopMenu: function() {

        var self = this,
            rootItems = self.doc.root.items,
            k,
            type,
            navItem,
            added = false;

        for (k in rootItems) {

            type = self.getType(k, rootItems[k][0].file);
            added = false;

            navItem = {
                id: k,
                name: type.groupName,
                sub: []
            };

            rootItems[k].forEach(function(item){

                if (item.file.hidden) {
                    return;
                }

                if (!added) {
                    self.data.items.push({
                        type: k,
                        name: type.groupName,
                        items: []
                    });
                    added = true;
                }

                navItem.sub.push({
                    id: item.fullName,
                    name: item.name
                });
            });

            if (navItem.sub.length) {
                self.data.topMenu.push(navItem);
            }
        }
    },

    prepareSections: function() {

        var self = this,
            root = self.doc.root,
            type,
            items;

        self.data.items.forEach(function(section, inx){
            type = section.type;
            items = root.items[type];

            items.forEach(function(item){
                if (!item.file.hidden) {
                    self.data.items[inx].items.push(item.exportData());
                }
            });
        });

    },

    render: function() {

        var self = this,
            tplDir = self.templateDir,
            index = tplDir + "/index.html",
            tpl = fs.readFileSync(index).toString();

        var doc = jsdom.jsdom(tpl);

        MetaphorJs.setWindow(doc.parentWindow);

        var appNodes    = select("[mjs-app]", doc),
            i, l, el;

        for (i = -1, l = appNodes.length; ++i < l;){
            el = appNodes[i];
            initApp(el, getAttr(el, "mjs-app"), self.data, true);
        }

        return jsdom.serializeDocument(doc);

    },

    writeOut: function(out) {

        var outDir = this.out,
            tplDir = this.templateDir;

        if (fs.existsSync(outDir + "/bower_components")) {
            fse.rmrfSync(outDir + "/bower_components");
        }

        if (fs.existsSync(outDir + "/style.css")) {
            fse.rmrfSync(outDir + "/style.css");
        }

        fse.copyRecursive(tplDir + "/bower_components", outDir + "/bower_components", function(){
            fse.copy(tplDir + "/style.css", outDir + "/style.css", function(){
                fs.writeFileSync(outDir + "/index.html", out);
            });
        });
    }


}, {
    defaultData: {
        title: "",
        description: "",
        footer: "",
        topRightMenu: null
    }
}));



globalCache.add("renderer.json", DocumentorRenderer.$extend({

    render: function() {
        return JSON.stringify(this.doc.exportData(), null, 2);
    }

}));







globalCache.add("renderer.raw", DocumentorRenderer.$extend({

    render: function() {
        return this.doc.exportData();
    },

    writeOut: function(out) {
        console.log(out);
    }

}));


Documentor['DocumentorRenderer'] = DocumentorRenderer;
Documentor['DocumentorItem'] = DocumentorItem;
Documentor['DocumentorBase'] = DocumentorBase;
Documentor['DocumentorFile'] = DocumentorFile;
Documentor['DocumentorComment'] = DocumentorComment;
Documentor['DocumentorRunner'] = DocumentorRunner;
Documentor['MetaphorJs'] = MetaphorJs;
Documentor['hooks'] = globalCache;
module.exports = Documentor;
