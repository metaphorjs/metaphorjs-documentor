
var globalCache = require("../../../../var/globalCache.js");

module.exports = (function(){


    var parseComment = function(text, file) {

        var removeAsterisk = file.pget("comment.removeAsterisk"),
            getCurly = file.pget("comment.getCurly");


        text = removeAsterisk(text);

        var lines       = text.split("\n"),
            flagReg     = /@[^\s]+/,
            aliases     = file.pcall("comment.getFlagAliases", file),
            descrFlag   = aliases["description"] || "description",
            line,
            i, l, j,
            description = "",
            inx         = 0,
            parts       = [],
            partInx     = 0,
            part,
            flag,
            subInx,
            sub;

        for (i = 0, l = lines.length; i < l; i++) {

            if (i > 0) {
                inx = lines.slice(0, i).join("\n").length;
            }

            line = lines[i];
            part = line.trim();

            if (part == '{' || part == '}') {
                continue;
            }

            if (part.charAt(0) == '@') {

                if (description) {
                    parts.push({flag: descrFlag, content: description, sub: [], inx: partInx});
                    description = "";
                    partInx++;
                }

                sub     = null;
                flag    = null;

                if (part.charAt(part.length - 1) == '{') {

                    sub     = getCurly(text, inx + lines[i].length - 1);
                    part    = part.substring(0, part.length - 2).trim();
                    i      += sub.trim().split("\n").length + 1;
                }
                else if (part.charAt(part.length - 1) == '}') {

                    subInx  = getCurly(part, null, true, true);
                    if (subInx && (sub = part.substring(subInx[0], subInx[1])) &&
                        sub.match(flagReg)) {

                        part    = part.substr(0, subInx[0] - 1) + part.substr(subInx[1] + 1);
                        part    = part.trim();
                    }
                    else {
                        sub     = null;
                    }
                }
                else if (part.charAt(part.length - 1) != '}' &&
                         part.replace(flagReg, "").trim() != "") {

                    for (j = i + 1; j < l; j++) {
                        if (lines[j].trim().substr(0, 1) != '@') {
                            part += "\n" + lines[j];
                            i = j;
                        }
                        else {
                            break;
                        }
                    }
                }


                if (sub) {
                    sub = parseComment.call(this, sub, file);
                }

                part = part.replace(flagReg, function(match){
                    flag = match.substr(1);
                    return "";
                });

                part = part.trim();

                while (aliases.hasOwnProperty(flag)) {
                    flag = aliases[flag]
                }

                if (part == "") {
                    part = null;
                }

                parts.push({flag: flag, content: part, sub: sub || [], inx: partInx});
                partInx++;
            }
            else if (part) {
                if (description) {
                    description += "\n"
                }
                description += line;
            }
        }

        if (description) {
            parts.push({flag: descrFlag, content: description, sub: [], inx: partInx});
        }


        return parts;

    };


    return globalCache.add("file.*.comment.parseComment",  parseComment);
}());
