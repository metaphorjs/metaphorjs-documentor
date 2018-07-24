
var Base = require("./Base.js"),
    extend = require("metaphorjs/src/func/extend.js"),
    fs = require("fs"),
    copy = require("metaphorjs/src/func/copy.js"),
    path = require("path");

module.exports = (function(){
    
    var Flag = Base.$extend({

        $class: "Flag",
    
        name: null,
        type: null,
        content: null,
        props: null,
        file: null,
    
        $init: function(name, content, type, props, file) {
    
            var ct,
                self = this;
    
            self.file = file;
            self.name = name;
    
            if (content && typeof content == "object") {
                type = content.type;
                ct = content.contentType;
                content = content.content;
            }
    
            type = type || (typeof content);
    
            self.props = props || {};
    
            if (type == "file") {
                self.props["fromFile"] = content;
                self.props["fileType"] = path.extname(content).substr(1);
                content = fs.readFileSync(content).toString();
                type = ct || "string";
            }
    
            self.type = type;
            self.content = content;
        },
    
        clone: function() {
            return new Flag(
                this.name, this.content, this.type,
                copy(this.props), this.file
            );
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
    
        exportData: function() {
    
            var exportData = this.pget("flag." + this.type + ".exportData");
    
            if (exportData) {
                return exportData(this);
            }
    
            return extend({}, {
                contentType: this.type,
                content: this.content,
                template: this.file.ext + ".flag." + this.name
    
            }, this.props);
    
        }
    
    });

    return Flag;

}());

