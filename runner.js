
var Documentor = require("./dist/metaphorjs.documentor.js"),
    minimist = require("minimist");

var doc = new Documentor;

try {
    doc.eat(process.cwd() + "/../metaphorjs-model/src/**", "js");
}
catch (thrown) {
    console.log(thrown);
}

var args = minimist(process.argv.slice(2), {boolean: true});

var rndrCls = doc.getRenderer(args.renderer || "raw");

if (rndrCls) {

    var renderer = new rndrCls({
        doc: doc
    });

    console.log(renderer.render());
}
