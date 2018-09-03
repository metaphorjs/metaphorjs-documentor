var cs = require("metaphorjs-class/src/var/cs.js"),
    isPlainObject = require("metaphorjs/src/func/isPlainObject.js"),
    extend = require("metaphorjs/src/func/extend.js");

/**
 * @class Base
 */
module.exports = cs.define({

    /**
     * @ignore
     */
    $constructor: function(cfg) {
        if (isPlainObject(cfg)) {
            extend(this, cfg, true, false);
        }
        this.$super(cfg);
    },

    /**
     * Call a plugin function and pass parameters to it. Plugins are 
     * js files from local <code>hooks</code> directory 
     * (or one of your directories) containing functions, scalar
     * values and any other stuff. The file structure is
     * like file/js/item/param/add.js which is called when adding 
     * parameter to js function. Plugins can be generic:
     * <code>file/* /item/* /* /add.js</code> . Plugins are stored in 
     * <code>globalCache</code> var 
     * and can be overriden/intercepted etc.<br><br>
     * 
     * Internally, it uses <code>pget</code> to find the plugin.<br><br>
     * 
     * Called from SourceFile it looks for <code>file/-ext-/-name-</code> plugins.
     * Called from Item it looks for 
     * <code>file/-item-file-ext-/item/-current-item-type-/-name-</code>
     * and if not found - generics. First item_type generic, then 
     * file_ext generic.<br><br>
     * 
     * Also, there is '?' plugin directories for unknown-type items.
     * @method
     * @param {string} name Plugin name
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
     * Find an applicable plugin(s). Plugins are not only functions, but 
     * also scalar values and objects.
     * @method
     * @param {string} name Plugin name
     * @param {bool} collect {
     *  Collect all applicable plugins: 
     *  including exactly matched
     *  plugin and all generics. Returns <code>array</code>
     *  @default false
     * }
     * @param {function} passthru { 
     *      Call this function with each found plugin. If returned
     *      <code>false</code>, execution stops and last plugin returned. Does
     *      not work with <code>collect</code>.
     *      @type {*} value
     *      @returns {bool}
     * }
     * @param {bool} exact {
     *  Only return the first matched plugin, if any
     *  @default false
     * }
     * @param {bool} merge {
     *  Not only collects (requires <code>collect=true</code>), but also merges
     *  all returned objects into one. Returns <code>object</code>
     *  @default false
     * }
     * @returns {*}
     */
    pget: function(name, collect, passthru, exact, merge) {

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