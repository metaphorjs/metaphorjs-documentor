
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

    /**
     * @method
     * @param {object} runCfg {
     *  @type {string} profile Profile name in metaphorjs.json in docs section
     *  @type {string} out Output directory or file
     *  @type {string|array} hooks Paths to hooks dirs
     *  @type {string|array} files Paths to content files
     *  @type {string|array} src Paths to src dirs
     *  @type {string|array} templates Paths to templates
     *  @type {object} data Same as runData
     *  @type {object} options Same as runOptions
     *  @type {object} itemSort
     *  @type {object} typeSort
     *  @type {object} contentSort
     * }
     * @param {object} runData
     * @param {object} runOptions
     * @param {function} errorCallback
     * @param {function} doneCallback
     */
    run: function(runCfg, runData, runOptions, errorCallback, doneCallback) {

        runCfg = runCfg || {};
        runData = runData || {};
        runOptions = runOptions || {};

        var self        = this,
            args        = minimist(process.argv.slice(2), {boolean: true}),
            profileName = runCfg.profile || args._[0] || "",
            json        = process.cwd() + "/metaphorjs.json",
            jsonFile    = fs.existsSync(json) ? new JsonFile(json) : null,
            profile     = jsonFile && jsonFile.docs && jsonFile.docs[profileName] ?
                          jsonFile.docs[profileName] : {},
            data        = extend({}, profile.data, runData, true, false),
            cfg         = extend({}, profile, runCfg, true, false),
            options     = extend({}, profile.options, runOptions, true, false),
            doc;//         = new Documentor;

        delete cfg.data;
        delete cfg.options;

        self.jsonFile   = jsonFile;
        self.json       = json;

        extend(data, self.prepareArgsData(args), true, false);
        extend(options, self.prepareArgsOptions(args), true, false);
        extend(cfg, self.prepareArgsCfg(args), true, false);

        self.doc = doc  = new Documentor({
            itemSortCfg: cfg.itemSort,
            typeSortCfg: cfg.typeSort,
            contentSortCfg: cfg.contentSort
        });

        if (doneCallback) {
            doc.on("done", doneCallback);
        }

        if (errorCallback) {
            doc.on("error", errorCallback);
        }

        doc.on("error", function(e) {
            throw e;
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

        var rendererCls = doc.getRenderer(cfg.renderer || "default");

        if (!rendererCls) {
            throw "Cannot find renderer " + rendererCls;
        }

        doc.prepare();

        var renderer = new rendererCls(doc, extend({}, options, {
            data: data,
            out: cfg.out,
            runner: self
        }, true, false));

        renderer.render().done(function(){
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

            var dir = self.preparePath(dirName, jsonFile);

            if (dir) {
                doc.eat(dir, cfg.extension || "js", {
                    namePrefix: cfg.namePrefix,
                    basePath: cfg.basePath || jsonFile.base,
                    includeExternal: cfg.includeExternal
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

    prepareArgsOptions: function(args) {
        var options = {},
            k;

        for (k in args) {
            if (k.indexOf("option-") === 0) {
                options[k.replace("option-", "")] = args[k];
                delete args[k];
            }
        }

        return options;
    },

    prepareArgsCfg: function(args) {

        var cfg = {},
            k;

        for (k in args) {
            if (k != "_") {
                cfg[k] = args[k];
            }
        }

        return cfg;
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
    }

}, {

    run: function(runCfg, runData, runOptions, errorCallback, doneCallback) {

        var runner = new Runner;
        return runner.run(runCfg, runData, runOptions, errorCallback, doneCallback);

    }

});

module.exports = Runner;