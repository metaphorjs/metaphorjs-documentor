
var Base = require("./Base.js"),
    fs = require("fs"),
    path = require("path"),
    extend = require("metaphorjs/src/func/extend.js");

/**
 * @class Content
 * @extends Base
 */
module.exports = Base.$extend({

    $class: "Content",

    id: null,
    location: null,
    type: null,
    groupName: null,
    content: null,
    title: null,
    file: null,
    contentType: null,

    /**
     * @constructor
     * @param {object} cfg {
     *  @type {string} file
     *  @type {string} content
     *  @type {string} id
     *  @type {string} location
     *  @type {string} title
     *  @type {string} groupName
     *  @type {string} contentType
     * }
     */
    $init: function(cfg) {

        var self = this;

        extend(self, cfg, true, false);

        if (self.file && !self.contentType) {
            self.contentType = path.extname(self.file).substr(1);
        }

        self.$super();
    },

    /**
     * @method
     * @returns {string}
     */
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