
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
        'string': 0,
        'number': 1,
        'boolean': 2,
        'object': 3,
        'function': 4,
        'array': 5,
        'null': 6,
        'undefined': 7,
        'NaN': 8,
        'regexp': 9,
        'date': 10
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



var Namespace = function(){

    /**
     * @param {Object} root optional; usually window or global
     * @param {String} rootName optional. If you want custom object to be root and
     * this object itself if the first level of namespace:<br>
     * <pre><code class="language-javascript">
     * var ns = MetaphorJs.lib.Namespace(window);
     * ns.register("My.Test", something); // -> window.My.Test
     * var privateNs = {};
     * var ns = new MetaphorJs.lib.Namespace(privateNs, "privateNs");
     * ns.register("privateNs.Test", something); // -> privateNs.Test
     * </code></pre>
     * @constructor
     */
    var Namespace   = function(root, rootName) {

        var cache   = {},
            self    = this;

        if (!root) {
            if (typeof global != strUndef) {
                root    = global;
            }
            else {
                root    = window;
            }
        }

        var normalize   = function(ns) {
            if (ns && rootName && ns.indexOf(rootName) !== 0) {
                return rootName + "." + ns;
            }
            return ns;
        };

        var parseNs     = function(ns) {

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

                    if (rootName && i == 0) {
                        if (name == rootName) {
                            current = root;
                            continue;
                        }
                        else {
                            ns = rootName + "." + ns;
                        }
                    }

                    if (current[name] === undf) {
                        current[name]   = {};
                    }

                    current = current[name];
                }
            }
            else {
                if (rootName) {
                    ns = rootName + "." + ns;
                }
            }

            return [current, last, ns];
        };

        /**
         * Get namespace/cache object
         * @function MetaphorJs.ns.get
         * @param {string} ns
         * @param {bool} cacheOnly
         * @returns {object} constructor
         */
        var get       = function(ns, cacheOnly) {

            if (cache[ns] !== undf) {
                return cache[ns];
            }

            if (rootName && cache[rootName + "." + ns] !== undf) {
                return cache[rootName + "." + ns];
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

                if (rootName && i == 0) {
                    if (name == rootName) {
                        current = root;
                        continue;
                    }
                }

                if (current[name] === undf) {
                    return undf;
                }

                current = current[name];
            }

            if (current) {
                cache[ns] = current;
            }

            return current;
        };

        /**
         * Register class constructor
         * @function MetaphorJs.ns.register
         * @param {string} ns
         * @param {*} value
         */
        var register    = function(ns, value) {

            var parse   = parseNs(ns),
                parent  = parse[0],
                name    = parse[1];

            if (isObject(parent) && parent[name] === undf) {

                parent[name]        = value;
                cache[parse[2]]     = value;
            }

            return value;
        };

        /**
         * Class exists
         * @function MetaphorJs.ns.exists
         * @param {string} ns
         * @returns boolean
         */
        var exists      = function(ns) {
            return cache[ns] !== undf;
        };

        /**
         * Add constructor to cache
         * @function MetaphorJs.ns.add
         * @param {string} ns
         * @param {*} value
         */
        var add = function(ns, value) {
            if (rootName && ns.indexOf(rootName) !== 0) {
                ns = rootName + "." + ns;
            }
            if (cache[ns] === undf) {
                cache[ns] = value;
            }
            return value;
        };

        var remove = function(ns) {
            delete cache[ns];
        };

        self.register   = register;
        self.exists     = exists;
        self.get        = get;
        self.add        = add;
        self.remove     = remove;
        self.normalize  = normalize;
    };

    Namespace.prototype.register = null;
    Namespace.prototype.exists = null;
    Namespace.prototype.get = null;
    Namespace.prototype.add = null;
    Namespace.prototype.remove = null;
    Namespace.prototype.normalize = null;

    var globalNs;

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

            $getClass: function() {
                return this.$class;
            },

            $getParentClass: function() {
                return this.$extends;
            },

            $intercept: function(method, fn, newContext, when, replaceValue) {
                var self = this;
                self[method] = intercept(self[method], fn, newContext || self, self, when, replaceValue);
            },

            $implement: function(methods) {
                var $self = this.constructor;
                if ($self && $self.$parent) {
                    preparePrototype(this, methods, $self.$parent);
                }
            },

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

            destroy: function(){}
        });

        BaseClass.$self = BaseClass;

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

        BaseClass.$override = function(methods) {
            var $self = this.$self,
                $parent = this.$parent;

            if ($self && $parent) {
                preparePrototype($self.prototype, methods, $parent);
            }
        };

        BaseClass.$extend = function(definition, statics) {
            return define(definition, statics, this);
        };


        /**
         * @namespace MetaphorJs
         */


        /**
         * Define class
         * @function MetaphorJs.define
         * @param {object} definition
         * @param {object} statics (optional)
         * @return function New class constructor
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
         * Instantiate class
         * @function MetaphorJs.create
         * @param {string} name Full name of the class
         */
        var instantiate = function(name) {

            var cls     = ns.get(name),
                args    = slice.call(arguments, 1);

            if (!cls) {
                throw name + " not found";
            }

            return cls.$instantiate.apply(cls, args);
        };



        /**
         * Is cmp instance of cls
         * @function MetaphorJs.is
         * @param {object} cmp
         * @param {string|object} cls
         * @returns boolean
         */
        var isInstanceOf = function(cmp, cls) {
            var _cls    = isString(cls) ? ns.get(cls) : cls;
            return _cls ? cmp instanceof _cls : false;
        };



        /**
         * Is one class subclass of another class
         * @function MetaphorJs.isSubclass
         * @param {string|object} childClass
         * @param {string|object} parentClass
         * @return bool
         * @alias MetaphorJs.iss
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

        self.factory = instantiate;
        self.isSubclassOf = isSubclassOf;
        self.isInstanceOf = isInstanceOf;
        self.define = define;
        self.BaseClass = BaseClass;

    };

    Class.prototype = {

        factory: null,
        isSubclassOf: null,
        isInstanceOf: null,
        define: null
    };

    var globalCs;

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


var Base = cs.define({

    $constructor: function(cfg) {
        extend(this, cfg, true, false);
        this.$super(cfg);
    }
});



/**
 * @function trim
 * @param {String} value
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


var calcCurlies = function(line) {

    var i, l,
        char,
        left = 0,
        right = 0;

    for (i = 0, l = line.length; i < l; i++) {
        char = line.charAt(i);
        if (char == '{') {
            left++;
        }
        else if (char == '}') {
            right++;
        }
    }

    return [left, right];
};




/**
 * @class Comment
 */
