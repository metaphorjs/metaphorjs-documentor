
var Base = require("./Base.js"),
    fs = require("fs"),
    path = require("path"),
    extend = require("metaphorjs/src/func/extend.js");

module.exports = Base.$extend({

    id: null,
    location: null,
    type: null,
    groupName: null,
    content: null,
    title: null,
    file: null,
    contentType: null,

    $init: function(cfg) {

        var self = this;

        extend(self, cfg, true, false);

        if (self.file && !self.contentType) {
            self.contentType = path.extname(self.file).substr(1);
        }

        self.$super();
    },

    getContent: function() {

        if (this.file) {
            return fs.readFileSync(this.file).toString().trim();
        }
        else {
            return this.content;
        }
    },

    exportData: function() {

        var self = this;

        return {
            isContentItem: true,
            id: self.id,
            title: self.title,
            type: self.type,
            groupName: self.groupName,
            contentType: self.contentType,
            content: self.getContent()
        };

    }

});