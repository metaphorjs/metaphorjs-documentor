
var Base = require("./Base.js"),
    extend = require("../../metaphorjs/src/func/extend.js"),
    fs = require("fs"),
    eachLink = require("./func/eachLink.js");

module.exports = Base.$extend({

    doc: null,
    outDir: null,

    $init: function(doc, cfg) {

        var self = this;

        extend(self, cfg, true, false);

        self.doc = doc;

        self.resolveLinks();
    },

    initMetaphor: function(MetaphorJs) {

        MetaphorJs.ns.add("filter.markdown", this.doc.pget("markdown"));

        var self = this;

        MetaphorJs.ns.add("filter.typeRef", function(type) {

            var item;
            if ((item = self.doc.getItem(type)) && !item.file.hidden) {
                return '['+ item.name +'](#'+ item.fullName + ')';
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
            switch (fileType) {
                case "js":
                    return "javascript";
                default:
                    return fileType;
            }
        });
    },

    loadTemplates: function(MetaphorJs, dir) {

        var self = this;

        self.doc.eachHook(dir, "html", function(name, file){
            MetaphorJs.Template.cache.add(name, fs.readFileSync(file).toString());
        });
    },

    runMetaphor: function(MetaphorJs, doc, data) {

        var select = require("metaphorjs-select")(doc.parentWindow),
            appNodes    = select("[mjs-app]", doc),
            i, l, el;

        for (i = -1, l = appNodes.length; ++i < l;){
            el = appNodes[i];
            MetaphorJs.initApp(el, MetaphorJs.getAttr(el, "mjs-app"), data, true);
        }
    },


    resolveLinks: function() {

        var self = this;

        self.doc.eachItem(function(item) {
            item.eachFlag(function(name, flag){
                if (flag.type == "typeRef") {
                    return '['+ flag.content +'](#'+ flag.ref +')';
                }
                if (typeof flag.content == "string") {
                    flag.content = eachLink(flag.content, item, function(type, name, url) {
                        return '['+ (name || url) +']('+ (url || name) +')';
                    });
                }
            });
        });

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