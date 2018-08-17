var Component = require("metaphorjs/src/class/Component.js"),
    async = require("metaphorjs/src/func/async.js"),
    Promise = require("metaphorjs-promise/src/lib/Promise.js"),
    raf = require("metaphorjs-animate/src/func/raf.js");

Component.$extend({
    $class: "DocsContent",
    template: ".content.template",

    initComponent: function() {
        var self = this;
        self.scope.content = {
            template: null
        };

        self.contentId.on("change", self.onContentIdChange, self);
        self.onContentIdChange(self.contentId.getValue() || self.findFirstItem());
    },

    onContentIdChange: function(contentId) {
        var self = this;

        if (!contentId) {
            return;
        }

        return new Promise(function(resolve){
            async(function(){
                self.scope.$app.setLoading(true, true);
                resolve();
            }, null, [], 100);
        })
        .then(function(){
            return new Promise(function(resolve){
                raf(function(){
                    self.scope.content = self.scope.$app.getContentItem(contentId);
                    self.scope.$check();
                    resolve();
                });
            });
        })
        .then(function(){
            return self.scope.$app.highlightAllUnprocessed();
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

