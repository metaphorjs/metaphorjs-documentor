
module.exports = function(fileType){

    fileType = fileType.replace("language-", "");

    if (fileType.indexOf('txt-') === 0) {
        fileType = fileType.split('-')[1];
    }

    switch (fileType) {
        case "js":
        case "json":
            return "language-javascript";
        default:
            return "language-" + fileType;
    }
};