
var Base = require("./Base.js"),
    extend = require("../../metaphorjs/src/func/extend.js"),
    fs = require("fs"),
    path = require("path");

module.exports = Base.$extend({

    type: null,
    content: null,
    props: null,

    $init: function(content, type, props) {

        var ct;

        if (content && typeof content == "object") {
            type = content.type;
            ct = content.contentType;
            content = content.content;
        }

        type = type || (typeof content);

        this.props = props || {};

        if (type == "file") {
            this.props["fromFile"] = content;
            this.props["fileType"] = path.extname(content).substr(1);
            content = fs.readFileSync(content).toString();
            type = ct || "string";
        }

        this.type = type;
        this.content = content;
    },

    setType: function(type) {
        this.type = type;
    },

    setContent: function(content) {
        this.content = content;
    },

    setProperty: function(name, value){
        this.props[name] = value;
    },

    getProperty: function(name) {
        return this.props[name];
    },

    getData: function() {
        return extend({}, {
            contentType: this.type,
            content: this.content
        }, this.props);

    }

});