
var DocumentorBase = require("./DocumentorBase.js"),
    extend = require("../../metaphorjs/src/func/extend.js"),
    fsextra = require("fs.extra"),
    fs = require("fs");

module.exports = DocumentorBase.$extend({

    doc: null,
    outDir: null,


    $init: function(doc, cfg) {
        
        var self = this;

        extend(self, cfg, true, false);

        self.doc = doc;
    },


    cleanupOutDir: function() {

    },

    copyToOut: function() {

    },

    writeOut: function(out) {
        if  (this.out) {
            fs.writeFileSync(this.out, out);
        }
        else {
            process.stdout.write(out);
        }
    },


    render: function() {

    }

});