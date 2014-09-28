
var Renderer = require("../Renderer.js"),
    ns = require("../var/ns.js");


module.exports = ns.add("renderer.raw", Renderer.$extend({

    render: function() {
        return this.doc.getData();
    }

}));

