var App = require("metaphorjs/src/class/App.js"),
    mhistory = require("metaphorjs-history/src/lib/History.js"),
    Template = require("metaphorjs/src/class/Template.js"),
    select = require("metaphorjs-select/src/func/select.js"),
    setAttr = require("metaphorjs/src/func/dom/setAttr.js"),
    async = require("metaphorjs/src/func/async.js"),
    isBrowser = require("metaphorjs/src/func/isBrowser.js"),
    getAttr = require("metaphorjs/src/func/dom/getAttr.js"),
    generateTemplateNames = require("metaphorjs-documentor/src/func/generateTemplateNames.js"),
    nextUid = require("metaphorjs/src/func/nextUid.js");

App.$extend({
    $class: "DocsApp",
    loading: 0,

    $init: function() {
        var self = this;

        self.$super.apply(self, arguments);

        self.scope.loading = false;

        //initMetaphorTemplates(Template);
        Template.cache.addFinder(function(id){

            var names = generateTemplateNames(id),
            i, l,
            tplNode;

            for (i = 0, l = names.length; i < l; i++) {
                tplNode = window.document.getElementById(names[i]);
                if (tplNode) {
                    return tplNode.innerHTML;
                }
            }
        });

        var data = window.docsData;

        if (data) {
            var k;
            for (k in data) {
                self.scope[k] = data[k];
            }
        }

        self.makeItemMap();

        if (isBrowser()) {
            mhistory.init();
        }
    },

    makeItemMap: function() {
        var map = {},
            contentMap = {},
            self = this;

        var flattenItem = function(item) {
            if (item.isApiGroup) {
                item.items.forEach(flattenItem);
            }
            if (item.isApiItem) {
                map[item.fullName] = item;
            }
            if (item.isContentItem) {
                contentMap[item.id] = item;
            }
        };

        if (self.scope.sourceTree.items) {
            self.scope.sourceTree.items.forEach(flattenItem);
        }
        if (self.scope.sourceTree.content) {
            self.scope.sourceTree.content.forEach(flattenItem);
        }
        self.itemMap = map;
        self.contentMap = contentMap;
    },

    getItem: function(id) {
        return this.itemMap[id];
    },

    getContentItem: function(id) {
        return this.contentMap[id];
    },

    hasNav: function(where) {
        var k;
        for (k in this.scope.sourceTree.structure) {
            if (this.scope.sourceTree.structure[k].where == where) {
                return true;
            }
        }
        return false;
    },

    getItemUrl: function(item) {
        if (item.isGroup) {
            return '#';
        }
        if (this.scope.multipage) {
            return '/' + item.pathPrefix +'/'+ item.id;
        }
        else {
            return '#' + item.id;
        }
    },

    setLoading: function(state, ifNot) {
        if (state) {
            if (ifNot && this.loading > 0) {
                return;
            }
            this.loading++;
            if (this.loading > 1) {
                return;
            }
            this.scope.$set("loading", true);
        }
        else if (this.loading > 0) {
            this.loading--;
            if (this.loading === 0) {
                this.scope.$set("loading", false);
            }
        }
    },

    highlightAllUnprocessed: function() {

        var p = new Promise,
            pres = select("pre"),
            counter = 0,
            i, l,
            j, jl,
            pre, code;

        try {
            for (i = 0, l = pres.length; i < l; i++) {

                pre = pres[i];

                for (j = 0, jl = pre.childNodes.length; j < jl; j++) {
                    code = pre.childNodes[j];
                    if (code.nodeType && 
                        code.tagName.toLowerCase() === "code" && 
                        !getAttr(code, "prism-processed")) 
                    {
                        counter++;
                        setAttr(code, "prism-processed", "true");
                        window.Prism.highlightElement(code, true, function(){
                            counter--;
                            if (counter === 0) {
                                p.resolve();
                            }
                        });
                    }
                }
            }
        }
        catch (ex) {
            console.log(ex);
            counter = 0;
        }

        if (counter === 0) {
            p.resolve();
        }

        setTimeout(function(){
            p.resolve();
        }, 1000);

        return p;
    },


    initMenuItem: function() {
        return nextUid();
    },

    toggleMenuItem: function(open, id) {
        var self = this;
        async(function(){
            self.trigger("menu-toggle", id, !open)
        });
        
        return !open;
    },

    goto: function(url) {
        if (url.substr(0,1) === '#') {
            window.location.hash = url;
        }
        else {
            mhistory.push(url);
        }
    }
});