var Comment = Base.$extend({

    comment: null,
    doc: null,
    file: null,
    startIndex: null,
    endIndex: null,
    parts: null,

    /**
     * @param {object} cfg {
     *      @type {string} a
     *      @type {string} b
     * }
     */
    $init: function() {
        this.parts = [];
        this.$super();
    },

    parse: function() {

        this.removeAsterisk();
        this.parts = this.splitParts(this.comment);
        this.sortParts();
    },

    hasFlag: function(flag) {

        var parts = this.parts,
            i, l;

        for (i = 0, l = parts.length; i < l; i++) {
            if (parts[i].type == flag) {
                return true;
            }
        }

        return false;
    },

    determineType: function(currentContext) {

        var parts   = this.parts,
            doc     = this.doc,
            part,
            i, l;

        for (i = 0, l = parts.length; i < l; i++) {
            part = parts[i];
            if (doc.getItemType(part.type)) {
                return;
            }
        }

        var ext     = doc.getExtension(this.file),
            itemType;

        if (this.hasFlag("return") || this.hasFlag("returns")) {
            itemType = "function";
        }

        if (ext && (part = ext.getTypeAndName(this.file, this.endIndex, currentContext, itemType))) {
            parts.unshift(part);
            return;
        }

        this.parts = [];
    },

    sortParts: function() {

        var parts = this.parts,
            types = this.doc.getItemTypes(),
            compare = function(a, b) {
                var atype = types[a.type],
                    btype = types[b.type],
                    apri, bpri;

                if (!atype && !btype) {
                    return 0;
                }
                else if (atype && !btype) {
                    return -1;
                }
                else if (!atype && btype) {
                    return 1;
                }

                apri = atype.priority;
                bpri = btype.priority;

                if (apri == bpri) {
                    return 0;
                }
                else if (apri === undf || apri > bpri) {
                    return 1;
                }
                else if (bpri === undf || apri < bpri) {
                    return -1;
                }
            };

        parts.sort(compare);
    },

    splitDeepParts: function(text) {

        var lines   = text.split("\n"),
            fline   = lines.shift(),
            lline   = lines.pop(),
            parts   = this.splitParts(lines.join("\n")),
            i       = fline.length;

        while (i > 0) {
            if (fline.charAt(i) == '{') {
                fline = trim(fline.substring(0, i - 1));
                parts.unshift({type: "description", content: fline});
                break;
            }
            i--;
        }

        return parts;
    },

    splitParts: function(text) {

        var lines = text.split("\n"),
            parts = [],
            line,
            left, right,
            crls,
            flag,
            deep = false,
            part = "",
            i, l;



        for (i = 0, l = lines.length; i < l; i++) {

            line = lines[i];

            if (trim(line).charAt(0) == '@') {

                if (part) {
                    parts.push({type: flag || "description", content: part});
                    part = "";
                    flag = null;
                }

                flag    = line.match(/@[^\s]+/)[0].substr(1);
                line    = trim(line.substr(line.indexOf('@' + flag) + flag.length + 1));
                crls    = calcCurlies(line);
                left    = crls[0];
                right   = crls[1];
                part    = line;
                deep    = false;

                while (left != right) {
                    line    = lines[++i];
                    crls    = calcCurlies(line);
                    left   += crls[0];
                    right  += crls[1];
                    part   += "\n" + line;
                    deep    = true;
                }

                if (deep) {
                    part = this.splitDeepParts(part);
                    parts.push({type: flag, content: part});
                    part = "";
                    flag = null;
                }
            }
            else {
                part += line;
            }
        }

        if (part || flag) {
            parts.push({type: flag || "description", content: part});
        }

        return parts;
    },

    removeAsterisk: function() {

        var text    = this.comment,
            lines   = text.split("\n"),
            min     = 1000,
            line,
            i, l,
            j, jl;

        for (i = 0, l = lines.length; i < l; i++) {
            line = trim(lines[i]);
            line = line.substr(1);
            lines[i] = line;

            for (j = 0, jl = line.length; j < jl; j++) {
                if (line.charAt(j) != " ") {
                    min = Math.min(min, j);
                    break;
                }
            }
        }

        for (i = 0, l = lines.length; i < l; i++) {
            lines[i] = lines[i].substr(min);
        }

        this.comment = trim(lines.join("\n"));
    }

});


