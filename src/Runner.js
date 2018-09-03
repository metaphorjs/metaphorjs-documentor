
var Base = require("./Base.js"),
    minimist = require("minimist"),
    fs = require("fs"),
    path = require("path"),
    Documentor = require("./Documentor.js"),
    JsonFile = require("metaphorjs-build/src/class/JsonFile.js"),
    Build = require("metaphorjs-build/src/class/Build.js")
    extend = require("metaphorjs/src/func/extend.js");

/**
 * @class Runner
 * @extends Base
 */
var Runner = Base.$extend({

    $class: "Runner",

    run: function(cfg) {

        cfg = cfg || {};

        var self        = this,
            args        = minimist(process.argv.slice(2), {boolean: true}),
            profileName = cfg.profile || args._[0] || "",
            json        = process.cwd() + "/metaphorjs.json",
            jsonFile    = fs.existsSync(json) ? new JsonFile(json) : null,
            profile,
            defaults    = {
                renderer: {
                    data: {}
                },
                export: {
                    typePosition: {}
                }
            },
            cfg,
            doc;//         = new Documentor;

        if (jsonFile && jsonFile.docs) {
            profile     = profileName ? jsonFile.docs[profileName] : jsonFile.docs;
        }

        cfg             = extend({}, defaults, profile, cfg, true, true);

        self.jsonFile   = jsonFile;
        self.json       = json;

        extend(cfg.renderer.data, self.prepareArgsData(args), true, false);

        if (args.renderer) {
            cfg.renderer.type = args.renderer;
        }
        if (args.out) {
            cfg.out = args.out;
        }
        else if (cfg.renderer.out) {
            cfg.out = cfg.renderer.out;
        }

        self.doc = doc  = new Documentor({
            cfg: cfg,
            runner: self
        });

        if (cfg.init) {
            self.runInit(cfg, doc, jsonFile);
        }

        if (cfg.out) {
            cfg.out = self.preparePath(cfg.out, jsonFile, true);
            if (!cfg.out) {
                throw "Cannot write to " + cfg.out;
            }
        }

        if (cfg.hooks) {
            self.loadHooks(cfg, doc, jsonFile);
        }

        doc.pcall("init", doc);

        if (cfg.files && jsonFile) {
            self.loadFiles(cfg, doc, jsonFile);
        }

        if (cfg.src) {
            self.loadSrc(cfg, doc, jsonFile);
        }

        var rendererCls = doc.getRenderer(cfg.renderer.type || "default");

        if (!rendererCls) {
            throw "Cannot find renderer " + rendererCls;
        }

        doc.prepare();

        var renderer = new rendererCls(doc, extend({}, cfg.renderer, {
            out: cfg.out,
            runner: self
        }, true, false));

        return renderer.render().done(function(){
            self.doc.trigger("done");
        });
    },

    runInit: function(cfg, doc, jsonFile) {

        var initFile = this.preparePath(cfg.init, jsonFile),
            r = require;

        if (initFile) {
            r(initFile)(doc);
        }
    },

    loadFiles: function(cfg, doc, jsonFile) {
        var build = new Build(jsonFile);
        build.collectFiles(cfg);
        build.prepareBuildList();

        build.buildList.forEach(function(file){
            doc.addFile(file, {
                namePrefix: cfg.namePrefix,
                basePath: cfg.basePath
            });
        });
    },

    loadSrc: function(cfg, doc, jsonFile) {

        if (typeof cfg.src == "string") {
            cfg.src = [cfg.src];
        }

        var self = this;

        cfg.src.forEach(function(dirName){

            var opt = {};

            if (typeof dirName !== "string") {
                opt = dirName;
                dirName = opt.path;
            }

            var dir = self.preparePath(dirName, jsonFile);

            if (dir) {
                doc.eat(dir, opt.ext || cfg.extension || "js", {
                    namePrefix: cfg.namePrefix,
                    basePath: cfg.basePath || jsonFile.base,
                    includeExternal: cfg.includeExternal,
                    class: opt.class
                });
            }
        });
    },


    loadHooks: function(cfg, doc, jsonFile) {

        if (typeof cfg.hooks == "string") {
            cfg.hooks = [cfg.hooks];
        }

        var self = this;

        cfg.hooks.forEach(function(hookDir){

            var dir = self.preparePath(hookDir, jsonFile);

            if (dir) {
                doc.loadHooks(dir);
            }
            else {
                throw "Directory " + dir + " not found";
            }
        });
    },



    prepareArgsData: function(args) {
        var data = {},
            k;

        for (k in args) {
            if (k.indexOf("data-") === 0) {
                data[k.replace("data-", "")] = args[k];
                delete args[k];
            }
        }

        return data;
    },

    preparePath: function(name, jsonFile, isFile) {

        var res,
            normName = name;

        jsonFile = jsonFile || this.jsonFile;

        if (isFile) {
            var tmp = name.split("/");
            tmp.pop();
            normName = tmp.join("/");
        }
        else {
            while (normName.charAt(normName.length - 1) == '/' ||
                   normName.charAt(normName.length - 1) == '*') {
                normName = normName.substring(0, normName.length - 1);
            }
        }

        if (jsonFile && fs.existsSync(path.normalize(jsonFile.base + normName))) {
            res = path.normalize(jsonFile.base + name);
        }
        else if (fs.existsSync(path.normalize(process.cwd() + "/" + normName))) {
            res = path.normalize(process.cwd() + "/" + name);
        }
        else if (fs.existsSync(path.normalize(normName))) {
            res = path.normalize(name);
        }

        return res;
    },

    getMjsDocRoot: function(){
        return path.normalize(__dirname +"/../");
    }

}, {

     /**
     * @method
     * @static
     * @param {object} cfg {
     *  Same config can be passed directly or taken from <code>metaphorjs.json</code>
     *  from <code>docs</code> section. It supports multiple doc profiles.
     *  When running <code>mjs-doc name</code> it will look for config
     *  in docs.name section.
     *  @type {string} profile Profile name in metaphorjs.json in docs section
     *  @type {object} renderer {
     *      @type {string} type
     *      @type {string} out Output directory or file
     *      @type {object} data
     *      @type {string|array} templates Paths to templates
     *  }
     *  @type {object} export {
     *      @type {object} typePosition type=>position map
     *      @type {array} sort {
     *          Item sorters
     *          @type {string} type Sorter type - <code>sort.<type></code> hook
     *          @type {...} rest Other config parameters that sorter needs
     *      }
     *      @type {array} contentSort {
     *          Content sorters
     *          @type {string} type Sorter type - <code>sort.<type></code> hook
     *          @type {...} rest Other config parameters that sorter needs
     *      }
     *      @type {array} sortAll {
     *          Overall sorters
     *          @type {string} type Sorter type - <code>sort.<type></code> hook
     *          @type {...} rest Other config parameters that sorter needs
     *      }
     *  }
     *  
     *  @type {string|array} hooks Paths to hooks dirs
     *  @type {string|array} files Paths to content files
     *  @type {string|array} src Paths to src dirs
     *  @type {string} extension
     *  @type {bool} includeExternal
     *  @type {bool} hideIncludes
     *  @type {array} sort {
     *      Item sorters
     *      @type {string} type Sorter type - <code>sort.<type></code> hook
     *      @type {...} rest Other config parameters that sorter needs
     *  }
     *  @type {array} contentSort {
     *      Content sorters
     *      @type {string} type Sorter type - <code>sort.<type></code> hook
     *      @type {...} rest Other config parameters that sorter needs
     *  }
     * }
     * @returns {Promise}
     */
    run: function(cfg) {
        var runner = new Runner;
        return runner.run(cfg);
    }

});

module.exports = Runner;