
var Renderer = require("../Renderer.js"),
    globalCache = require("../var/globalCache.js");


module.exports = globalCache.add("renderer.raw", Renderer.$extend({

    render: function() {
        return this.doc.exportData(null, false, true);
    },

    writeOut: function(out, done) {
        console.log(out);

        if (done) {
            done();
        }
    }

}));

