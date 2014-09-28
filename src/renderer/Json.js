
var Renderer = require("../Renderer.js"),
    ns = require("../var/ns.js");


module.exports = ns.add("renderer.json", Renderer.$extend({

    render: function() {
        return JSON.stringify(this.doc.getData());
    }

}, {
    mime: "application/json"
}));


