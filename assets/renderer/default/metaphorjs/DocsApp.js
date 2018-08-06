var App = require("metaphorjs/src/class/App.js"),
    mhistory = require("metaphorjs-history/src/lib/History.js"),
    Template = require("metaphorjs/src/class/Template.js"),
    generateTemplateNames = require("metaphorjs-documentor/src/func/generateTemplateNames.js");

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
        mhistory.init();

        window.docsApp = self;
    },

    makeItemMap: function() {
        var map = {},
            self = this;

        var flattenItem = function(item) {
            if (item.isApiGroup) {
                item.items.forEach(flattenItem);
            }
            if (item.isApiItem) {
                map[item.fullName] = item;
            }
        };

        self.scope.sourceTree.items.forEach(flattenItem);
        self.itemMap = map;
    },

    getItem: function(id) {
        return this.itemMap[id];
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
    }
});
