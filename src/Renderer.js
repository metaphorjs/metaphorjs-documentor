
var Base = require("./Base.js"),
    extend = require("metaphorjs/src/func/extend.js"),
    fs = require("fs"),
    prismClass = require("./func/prismClass.js"),
    Promise = require("metaphorjs-promise/src/lib/Promise.js"),
    toJsonTemplate = require("./func/toJsonTemplate.js");

/**
 * @class Renderer
 * @extends Base
 */
module.exports = Base.$extend({

    $class: "MetaphorJs.docs.Renderer",

    /**
     * @property
     * Renderer name for plugins: <code>renderer.<pname>.hook</code>
     */
    pname: "*",

    doc: null,
    outDir: null,
    templates: null,

    /**
     * @constructor
     * @param {Documentor} doc
     * @param {object} cfg {
     *  @type {string} outDir
     *  @type {string} templates
     * }
     */
    $init: function(doc, cfg) {

        var self = this;

        extend(self, cfg, true, false);

        self.doc = doc;

        self.pcall("init", self, self.doc);
        self.pcall("resolveLinks", self, self.doc);
    },

    pcall: function(name) {
        arguments[0] = "renderer." + this.pname + "." + arguments[0];
        return this.doc.pcall.apply(this.doc, arguments);
    },

    pget: function(name, collect, passthru, exact, merge) {
        arguments[0] = "renderer." + this.pname + "." + arguments[0];
        return this.doc.pget.apply(this.doc, arguments);
    },


    /**
     * @method
     * Init server-side MetaphorJs. 
     * Register filters, directives, override and extend classes.
     * This will render html file that goes into browser
     * using templates.
     */
    initMetaphor: function(MetaphorJs) {

        var self = this;

        MetaphorJs.error.on(function(e){
            self.doc.trigger("error", e);
        });

        var md = self.doc.pget("content.markdown");
        MetaphorJs.ns.add("filter.markdown", function(input){
            if (typeof input != "string") {
                return ""+input;
            }
            return md.apply(null, arguments);
        });

        var self = this;

        MetaphorJs.ns.add("filter.typeRef", function(type) {

            var item;
            if ((item = self.doc.getItem(type)) && !item.file.hidden) {
                return '['+ item.fullName +'](#'+ item.fullName + ')';
            }
            else {
                return type;
            }
        });

        MetaphorJs.ns.add("filter.markdownLinks", function(str){

            if (!str) {
                return "";
            }

            return (""+str).replace(/\[([^\]]+)\]\(([^\)]+)\)/i, function(match, name, url){
                return '<a href="'+ url +'">'+ name +'</a>';
            });
        });

        MetaphorJs.ns.add("filter.prismClass", prismClass);

        MetaphorJs.ns.add("filter.readFile", function(filePath){

            var path = self.runner.preparePath(filePath);

            if (!path) {
                self.doc.trigger("error", "File " + filePath + " not found!");
                return "";
            }

            return fs.readFileSync(path).toString();
        });


        MetaphorJs.ns.add("filter.presentAsJson", toJsonTemplate);

        MetaphorJs.Renderer.setSkip("link", false);
        MetaphorJs.Renderer.setSkip("style", false);
        MetaphorJs.Renderer.setSkip("script", false);

        self.doc.pcall("initMetaphor", MetaphorJs, self, self.doc);
    },

    /**
     * @method
     * Load templates into MetaphorJs
     * @param {MetaphorJs} mjs
     * @param {string} dir Templates directory
     */
    loadTemplates: function(MetaphorJs, dir) {

        var self = this;

        self.doc.eachHook(dir, "html", function(name, file){
            MetaphorJs.Template.cache.add(name, fs.readFileSync(file).toString());
        });
    },

    /**
     * @method
     * Run MetaphorJs app
     * @param {MetaphorJs} mjs
     * @param {Renderer} renderer
     * @param {Documentor} doc
     */
    runMetaphor: function(MetaphorJs, doc, data) {

        var self = this;

        self.doc.pcall("beforeMetaphor", MetaphorJs, self, self.doc);

        var appNodes    = MetaphorJs.select("[mjs-app]"),
            i, l, el;

        for (i = -1, l = appNodes.length; ++i < l;){
            el = appNodes[i];
            MetaphorJs.initApp(el, MetaphorJs.getAttr(el, "mjs-app"), data, true);
        }

        self.doc.pcall("afterMetaphor", MetaphorJs, self, self.doc);
    },


    /**
     * @method
     * Remove all previously copied resources and rendered files
     */
    cleanupOutDir: function() {

    },

    /**
     * @method
     * Copy all required resources to output directory
     */
    copyToOut: function() {

    },

    /**
     * @method
     * Write output
     * @returns {Promise}
     */
    writeOut: function(out) {

        if  (this.out) {
            fs.writeFileSync(this.out, out);
        }
        else {
            process.stdout.write(out);
        }

        return Promise.resolve();
    },

    /**
     * @method
     * Render templates
     * @returns {Promise}
     */
    render: function() {
        return Promise.resolve();
    }

});