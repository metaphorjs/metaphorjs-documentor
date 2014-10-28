
var DocumentorRenderer = require("../DocumentorRenderer.js"),
    globalCache = require("../var/globalCache.js");


module.exports = globalCache.add("renderer.raw", DocumentorRenderer.$extend({

    render: function() {
        return this.doc.exportData();
    },

    writeOut: function(out) {
        console.log(out);
    }

}));

