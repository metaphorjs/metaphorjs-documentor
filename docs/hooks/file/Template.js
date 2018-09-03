
var File = require("metaphorjs-documentor/src/File.js"),
    Item = require("metaphorjs-documentor/src/Item.js"),
    createGetter = require("metaphorjs-watchable/src/func/createGetter.js");

module.exports = File.$extend({
    $class: "file.Template",

    process: function() {
        var self    = this,
            content = self.getContent(),
            re      = /^<!--(\{(.|[\n\r])*?\})-->/,
            match   = content.match(re),
            props   = match && match[1] ? createGetter(match[1])(self) : null;

        if (!props) {
            return;

        }

        var item = new Item({
            doc: self.doc,
            file: self,
            type: "template",
            name: self.getItemName()
        });

        if (props.description) {
            item.addFlag("description", props.description, "string");
        }
        
        self.doc.root.addItem(item);
    },

    getItemName: function() {

        var self = this;

        name = self.path.replace(self.basePath, "");
        name = name.replace("/assets/templates", "");

        if (name.substr(0,1) === '/') {
            name = name.substr(1);
        }

        name = name.replace(/\//g, '.');
        name = name.replace(".html", '');

        return name;
    }
})