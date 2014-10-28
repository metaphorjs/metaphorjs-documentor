
var DocumentorRenderer = require("../DocumentorRenderer.js"),
    globalCache = require("../var/globalCache.js"),
    path = require("path"),
    fs = require("fs"),
    fse = require("fs.extra"),
    jsdom = require("jsdom"),
    MetaphorJs = require("../../../metaphorjs/src/MetaphorJs.js"),
    select = require("../../../metaphorjs-select/src/metaphorjs.select.js"),
    extend = require("../../../metaphorjs/src/func/extend.js"),
    initApp = require("../../../metaphorjs/src/func/initApp.js"),
    getAttr = require("../../../metaphorjs/src/func/dom/getAttr.js");


module.exports = globalCache.add("renderer.default", DocumentorRenderer.$extend({

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
            self.templateDir = path.normalize(__dirname + "/../assets/renderer/default");
        }

        self.doc.loadTemplates(self.templateDir + "/templates");

        self.types = {};

        self.data.items = [];

        if (!self.data.topMenu) {
            self.data.topMenu = [];
            self.prepareTopMenu();
        }

        self.prepareSections();
    },

    getType: function(type, file) {

        var self = this,
            ext = file.ext;

        if (!self.types[ext + ":" + type]) {
            self.types[ext + ":" + type] = file.pcall("getItemType", type, file);
        }

        return self.types[ext + ":" + type];
    },

    prepareTopMenu: function() {

        var self = this,
            rootItems = self.doc.root.items,
            k,
            type,
            navItem,
            added = false;

        for (k in rootItems) {

            type = self.getType(k, rootItems[k][0].file);
            added = false;

            navItem = {
                id: k,
                name: type.groupName,
                sub: []
            };

            rootItems[k].forEach(function(item){

                if (item.file.hidden) {
                    return;
                }

                if (!added) {
                    self.data.items.push({
                        type: k,
                        name: type.groupName,
                        items: []
                    });
                    added = true;
                }

                navItem.sub.push({
                    id: item.fullName,
                    name: item.name
                });
            });

            if (navItem.sub.length) {
                self.data.topMenu.push(navItem);
            }
        }
    },

    prepareSections: function() {

        var self = this,
            root = self.doc.root,
            type,
            items;

        self.data.items.forEach(function(section, inx){
            type = section.type;
            items = root.items[type];

            items.forEach(function(item){
                if (!item.file.hidden) {
                    self.data.items[inx].items.push(item.exportData());
                }
            });
        });

    },

    render: function() {

        var self = this,
            tplDir = self.templateDir,
            index = tplDir + "/index.html",
            tpl = fs.readFileSync(index).toString();

        var doc = jsdom.jsdom(tpl);

        MetaphorJs.setWindow(doc.parentWindow);

        var appNodes    = select("[mjs-app]", doc),
            i, l, el;

        for (i = -1, l = appNodes.length; ++i < l;){
            el = appNodes[i];
            initApp(el, getAttr(el, "mjs-app"), self.data, true);
        }

        return jsdom.serializeDocument(doc);

    },

    writeOut: function(out) {

        var outDir = this.out,
            tplDir = this.templateDir;

        if (fs.existsSync(outDir + "/bower_components")) {
            fse.rmrfSync(outDir + "/bower_components");
        }

        if (fs.existsSync(outDir + "/style.css")) {
            fse.rmrfSync(outDir + "/style.css");
        }

        fse.copyRecursive(tplDir + "/bower_components", outDir + "/bower_components", function(){
            fse.copy(tplDir + "/style.css", outDir + "/style.css", function(){
                fs.writeFileSync(outDir + "/index.html", out);
            });
        });
    }


}, {
    defaultData: {
        title: "",
        description: "",
        footer: "",
        topRightMenu: null
    }
}));