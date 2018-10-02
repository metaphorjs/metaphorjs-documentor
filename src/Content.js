
var Base = require("./Base.js"),
    File = require("./File.js"),
    extend = require("metaphorjs-shared/src/func/extend.js");

/**
 * @class Content
 * @extends Base
 */
module.exports = Base.$extend({

    $class: "MetaphorJs.docs.Content",

    id: null,
    type: null,
    content: null,
    name: null,
    file: null,
    toStructExport: null,
    toExport: null,
    props: null,

    /**
     * @constructor
     * @param {object} cfg {
     *  @type {string|File} file
     *  @type {string} content
     *  @type {string} id
     *  @type {string} type
     *  @type {string} name
     * }
     */
    $init: function(cfg) {

        var self = this;

        if (typeof self.file === "string") {
            self.file = File.get(self.file, self.doc);
        }

        self.toStructExport = {};
        self.toExport = {};
        self.$super();

        if (!self.type) {
            var parseCfg = self.pcall("parse", self.file, self);
            if (parseCfg) {
                extend(self, parseCfg);
            }
        }
        if (!self.type) {
            self.type = "content";
        }

        self.group = self.type;

        if (!self.id) {
            self.id = self.file.exportPath;
        }

        self.pcall("created", self);
    },

    pcall: function(name) {
        arguments[0] = "content." + (this.type||'?') + "." + arguments[0];
        if (this.file) {
            return this.file.pcall.apply(this.file, arguments);
        }
        else {
            arguments[0] = "*." + arguments[0];
            return this.doc.pcall.apply(this.doc, arguments);
        }
    },

    pget: function(name, collect, passthru) {
        arguments[0] = "content." + (this.type||'?') + "." + arguments[0];
        if (this.file) {
            return this.file.pget.apply(this.file, arguments);
        }
        else {
            arguments[0] = "*." + arguments[0];
            return this.doc.pcall.apply(this.doc, arguments);
        }
    },

    /**
     * @param {string} id
     * @returns {bool}
     */
    isThe: function(id) {
        return this.id == id;
    },

    /**
     * @method
     * @return {string}
     */
    getContent: function() {
        if (!this.content) {
            this.content = this.file.getContent();
        }
        return this.content;
    },

    /**
     * Add key-value pair that will be exported as is
     * @param {string} name
     * @param {*} value
     */
    addToExport: function(name, value) {
        this.toExport[name] = value;
    },

    /**
     * Add key-value pair that will be exported as is
     * @param {string} name
     * @param {*} value
     */
    addToStructExport: function(name, value) {
        this.toStructExport[name] = value;
    },

    /**
     * @method
     * @returns {object}
     */
    getTypeProps: function() {
        if (!this.props) {
            this.props = this.file.pcall("getContentsType", this.type, this.file);
        }
        return this.props;
    },

    /**
     * Returns the same object as getTypeProps()
     * @method
     * @returns {object}
     */
    getGroupProps: function() {
        return this.getTypeProps();
    },

    /**
     * @method
     * @return {string}
     */
    getSortableName: function() {
        return this.id;
    },

    /**
     * @method
     */
    exportData: function() {

        var self = this;

        return extend({}, self.toExport, {
            isContentItem: true,
            id: self.id,
            name: self.name,
            type: self.type,
            groupName: self.groupName,
            contentType: self.contentType,
            template: self.file.ext + ".content." + self.type,
            content: self.getContent()
        });
    },

    exportToStructure: function() {
        var self = this;

        return extend(
            {
                id: self.id,
                name: self.name,
                pathPrefix: "content"
            }, 
            self.toStructExport,
            true, false
        );
    }

});