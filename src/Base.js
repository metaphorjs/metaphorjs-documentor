var cs = require("metaphorjs-class/src/var/cs.js"),
    extend = require("metaphorjs/src/func/extend.js");

/**
 * @class Base
 * @extends BaseClass
 */
module.exports = cs.define({

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