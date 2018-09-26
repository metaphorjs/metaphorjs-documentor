var View = require("metaphorjs/src/class/View.js");

View.$extend({
    $class: "MetaphorJs.DocsView",
    
    initView: function() {

        var self    = this;

        self.route = [
            {
                regexp: /\/item\//,
                cmp: "DocsItem",
                id: "item",
                default: true,
                params: [
                    {
                        name: "itemId",
                        regexp: /item\/(.+)/
                    }
                ]
            },
            {
                regexp: /\/content\//,
                cmp: "DocsContent",
                id: "content",
                default: true,
                params: [
                    {
                        name: "contentId",
                        regexp: /content\/(.+)/
                    }
                ]
            }
        ];
    }
});