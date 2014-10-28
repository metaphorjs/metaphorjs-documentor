
var DocumentorBase = require("./DocumentorBase.js"),
    fs = require("fs"),
    path = require("path"),
    extend = require("../../metaphorjs/src/func/extend.js");

module.exports = DocumentorBase.$extend({

    id: null,
    group: null,
    content: null,
    title: null,
    description: null,
    file: null,
    fileType: null,

    $init: function(id, content) {

        var self = this;

        if (typeof id != "object") {
            self.id = id;
            self.content = content;
        }
        else {
            extend(self, id, true, false);
        }

        self.$super();
    },

    getContent: function() {

        if (this.file) {
            return fs.readFileSync(this.file).toString();
        }
        else {
            return this.content;
        }
    }

});