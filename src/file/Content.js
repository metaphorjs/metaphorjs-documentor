
var File = require("../File.js"),
    fs = require("fs"),
    path = require("path"),
    Content = require("../Content.js");

/**
* @class file.Content
* @extends File
*/
module.exports = File.$extend({

    contentType: null,

    $class: "file.Content",

    $init: function() {

        var self = this;
        self.$super.apply(self, arguments);
        self.contentType = path.extname(self.path).substr(1);
    },

    /**
     * @method
     * @returns {string}
     */
    getContent: function() {

        if (this.path) {
            return this.includeFiles(fs.readFileSync(this.path).toString().trim());
        }
        else if (this.content) {
            return this.includeFiles(this.content);
        }

        return "";
    },

    includeFiles: function(str) {
        return str.replace(/{{\s*['"]([^'"]+)['"]\s+\|\s+readFile\s*}}/g, 
            function(match, file){
                return fs.readFileSync(file).toString().trim();
            });
    },

    process: function() {
        var self = this;
        var c = new Content({
            doc: self.doc,
            file: self,
            type: self.options.type || null,
            title: self.options.title || null
        });

        self.doc.addContent(c);
    }
});