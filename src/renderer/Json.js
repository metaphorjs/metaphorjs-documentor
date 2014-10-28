
var DocumentorRenderer = require("../DocumentorRenderer.js"),
    globalCache = require("../var/globalCache.js");

module.exports = globalCache.add("renderer.json", DocumentorRenderer.$extend({

    render: function() {
        return JSON.stringify(this.doc.exportData(), null, 2);
    }

}));


