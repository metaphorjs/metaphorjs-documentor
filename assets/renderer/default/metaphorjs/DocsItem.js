var Component = require("metaphorjs/src/class/Component.js"),
    async = require("metaphorjs/src/func/async.js"),
    Promise = require("metaphorjs-promise/src/lib/Promise.js"),
    select = require("metaphorjs-select/src/func/select.js"),
    raf = require("metaphorjs-animate/src/func/raf.js");

Component.$extend({
    $class: "DocsItem",
    template: "item-component",

    initComponent: function() {
        var self = this;
        self.scope.tpl = '';

        self.itemId.on("change", self.onItemIdChange, self);
        self.onItemIdChange(self.itemId.getValue() || self.findFirstItem());
    },

    findFirstItem: function() {
        var a = select(".bd-toc-sublink");
        if (a.length) {
            a = a[0];
            if (a.href) {
                var itemId = a.href.split("/item/");
                if (itemId.length) {
                    return itemId[1];
                }
            }
        }
    },

    onItemIdChange: function(itemId) {
        var self = this;

        if (!itemId) {
            return;
        }

        return new Promise(function(resolve){
            async(function(){
                self.scope.$app.setLoading(true, true);
                resolve();
            }, null, [], 200);
        })
        .then(function(){
            return new Promise(function(resolve){
                raf(function(){
                    self.scope.item = self.scope.$app.getItem(itemId);
                    self.scope.$check();
                    resolve();
                });
            });
        })
        .then(function(){
            return new Promise(function(resolve) {
                raf(function(){
                    window.Prism.highlightAll();
                    resolve();
                });
            });
        })
        .then(function(){
            return new Promise(function(resolve) {
                raf(function(){
                    self.scope.$app.setLoading(false);
                    resolve();
                });
            });
        });
    }  
});

