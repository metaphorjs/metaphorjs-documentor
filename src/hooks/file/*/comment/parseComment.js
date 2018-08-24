
var globalCache = require("../../../../var/globalCache.js");

/**
 * @group hook
 * @function
 * Parse comment. Returns array with comment parts
 * @param {string} text
 * @param {File} file
 * @return {array} {
 *  @type {string} flag
 *  @type {string} content
 *  @type {array} sub Sub parts with the same structure
 * }
 */
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
            flag, originalFlag,
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

                // description came from previous line
                // new line starts with @ so its time 
                // to finish description
                if (description) {
                    parts.push({flag: descrFlag, content: description, sub: [], inx: partInx});
                    description = "";
                    partInx++;
                }

                sub     = null;
                flag    = null;
                originalFlag = null;

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

                    // add all following non-@ lines to current flag
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
                    originalFlag = flag = match.substr(1);
                    return "";
                });

                part = part.trim();

                while (aliases.hasOwnProperty(flag)) {
                    flag = aliases[flag]
                }

                if (part == "") {
                    part = null;
                }

                parts.push({
                    flag: flag, 
                    content: part, 
                    sub: sub || [], 
                    inx: partInx,
                    originalFlag: originalFlag});
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
