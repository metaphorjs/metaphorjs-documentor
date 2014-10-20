



var Documentor = require("./dist/metaphorjs.documentor.js"),
    minimist = require("minimist"),
    path = require("path");

var doc = new Documentor;

var loc = path.normalize(process.cwd() + "/../metaphorjs-promise/src"),
    base = path.normalize(loc + "/../../");

//try {
    doc.eat(loc + "/**", "js", {
        namePrefix: "MetaphorJs.",
        basePath: base
    });
//}
//catch (thrown) {
//    console.log(thrown);
//}


doc.prepareItems();


var args = minimist(process.argv.slice(2), {boolean: true});

var rndrCls = doc.getRenderer(args.renderer || "raw");

if (rndrCls) {

    var renderer = new rndrCls({
        doc: doc
    });

    console.log(renderer.render());
}
