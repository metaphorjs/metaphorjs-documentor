
var Documentor = require("./dist/metaphorjs.documentor.js");

var doc = new Documentor;


doc.eat(process.cwd() + "/src/**", "js");


if (process.argv[2] == "--json") {
    console.log(JSON.stringify(doc.getData()));
}
else {
    console.log(doc.getData());
}