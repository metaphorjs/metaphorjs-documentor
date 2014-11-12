
var Renderer = require("../Renderer.js"),
    globalCache = require("../var/globalCache.js"),
    path = require("path"),
    fs = require("fs"),
    fse = require("fs.extra"),
    jsdom = require("jsdom"),
    extend = require("../../../metaphorjs/src/func/extend.js"),
    initMetaphorTemplates = require("../func/initMetaphorTemplates.js");


module.exports = globalCache.add("renderer.default", Renderer.$extend({

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
            // path relative to dist/
            self.templateDir = path.normalize(__dirname + "/../assets/renderer/default");
        }

        self.data.sourceTree = self.doc.root.exportData().children;
    },



    render: function() {

        var self = this,
            tplDir = self.templateDir,
            index = tplDir + "/index.html",
            tpl = fs.readFileSync(index).toString();

        var util = require('util');

        var doc = jsdom.jsdom(tpl);
        var MetaphorJs = require("metaphorjs")(doc.parentWindow);

        self.initMetaphor(MetaphorJs);

        initMetaphorTemplates(MetaphorJs);

        // path relative to dist/
        self.loadTemplates(MetaphorJs, path.normalize(__dirname + "/../assets/templates"));
        self.loadTemplates(MetaphorJs, self.templateDir + "/templates");

        self.runMetaphor(MetaphorJs, doc, self.data);

        var html = jsdom.serializeDocument(doc);

        MetaphorJs.destroy();

        return html;
    },

    writeOut: function(out) {

        var outDir = this.out,
            tplDir = this.templateDir;

        if (fs.existsSync(outDir + "/bower_components")) {
            fse.rmrfSync(outDir + "/bower_components");
        }

        if (fs.existsSync(outDir + "/assets")) {
            fse.rmrfSync(outDir + "/assets");
        }

        fse.copyRecursive(tplDir + "/bower_components", outDir + "/bower_components", function(){
            fse.copyRecursive(tplDir + "/assets", outDir + "/assets", function(){
                fs.writeFileSync(outDir + "/index.html", out);
            });
        });
    }


}, {
    defaultData: {}
}));