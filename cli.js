
var Documentor = require("./dist/metaphorjs.documentor.js");

var doc = new Documentor;

try {
    doc.eat(process.cwd() + "/../metaphorjs-model/src/**", "js");
}
catch (thrown) {
    console.log(thrown);
}


if (process.argv[2] == "--json") {
    console.log(JSON.stringify(doc.getData()));
}
else {
    console.log(doc.getData());
}