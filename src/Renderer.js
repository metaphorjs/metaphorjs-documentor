
var Base = require("./Base.js"),
    extend = require("../../metaphorjs/src/func/extend.js"),
    fs = require("fs");

module.exports = Base.$extend({

    doc: null,
    outDir: null,

    $init: function(doc, cfg) {
        
        var self = this;

        extend(self, cfg, true, false);

        self.doc = doc;
    },

    initMetaphor: function(MetaphorJs) {

        MetaphorJs.ns.add("filter.markdown", this.doc.pget("markdown"));
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