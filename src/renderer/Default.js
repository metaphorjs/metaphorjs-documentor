
var Renderer = require("../Renderer.js"),
    globalCache = require("../var/globalCache.js"),
    path = require("path"),
    fs = require("fs"),
    fse = require("fs.extra"),
    child = require("child_process"),
    jsdom = require("jsdom"),
    isArray = require("metaphorjs/src/func/isArray.js"),
    extend = require("metaphorjs/src/func/extend.js"),
    getFileList = require("metaphorjs/src/func/fs/getFileList.js"),
    initMetaphorTemplates = require("../func/initMetaphorTemplates.js"),
    Promise = require("metaphorjs-promise/src/lib/Promise.js"),
    UglifyJS = require("uglify-js");

module.exports = globalCache.add("renderer.default", Renderer.$extend({

    $class: "renderer.default",

    data: null,
    templateDir: null,
    templates: null,
    assets: null,
    out: null,
    types: null,
    multipage: false,

    assetPaths: null,

    $init: function() {

        var self = this;

        self.assetPaths = {};

        self.$super.apply(self, arguments);

        if (!self.out) {
            throw "Cannot render to stdout";
        }

        if (!self.data) {
            self.data = {};
        }

        extend(self.data, globalCache.get("renderer.default").defaultData, false, false);

        if (self.multipage) {
            self.data.multipage = self.multipage;
        }

        self.data.pageOptions = self.pageOptions || {};

        if (!self.templateDir) {
            // path relative to /dist or to /src/renderer
            var dir = __dirname.split("/").pop(),
                pfx = dir === "dist" ? __dirname +"/../" : __dirname + "/../../";
            self.templateDir = path.normalize(pfx + "assets/renderer/default");
        }

        self.data.sourceTree = self.doc.exportData();
    },



    render: function() {

        var self    = this,
            tplDir  = self.templateDir,
            index   = tplDir + (self.multipage ? "/multipage.html" : "/singlepage.html"),
            tpl     = fs.readFileSync(index).toString(),
            dir     = __dirname.split("/").pop(),
            mjs     = dir === "dist" ? 
                        "../assets/mjs-renderer.js" : 
                        path.normalize(__dirname + "/../../assets/mjs-renderer.js"),
            doc         = jsdom.jsdom(tpl),
            MetaphorJs  = require(mjs)(doc.defaultView);

        self.initMetaphor(MetaphorJs);

        initMetaphorTemplates(MetaphorJs.Template);

        self.initTemplates(MetaphorJs);

        if (self.assets) {
            self.initAssets(self.assets);
        }

    
        var allTpls = [];
        MetaphorJs.Template.cache.eachEntry(function(tpl, name) {
            allTpls.push({
                name: name,
                tpl: tpl
            });
        });
        self.data.templates = allTpls;
    

        self.runMetaphor(MetaphorJs, doc, extend({}, self.data, {
            renderDataScript: function(multipage) {
                var data = extend({}, self.data, false, false);
                delete data.templates;
                if (!self.multipage) {
                    delete data.items;
                }
                var json = JSON.stringify(data, null, 2);
                return '<script>window.docsData = '+json+'</script>';
            }
        }, false, false));

        var html = jsdom.serializeDocument(doc);
        MetaphorJs.destroy();

        var cmtReg = /<!--.+?-->/gm;
        html = html.replace(cmtReg, '');
        html = html.replace('<html', '<html mjs-app="DocsApp"');

        /*var cssReg = /<link\s+rel="stylesheet"\s+href="([^"]+)"\s*>/g,
            jsReg = /<script\s+type="text\/javascript"\s+src="([^"]+)"\s*>.*<\/script>/g,
            match,
            p,
            defers = [];

        while ((match = cssReg.exec(html)) !== null) {
            p = (function(link, href){
                return self.getResource(match[1])
                .done(function(code){
                    html = html.replace(link, "<style>\n" + code + "\n</style>");
                });
            }(match[0], match[1]));
            defers.push(p);
        }

        while ((match = jsReg.exec(html)) !== null) {
            p = (function(script, src){
                return self.getResource(match[1])
                .done(function(code){
                    html = html.replace(script, 
                        "<script type=\"text/javascript\">\n" + 
                        code + 
                        "\n</script>"
                    );
                });
            }(match[0], match[1]));
            defers.push(p);
        }

        return Promise.all(defers).done(function(){
            self.writeOut(html);
        });*/

        return self.writeResources()
            .then(function(){
                return self.writeOut(html);
            });
    },

    renderHtml: function(html) {
        var self    = this,
            dir     = __dirname.split("/").pop(),
            mjs     = dir === "dist" ? 
                        "../assets/mjs-renderer.js" : 
                        path.normalize(__dirname + "/../../assets/mjs-renderer.js"),
            doc         = jsdom.jsdom(tpl),
            MetaphorJs  = require(mjs)(doc.defaultView);

        self.initMetaphor(MetaphorJs);
        initMetaphorTemplates(MetaphorJs.Template);
        self.initTemplates(MetaphorJs);

        if (self.assets) {
            self.initAssets(self.assets);
        }

        return MetaphorJs.render(html, doc);
    },


    initTemplates: function(MetaphorJs) {

        var self    = this,
            tplDir  = self.templateDir,
            dir     = __dirname.split("/").pop(),
            pfx     = dir === "dist" ? __dirname +"/../" : __dirname + "/../../";

        // path relative to dist/
        self.loadTemplates(MetaphorJs, path.normalize(pfx + "assets/templates"));
        self.loadTemplates(MetaphorJs, tplDir + "/templates");

        self.initAssets(path.normalize(pfx + "assets/renderer/default/assets"));

        if (self.templates) {
            if (!isArray(self.templates)) {
                self.templates = [self.templates];
            }
            self.templates.forEach(function(tpl){
                self.loadTemplates(MetaphorJs, self.runner.preparePath(tpl));
            });   
        }
    },

    initAssets: function(assetPath) {
        var self        = this;

        assetPath       = self.runner.preparePath(assetPath);
        var list        = getFileList(assetPath);

        list.forEach(function(filePath){
            var ext = path.extname(filePath).substr(1),
                url = path.normalize("assets/" + filePath.replace(assetPath, ""));
            self.assetPaths[url] = filePath;
            if (ext == "css") {
                self.data.styles.push(url);    
            }
        });
    
    },

    getResource: function(path) {
        var self    = this,
            tplDir  = this.templateDir,
            p       = new Promise,
            code;

        if (self.assetPaths[path]) {
            code = fs.readFileSync(self.assetPaths[path]);
        }
        else {
            code = fs.readFileSync(tplDir +"/"+ path);
        }

        /*if (path.indexOf(".min.") === -1) {
            console.log("not minified")
            if (path.indexOf(".js") !== -1) {
                console.log("is js", "minifying", self.assetPaths[path])
                
                var args = [];
                args.push('--js=' + self.assetPaths[path]);
                //args.push('--language_in=ECMASCRIPT5_STRICT');
                var ccjs    = require.resolve("closurecompiler")
                                    .replace("ClosureCompiler.js", "bin/ccjs"),
                    chunks  = [];

                proc    = child.spawn(ccjs, args);
                proc.stderr.pipe(process.stderr);
                proc.stdout.on("data", function(chunk){
                    chunks.push(chunk);
                });
                proc.on("close", function(){
                    p.resolve(Buffer.concat(chunks));
                });

                return p;
            }
        }*/
        
        return Promise.resolve(code);
    },

    writeResources: function() {
        var self    = this,
            outDir  = this.out,
            tplDir  = this.templateDir,
            promises = [];

        promises.push(self.copyResources(
            tplDir + "/bower_components",
            outDir + "/bower_components"
        ));

        promises.push(self.copyResources(
            tplDir + "/assets",
            outDir + "/assets"
        ));

        if (self.assets) {
            promises.push(self.copyResources(
                self.runner.preparePath(self.assets),
                outDir + "/assets"
            ));
        }

        //if (self.data.multipage) {
        //    var jsonData = JSON.stringify(self.data.sourceTree, null, 2);
        //    fs.writeFileSync(outDir + "/assets/data.json", jsonData);
       // }

        return Promise.all(promises);
    },

    writeOut: function(out) {
        var self    = this,
            outDir  = this.out;
        fs.writeFileSync(outDir + "/index.html", out);
        return Promise.resolve();
    },

    copyResources: function(from, to) {
        if (fs.existsSync(to)) {
            fse.rmrfSync(to);
        }

        var p = new Promise,
            self = this;

        fse.copyRecursive(from, to, function(err){
            if (err) {
                self.doc.trigger("error", err);
                throw err;
            }
            p.resolve();
        });

        return p;
    }


}, {
    defaultData: {
        styles: [],
        scripts: []
    }
}));