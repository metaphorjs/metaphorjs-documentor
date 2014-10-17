


var http    = require("http"),
    child   = require("child_process");


http.createServer(function(request, response){

    var proc = child.spawn("node", ["runner.js", "--renderer=json"]),
        json = "";

    proc.stdout.on("data", function(data){
        json += data;
    });

    proc.on("exit", function(){
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(json);
    });

}).listen('3001', '0.0.0.0');