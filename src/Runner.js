
var Base = require("./Base.js"),
    minimist = require("minimist"),
    fs = require("fs"),
    path = require("path"),
    Documentor = require("./Documentor.js"),
    mjsBuild = require("metaphorjs-build"),
    extend = require("../../metaphorjs/src/func/extend.js");

var Runner = Base.$extend({

    run: function(runCfg, runData, runOptions) {

        var self        = this,
            args        = minimist(process.argv.slice(2), {boolean: true}),
            profileName = args._[0] || "",
            json        = process.cwd() + "/metaphorjs.json",
            jsonFile    = fs.existsSync(json) ? new mjsBuild.JsonFile(json) : null,
            profile     = jsonFile && jsonFile.docs && jsonFile.docs[profileName] ?
                          jsonFile.docs[profileName] : {},
            data        = extend({}, profile.data, runData, true, false),
            cfg         = extend({}, profile, runCfg, true, false),
            options     = extend({}, profile.options, runOptions, true, false),
            doc;//         = new Documentor;

        delete cfg.data;
        delete cfg.options;

        extend(data, self.prepareArgsData(args), true, false);
        extend(options, self.prepareArgsOptions(args), true, false);
        extend(cfg, self.prepareArgsCfg(args), true, false);

        doc = new Documentor({
            itemSortCfg: cfg.itemSort,
            typeSortCfg: cfg.typeSort,
            contentSortCfg: cfg.contentSort
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

        if (cfg.files && jsonFile) {
            self.loadFiles(cfg, doc, jsonFile);
        }

        if (cfg.src) {
            self.loadSrc(cfg, doc, jsonFile);
        }

        //if (cfg.templates) {
        //    self.loadTemplates(cfg, doc, jsonFile);
        //}


        var rendererCls = doc.getRenderer(cfg.renderer || "default");

        if (!rendererCls) {
            throw "Cannot find renderer " + rendererCls;
        }

        doc.prepare();

        var renderer = new rendererCls(doc, extend({}, options, {

            data: data,
            out: cfg.out

        }, true, false));

        renderer.writeOut(renderer.render());
    },

    runInit: function(cfg, doc, jsonFile) {

        var initFile = this.preparePath(cfg.init, jsonFile),
            r = require;

        if (initFile) {
            r(initFile)(doc);
        }
    },

    loadFiles: function(cfg, doc, jsonFile) {
        var build = new mjsBuild.Build(jsonFile);
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
                    basePath: cfg.basePath,
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

        cfg.hooks.forEach(function(hoorDir){

            var dir = self.preparePath(hoorDir, jsonFile);

            if (dir) {
                doc.loadHooks(dir);
            }
        });
    },

    /*loadTemplates: function(cfg, doc, jsonFile) {

        if (typeof cfg.templates == "string") {
            cfg.templates = [cfg.templates];
        }

        var self = this;

        cfg.templates.forEach(function(hoorDir){

            var dir = self.preparePath(hoorDir, jsonFile);

            if (dir) {
                doc.loadTemplates(dir);
            }
        });
    },*/


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

    run: function() {

        var runner = new Runner;
        runner.run();

    }

});

module.exports = Runner;