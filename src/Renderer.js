
var Base = require("./Base.js"),
    extend = require("metaphorjs/src/func/extend.js"),
    fs = require("fs"),
    eachLink = require("./func/eachLink.js");

module.exports = Base.$extend({

    $class: "Renderer",

    doc: null,
    outDir: null,
    templates: null,

    $init: function(doc, cfg) {

        var self = this;

        extend(self, cfg, true, false);

        self.doc = doc;

        self.doc.pcall("renderer.init", self, self.doc);

        self.resolveLinks();

        self.doc.pcall("renderer.linksResolved", self, self.doc);
    },

    initMetaphor: function(MetaphorJs) {

        MetaphorJs.error.on(function(e){
            self.doc.trigger("error", e);
        });

        MetaphorJs.ns.add("filter.markdown", this.doc.pget("markdown"));

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

            return str.replace(/\[([^\]]+)\]\(([^\)]+)\)/i, function(match, name, url){
                return '<a href="'+ url +'">'+ name +'</a>';
            });
        });

        MetaphorJs.ns.add("filter.prismClass", function(fileType){

            if (fileType.indexOf('txt-') === 0) {
                fileType = fileType.split('-')[1];
            }

            switch (fileType) {
                case "js":
                case "json":
                    return "javascript";
                default:
                    return fileType;
            }
        });

        MetaphorJs.ns.add("filter.readFile", function(filePath){

            var path = self.runner.preparePath(filePath);

            if (!path) {
                self.doc.trigger("error", "File " + filePath + " not found!");
                return "";
            }

            return fs.readFileSync(path).toString();
        });

        self.doc.pcall("renderer.initMetaphor", MetaphorJs, self, self.doc);
    },

    loadTemplates: function(MetaphorJs, dir) {

        var self = this;

        self.doc.eachHook(dir, "html", function(name, file){
            MetaphorJs.Template.cache.add(name, fs.readFileSync(file).toString());
        });
    },

    runMetaphor: function(MetaphorJs, doc, data) {

        var self = this;

        self.doc.pcall("renderer.beforeMetaphor", MetaphorJs, self, self.doc);

        var appNodes    = MetaphorJs.select("[mjs-app]"),
            i, l, el;

        for (i = -1, l = appNodes.length; ++i < l;){
            el = appNodes[i];
            MetaphorJs.initApp(el, MetaphorJs.getAttr(el, "mjs-app"), data, true);
        }

        self.doc.pcall("renderer.afterMetaphor", MetaphorJs, self, self.doc);
    },


    resolveLinks: function() {

        var self = this;

        self.doc.eachItem(function(item) {
            item.eachFlag(function(name, flag){
                if (flag.type == "typeRef") {
                    return '['+ flag.content +'](#'+ flag.ref +')';
                }
                if (typeof flag.content == "string") {
                    flag.content = eachLink(flag.content, item, 
                        function(type, name, url, fullName) {
                        return '['+ (fullName || name || url) +']('+ (url || name) +')';
                    });
                }
            });
        });

    },

    cleanupOutDir: function() {

    },

    copyToOut: function() {

    },

    writeOut: function(out, done) {
        if  (this.out) {
            fs.writeFileSync(this.out, out);
        }
        else {
            process.stdout.write(out);
        }

        if (done) {
            done();
        }
    },


    render: function() {

    }

});