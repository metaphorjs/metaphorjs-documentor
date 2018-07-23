
var Renderer = require("../Renderer.js"),
    globalCache = require("../var/globalCache.js"),
    path = require("path"),
    fs = require("fs"),
    fse = require("fs.extra"),
    jsdom = require("jsdom"),
    extend = require("metaphorjs/src/func/extend.js"),
    getFileList = require("metaphorjs/src/func/fs/getFileList.js"),
    initMetaphorTemplates = require("../func/initMetaphorTemplates.js"),
    Promise = require("metaphorjs-promise/src/lib/Promise.js");


module.exports = globalCache.add("renderer.default", Renderer.$extend({

    data: null,
    templateDir: null,
    templates: null,
    assets: null,
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
            // path relative to /dist or to /src/renderer
            var dir = __dirname.split("/").pop(),
                pfx = dir === "dist" ? __dirname +"/../" : __dirname + "/../../";
            self.templateDir = path.normalize(pfx + "assets/renderer/default");
        }

        self.data.sourceTree = self.doc.exportData();
    },



    render: function() {

        var self = this,
            tplDir = self.templateDir,
            index = tplDir + "/index.html",
            tpl = fs.readFileSync(index).toString();

        var util = require('util');

        var dir = __dirname.split("/").pop(),
            pfx = dir === "dist" ? __dirname +"/../" : __dirname + "/../../",
            mjs = dir === "dist" ? 
                    "../assets/mjs-renderer.js" : 
                    path.normalize(__dirname + "/../../assets/mjs-renderer.js");

        //var doc = new jsdom.JSDOM(tpl);
        var doc = jsdom.jsdom(tpl);
        
        var MetaphorJs = require(mjs)(doc.defaultView);

        self.initMetaphor(MetaphorJs);

        initMetaphorTemplates(MetaphorJs);

        // path relative to dist/
        self.loadTemplates(MetaphorJs, path.normalize(pfx + "assets/templates"));
        self.loadTemplates(MetaphorJs, tplDir + "/templates");

        if (self.templates) {
            self.loadTemplates(MetaphorJs, self.runner.preparePath(self.templates));
        }

        if (self.assets) {
            var assetPath = self.runner.preparePath(self.assets);
            var list = getFileList(assetPath);
            list.forEach(function(filePath){

                var ext = path.extname(filePath).substr(1);
                if (ext == "css") {
                    self.data.styles.push("assets/" + filePath.replace(assetPath, ""));
                }
            })
        }

        self.runMetaphor(MetaphorJs, doc, self.data);

        //var html = doc.serialize();
        var html = jsdom.serializeDocument(doc);

        MetaphorJs.destroy();

        return html;
    },

    writeOut: function(out, done) {

        var self    = this,
            outDir  = this.out,
            tplDir  = this.templateDir;

        if (fs.existsSync(outDir + "/bower_components")) {
            fse.rmrfSync(outDir + "/bower_components");
        }

        if (fs.existsSync(outDir + "/assets")) {
            fse.rmrfSync(outDir + "/assets");
        }

        var bowerPromise = new Promise,
            defAssetsPromise = new Promise,
            projAssetsPromise = new Promise;

        fse.copyRecursive(tplDir + "/bower_components", outDir + "/bower_components", function(err){

            if (err) {
                self.doc.trigger("error", err);
                throw err;
            }

            bowerPromise.resolve();
        });

        fse.copyRecursive(tplDir + "/assets", outDir + "/assets", function(err){

            if (err) {
                self.doc.trigger("error", err);
                throw err;
            }

            defAssetsPromise.resolve();
        });

        if (self.assets) {

            var projAssetsPath = self.runner.preparePath(self.assets);

            fse.copyRecursive(projAssetsPath, outDir + "/assets", function(err){

                if (err) {
                    self.doc.trigger("error", err);
                    throw err;
                }

                projAssetsPromise.resolve();
            });
        }
        else {
            projAssetsPromise.resolve();
        }

        Promise.all([bowerPromise, defAssetsPromise, projAssetsPromise])
            .done(function(){
                fs.writeFileSync(outDir + "/index.html", out);

                if (done) {
                    done();
                }
            });

    }


}, {
    defaultData: {
        styles: [],
        scripts: []
    }
}));