var fs = require("fs");

var isDir = function(dirPath) {
    return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
};



var isFile = function(filePath) {
    return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
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



/**
 * @class Parser
 */
var Parser = Base.$extend({

    /**
     * @type {Documentor}
     */
    doc: null,
    file: null,
    comments: null,

    $init: function() {

        this.comments = [];
        this.$super();
    },

    /**
     * @method
     */
    parse: function() {

        var self = this,
            content = self.file.getContent(),
            i = 0,
            l = content.length,
            char,
            comment,
            nexti;

        while (i < l) {

            char = content.charAt(i);

            if (char == '"' || char == "'") {
                nexti = content.indexOf(char, i+1);
                while (content.charAt(nexti - 1) == '\\') {
                    nexti = content.indexOf(char, nexti+1);
                }

                if (nexti == -1) {
                    break;
                }

                i = nexti + 1;
                continue;
            }

            // comment start
            if (char == '*' && content.charAt(i - 1) == '*' && content.charAt(i - 2) == '/') {
                nexti = content.indexOf('*/', i + 1);

                if (nexti == -1) {
                    break;
                }

                comment = content.substring(i, nexti);
                self.parseComment(comment, i - 2, nexti + 2);
                i = nexti;
                continue;
            }

            i++;
        }
    },

    parseComment: function(commentText, commentStart, commentEnd) {

        var comment = new Comment({
            comment: commentText,
            doc: this.doc,
            file: this.file,
            startIndex: commentStart,
            endIndex: commentEnd
        });

        comment.parse();

        this.comments.push(comment);
    }


});



var File = function(){

    var all = {};

    var File = Base.$extend({


        /**
         * @type string
         */
        path: null,

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


        $init: function () {

            this.contextStack = [this.doc.root];
            this.comments = [];
            this.dir = path.dirname(this.path);
            this.ext = path.extname(this.path).substr(1);

        },

        getContent: function () {
            return fs.readFileSync(this.path).toString();
        },

        parse: function () {

            var parser = new Parser({
                file: this,
                doc:  this.doc
            });

            parser.parse();

            this.comments = parser.comments;

            parser.$destroy();

            this.processComments();
        },

        isPending: function () {
            return this.comments.length > 0;
        },

        processComments: function () {

            var cmts = this.comments,
                parts,
                context,
                j, jl,
                i, l,
                cmt;

            for (i = 0, l = cmts.length; i < l; i++) {
                cmt = cmts[i];
                cmt.determineType(this.getCurrentContext());

                parts = cmt.parts;
                for (j = 0, jl = parts.length; j < jl; j++) {
                    this.processCommentPart(parts[j], cmt);
                }

                context = this.getCurrentContext();
                if (context.constructor.onePerComment) {
                    this.contextStack.pop();
                }
            }
        },

        processCommentPart: function (part, comment) {

            var type = part.type,
                typeClass = this.doc.getItemType(type),
                contextStack = this.contextStack,
                context,
                stackInx,
                item, name,
                i, l, cl;

            if (!typeClass) {

                if (!contextStack.length) {
                    return;
                }

                context = contextStack[contextStack.length - 1];

                return context.addFlag(part.type, part.content);
            }
            else {

                if (!typeClass.parents) {
                    console.log(type);
                    throw "parents undefined";
                }

                stackInx = this.findParent(typeClass.parents);

                if (stackInx == -1) {
                    var req = typeClass.createRequiredContext(part, comment, this.doc, this);
                    if (req) {
                        this.processCommentPart(req, comment);
                        this.processCommentPart(part, comment);
                    }
                    return;
                }

                context = contextStack[stackInx];

                name = part.name || typeClass.getItemName(part.content, comment, this.doc, this, context, type);



                item = context.getItem(type, name) ||
                        new typeClass({
                            doc: this.doc,
                            file: this,
                            name: name,
                            comment: comment
                        });


                if (typeof part.content == "string") {
                    item.addFlag(part.type, part.content);

                    if (!context.getItem(type, name)) {
                        context.addItem(item);
                    }
                    contextStack.length = stackInx + 1;

                    if (typeClass.stackable) {
                        contextStack.push(item);
                    }
                }
                else {

                    if (!context.getItem(type, name)) {
                        context.addItem(item);
                    }

                    cl = contextStack.length;
                    contextStack.push(item);

                    for (i = 0, l = part.content.length; i < l; i++) {
                        this.processCommentPart(part.content[i], comment);
                    }

                    contextStack.length = cl;


                }
            }
        },

        findParent: function(parents) {

            var stack = this.contextStack,
                i, il,
                j,
                parent;

            for (i = 0, il = parents.length; i < il; i++) {

                parent = parents[i];

                for (j = stack.length - 1; j >= 0; j--) {

                    if (stack[j].type == parent) {
                        return j;
                    }
                }
            }

            return -1;
        },

        getCurrentContext: function() {
            return this.contextStack[this.contextStack.length - 1];
        }

    }, {

        get: function(filePath, doc) {
            if (!all[filePath]) {
                all[filePath] = new File({
                    path: filePath,
                    doc: doc
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



var Extension = Base.$extend({


    resolveIncludes: function(file) {
        return [];
    },

    getTypeAndName: function(file, start, context) {
        return null;
    },

    normalizeType: function(type) {
        return type;
    }


});




var JsExt = Extension.$extend({

    resolveIncludes: function(file) {

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
    },

    getTypeAndName: function(file, startIndex, context, itemType) {

        var classLike = context ? context.constructor.classLike : false,
            content = file.getContent(),
            part = content.substr(startIndex, 200),
            rVar = /var\s+([^\s]+)\s*=\s*([^\s(;]+)/,
            rProp = /\s*(['"$a-zA-Z0-9\-_]+)\s*:\s*([^\s(;]+)/,
            rFunc = /(return|;|=)\s*function\s+([^(]+)/,
            rNamedFunc = /(['"$a-zA-Z0-9\-_\.]+)\s*[=:]\s*function\s*(\(|[$a-zA-Z0-9_]+)/,
            isFunc = null,
            isProp = null,
            name, type,
            match,
            inx;

        inx = part.indexOf('/**');
        if (inx > -1) {
            part = part.substr(0, inx);
        }

        if (itemType) {
            isFunc = itemType == "function" || itemType == "method";
            isProp = itemType == "type" || itemType == "property" || itemType == "var" || itemType == "param";
        }

        if ((isFunc === null || isFunc === true) && (match = part.match(rFunc))) {
            name = trim(match[2]);
            type = "function";
        }
        else if ((isFunc === null || isFunc === true) && (match = part.match(rNamedFunc))) {
            name = trim(match[2]);
            if (name == '(') {
                name = trim(match[1]);
                name = name.replace(/['"]/g, "");
                var tmp = name.split(".");
                name = tmp.pop();
            }
            type = "function";
        }
        else if ((isProp === null || isProp === true) && (match = part.match(rVar))) {
            name = trim(match[1]);
            type = trim(match[2]);
        }
        else if ((isProp === null || isProp === true) && (match = part.match(rProp))) {
            name = trim(match[1]);
            type = trim(match[2]);
        }


        if (type && name) {
            if (type == "function") {
                type = classLike ? "method" : "function";
            }
            else {
                type = classLike ? "property" : "var";
            }
            return {type: type, name: name, content: ""};
        }
    },

    normalizeType: function(type) {
        return this.constructor.types[type.toLowerCase()] || type;
    }

}, {


    types: {
        "{}": "object",
        "[]": "array",
        "bool": "boolean",
        "string": "string",
        "object": "object",
        "array": "array",
        "boolean": "boolean",
        "function": "function"
    }


});




var Item = Base.$extend({

    doc: null,
    file: null,
    type: null,
    name: null,
    items: null,
    flags: null,
    map: null,
    ignore: false,
    comment: null,
    line: null,

    $init: function() {

        this.flags = {};
        this.items = {};
        this.map = {};

        if (this.file && this.comment && this.constructor.stackable) {
            var inx = this.comment.endIndex,
                content = this.file.getContent(),
                part = content.substr(0, inx);

            this.line = part.split("\n").length;
        }

        this.$super();
    },

    getItem: function(type, name) {
        var id = type +"-"+ name;
        return this.map[id] || null;
    },

    addItem: function(item) {
        var type = item.type;
        if (!this.items[type]) {
            this.items[type] = [];
        }
        this.items[type].push(item);

        if (item.name) {
            var id = item.type + "-" + item.name;
            this.map[id] = item;
        }
    },

    addFlag: function(flag, content) {

        switch (flag) {
            case this.type:
                this.processOwnFlag(content);
                break;
            case "ignore":
                this.ignore = true;
                break;
            case "required":
                this.flags[flag] = true;
                break;
            case "public":
            case "protected":
            case "private":
                this.flags['access'] = flag;
                break;
            default:
                this.flags[flag] = content;
                break;
        }
    },

    processOwnFlag: function(content) {

    },


    getData: function() {

        var exprt = {
            name:  this.name,
            flags: this.flags
        };

        if (this.constructor.stackable) {
            if (this.file) {
                exprt.file = this.file.path;
            }
            if (this.line) {
                exprt.line = this.line;
            }
        }

        var items = this.items,
            key, i, l,
            item;

        for (key in items) {
            exprt[key] = [];

            for (i = 0, l = items[key].length; i < l; i++) {
                item = items[key][i];
                if (!item.ignore) {
                    exprt[key].push(item.getData());
                }
            }
        }

        return exprt;
    }

}, {

    createRequiredContext: function(commentPart, comment, doc, file) {
        return null;
    },

    getItemName: function(flagString, comment, doc, file, context, itemType) {
        if (flagString) {
            return flagString;
        }
        else {

            var parts = comment.parts,
                i, l;

            for (i = 0, l = parts.length; i < l; i++) {
                if (parts[i].type == "name") {
                    return parts[i].content;
                }
            }

            var ext = doc.getExtension(file);
            if (ext) {
                var part = ext.getTypeAndName(file, comment.endIndex, context, itemType);
                if (part) {
                    return part.name;
                }
            }
        }
        return null;
    }

});



var Root = Item.$extend({

    $class: "item.Root",
    type: "root"


}, {

    parents: []

});



var Renderer = Base.$extend({

    doc: null,

    render: function() {

    }

});



/**
 * Returns 'then' function or false
 * @param {*} any
 * @returns {Function|boolean}
 */
function isThenable(any) {
    if (!any || !any.then) {
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
     * @param {Function} fn -- function(resolve, reject)
     * @param {Object} fnScope
     * @returns {Promise}
     * @constructor
     */
    var Promise = function(fn, fnScope) {

        if (fn instanceof Promise) {
            return fn;
        }

        if (!(this instanceof Promise)) {
            return new Promise(fn, fnScope);
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
                    fn.call(fnScope,
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
         * @param {Object} fnScope -- function's "this" object
         * @returns {Promise} same promise
         */
        done: function(fn, fnScope) {
            var self    = this,
                state   = self._state;

            if (state == FULFILLED && self._wait == 0) {
                try {
                    fn.call(fnScope || null, self._value);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
            else if (state == PENDING) {
                self._dones.push([fn, fnScope]);
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
         * @param {Object} fnScope -- function's "this" object
         * @returns {Promise} same promise
         */
        fail: function(fn, fnScope) {

            var self    = this,
                state   = self._state;

            if (state == REJECTED && self._wait == 0) {
                try {
                    fn.call(fnScope || null, self._reason);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
            else if (state == PENDING) {
                self._fails.push([fn, fnScope]);
            }

            return self;
        },

        /**
         * @param {Function} fn -- function to call when promise resolved or rejected
         * @param {Object} fnScope -- function's "this" object
         * @return {Promise} same promise
         */
        always: function(fn, fnScope) {
            this.done(fn, fnScope);
            this.fail(fn, fnScope);
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


    Promise.fcall = function(fn, context, args) {
        return Promise.resolve(fn.apply(context, args || []));
    };

    /**
     * @param {*} value
     * @returns {Promise}
     */
    Promise.resolve = function(value) {
        var p = new Promise;
        p.resolve(value);
        return p;
    };


    /**
     * @param {*} reason
     * @returns {Promise}
     */
    Promise.reject = function(reason) {
        var p = new Promise;
        p.reject(reason);
        return p;
    };


    /**
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
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
     */
    Promise.when = function() {
        return Promise.all(arguments);
    };

    /**
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
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





Item.$extend({

    $class: "item.Class",
    type: "class"

}, {

    priority: 20,
    stackable: true,
    classLike: true,
    parents: ["namespace", "root"]

});

var getCurly = function(content) {

    var left = 0,
        right = 0,
        i, l,
        first = null, last,
        char;

    for (i  = 0, l = content.length; i < l; i++) {

        char = content.charAt(i);

        if (char == '{') {
            left++;
            if (first === null) {
                first = i + 1;
            }
        }
        else if (char == '}') {
            right++;
        }

        if (left > 0 && left == right) {
            last = i;
            break;
        }
    }

    if (first && last) {
        return content.substring(first, last);
    }
};



Item.$extend({

    $class: "item.Function",
    type: "function",

    addFlag: function(flag, content) {

        switch (flag) {
            case "return":
            case "returns":
                if (content.charAt(0) == '{') {
                    var curly = getCurly(content);
                    this.flags["returns"] = this.doc.normalizeType(curly, this.file);
                    content = trim(content.replace('{' + curly + '}', ''));
                    if (content) {
                        this.flags['returnDescription'] = content;
                    }
                }
                else {
                    this.flags["returns"] = this.doc.normalizeType(content, this.file);
                }
                break;
            case "constructor":
                break;

            default:
                this.$super(flag, content);
        }

    }

}, {

    priority: 30,
    stackable: true,
    onePerComment: true,
    parents: ["param", "property", "class", "interface", "mixin", "trait", "namespace", "root"]

});



cs.define({

    $class: "item.Method",
    $extends: "item.Function",
    type: "method",


    addFlag: function(flag, content) {

        switch (flag) {
            case "constructor":
                this.flags[flag] = true;
                break;
            default:
                this.$super(flag, content);
                break;
        }
    }

}, {

    priority: 20,
    stackable: true,
    parents: ["class", "interface", "mixin", "trait"]

});



Item.$extend({

    $class: "item.Namespace",
    type: "namespace"

}, {

    priority: 10,
    stackable: true,
    parents: ["root"]

});



Item.$extend({

    $class: "item.Var",
    type: "var",

    addFlag: function(flag, content) {
        switch (flag) {
            case "description":
                if (!this.flags['type'] && !this.flags['description']) {
                    this.processOwnFlag(content);
                }
                break;
            default:
                this.$super(flag, content);
                break;
        }
    },

    processOwnFlag: function(content) {

        if (content.charAt(0) == '{') {
            var curly = getCurly(content);
            this.flags["type"] = this.doc.normalizeType(curly, this.file);
            content = trim(content.replace('{' + curly + '}', ""));
        }

        var inx = content.indexOf(" ");
        if (inx > -1) {
            content = trim(content.substr(inx));

            if (content) {
                this.flags['description'] = content;
            }
        }

    }

}, {

    priority: 50,
    stackable: false,
    parents: ["class", "interface", "mixin", "namespace", "root"],

    getItemName: function(flagString, comment, doc, file, context, type) {

        var left = 0,
            right = 0,
            name,
            i, l,
            char;

        flagtype: while (typeof flagString != "string") {
            for (i = 0, l = flagString.length; i < l; i++) {
                if (flagString[i].type == "description") {
                    flagString = flagString[i].content;
                    continue flagtype;
                }
            }
            break;
        }

        flagString = trim(flagString);

        if (flagString.charAt(0) == '{') {

            for (i = 0, l = flagString.length; i < l; i++) {
                char = flagString.charAt(i);
                if (char == '{') {
                    left++;
                }
                else if (char == '}') {
                    right++;
                }
                if (left > 0 && left == right) {
                    flagString = trim(flagString.substr(i + 1));
                    if (flagString) {
                        name = flagString.split(" ").shift();
                        return name;
                    }
                }
            }
        }

        if (flagString) {
            var tmp = flagString.split(" ");

            switch (tmp.length) {
                case 0:
                    return null;
                case 1:
                    return tmp[0];
                default:
                    return tmp[1];
            }
        }

        var ext = doc.getExtension(file);
        if (ext) {
            var part = ext.getTypeAndName(file, comment.endIndex, context, type);

            if (part) {
                return part.name;
            }
        }

        return null;
    }

});



cs.define({

    $class: "item.Property",
    $extends: "item.Var",
    type: "property",

    addFlag: function(flag, content) {

        switch (flag) {
            case "type":
                this.processOwnFlag(content);
                break;
            default:
                this.$super(flag, content);
                break;
        }
    }

}, {

    priority: 40,
    stackable: false,
    parents: ["property", "param", "var", "class", "interface", "mixin", "trait"]

});




ns.add("renderer.json", Renderer.$extend({

    render: function() {
        return JSON.stringify(this.doc.getData());
    }

}, {
    mime: "application/json"
}));
















var Documentor = Base.$extend({

    files: null,
    ext: null,
    types: null,
    cs: null,
    ns: null,
    root: null,
    argv: null,

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

    getRenderer: function(name){
        return ns.get("renderer." + name, true);
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

    normalizeType: function(type, file) {

        var ext = this.getExtension(file),
            i, l;

        if (type.indexOf("|") != -1) {
            type = type.split("|");
        }
        else {
            type = [type];
        }

        if (ext) {
            for (i = 0, l = type.length; i < l; i++) {
                type[i] = ext.normalizeType(type[i]);
            }
        }

        return type;
    },

    getData: function() {
        return this.root.getData();
    },

    render: function() {

    },

    clear: function() {
        File.clear();
    }
}, {
    RendererBase: Renderer
});




cs.define({

    $class: "item.Param",
    $extends: "item.Var",
    type: "param"

}, {

    createRequiredContext: function(commentPart, comment, doc, file) {

        var ext = doc.getExtension(file);

        if (ext) {
            return ext.getTypeAndName(file, comment.endIndex, file.getCurrentContext(), "function");
        }

        return null;
    },

    priority: 40,
    stackable: false,
    parents: ["method", "function"]

});




ns.add("renderer.plain", Renderer.$extend({

    render: function() {

        var data = this.doc.getData(),
            html = "<ul>",
            keys = ["param", "var", "function", "namespace", "class", "property", "method"];

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
                    html += ' : '+ (item.flags.returns.join(" | "));
                }
            }

            html += '</p>';

            if (item.flags.description) {
                html += item.flags.description;
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

            html += '</li>';

        };

        renderItem(null, data);

        html += '</ul>';

        return html;
    }

}, {
    mime: "text/html"
}));






ns.add("renderer.raw", Renderer.$extend({

    render: function() {
        return this.doc.getData();
    }

}));


module.exports = Documentor;
