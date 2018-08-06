var View = require("metaphorjs/src/class/View.js");

View.$extend({
    $class: "DocsView",
    
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
            }
        ];
    }
});