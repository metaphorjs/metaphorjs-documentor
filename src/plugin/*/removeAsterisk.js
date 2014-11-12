
var globalCache = require("../../var/globalCache.js");


module.exports = globalCache.add("*.removeAsterisk", function(text) {

    text = text.replace("/**", '');
    text = text.replace("*/", '');
    //text = text.trim();

    var lines   = text.split("\n"),
        min     = 1000,
        newLines= [],
        aFound  = false,
        line,
        i, l,
        j, jl;

    for (i = 0, l = lines.length; i < l; i++) {

        line = lines[i].trim();

        if (line.charAt(0) == '*') {
            aFound  = true;
            line    = line.substr(1);
            newLines.push(line);

            for (j = 0, jl = line.length; j < jl; j++) {
                if (line.charAt(j) != " ") {
                    min = Math.min(min, j);
                    break;
                }
            }
        }
        else {
            newLines.push(null);
        }
    }

    if (!aFound) {

        newLines = [];

        for (i = 0, l = lines.length; i < l; i++) {

            line = lines[i];
            newLines.push(line);

            for (j = 0, jl = line.length; j < jl; j++) {
                if (line.charAt(j) != " ") {
                    min = Math.min(min, j);
                    break;
                }
            }
        }
    }

    for (i = 0; i < l; i++) {
        if (newLines[i] !== null) {
            newLines[i] = newLines[i].substr(min);
        }
        else {
            newLines[i] = lines[i];
        }
    }

    return newLines.join("\n");
});