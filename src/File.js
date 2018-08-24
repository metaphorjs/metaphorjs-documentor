var Base = require("./Base.js"),
    fs = require("fs"),
    path = require("path"),
    isRegExp = require("metaphorjs/src/func/isRegExp.js"),
    extend = require("metaphorjs/src/func/extend.js");

module.exports = function(){

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
         * @type {object}
         */
        options: null,

        /**
         * @type {bool}
         */
        hidden: false,

        $init: function() {

            var self = this;
            self.dir = path.dirname(self.path);
            self.ext = path.extname(self.path).substr(1);
            self.hidden = self.options.hidden || false;

            if (self.options.basePath) {
                self.exportPath = self.path.replace(self.options.basePath, "");
            }
            else {
                self.exportPath = self.path;
            }
        },

        pcall: function(name) {
            arguments[0] = "file." + this.ext + "." + arguments[0];
            return this.doc.pcall.apply(this.doc, arguments);
        },

        pget: function(name, collect, passthru, exact, merge) {
            arguments[0] = "file." + this.ext + "." + arguments[0];
            return this.doc.pget.apply(this.doc, arguments);
        },

        /**
         * @method
         * @returns {string}
         */
        getContent: function () {
            return fs.readFileSync(this.path).toString();
        },

        process: function() {

        }
        
    }, {

        getFileClass: function(filePath, doc) {
            var files = doc.pget("files"),
                ext = path.extname(filePath).substr(1),
                returnDef;

            files.forEach(function(def){

                if (returnDef) {
                    return;
                }

                if ((typeof def.ext === "string" && def.ext === ext) ||
                    (isRegExp(def.ext) && ext.match(def.ext)) ||
                    def.ext === "*") {

                    if (typeof def.class === "string") {
                        def.class = doc.getFileClass(def.class);
                    }

                    returnDef = def;
                }
            });

            if (!returnDef.class) {
                returnDef.class = File;
            }

            return returnDef;
        },

        get: function(filePath, doc, options) {

            if (!all[filePath]) {
                var def = File.getFileClass(filePath, doc),
                    cls = def.class;

                all[filePath] = new cls({
                    path: filePath,
                    doc: doc,
                    options: extend({}, options, def.options)
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