/**
 * Helper module for processing multiple files using docit.
 * @requires logly
 */

var logly = require("logly");
var docit = require("./docit");
var fs = require("fs");
var path = require("path");

exports.processFiles = function (config, sourceDir, targetDir) {
    if (!sourceDir) {
        sourceDir = config.get("dir");
    }
    if (!targetDir) {
        targetDir = config.get("out");
    }
    fs.readdir(sourceDir, function(error, dirContents) {
        if (error) {
            throw error;
        }
        if (config.get("includeFiles")) {
            dirContents = filterFiles(dirContents, config.get("includeFiles"));
        }
        checkTargetDir(targetDir);
        for (var i = 0; i < dirContents.length; i += 1) {
            var path = sourceDir + "/" + dirContents[i];
            var stats = fs.statSync(path);
            if (stats.isDirectory()) {
                exports.processFiles(config, path, targetDir + "/" + dirContents[i]);
            } else {
                var targetFile = makeTargetFilename(dirContents[i]);
                processFile(path, targetDir + "/" + targetFile, config);
            }
        }
    });
};

function processFile(source, target, config) {
    fs.readFile(source, "utf8", function (error, data) {
        if (error) {
            logly.warn("Failed to read file '" + source + "'");
            logly.error(error);
        } else {
            try {
                data = docit.commentsToMD(data, config, makeModuleName(source));
                fs.writeFile(target, data, "utf8", function (error) {
                    if (error) {
                        logly.warn("Failed to write file '" + target + "'");
                        logly.error(error);
                    }
                });
            } catch (error) {
                logly.warn("Failed to process file '" + source + "'");
                logly.error(error);
            }
        }
    });
}

function filterFiles(fileList, filter) {
    var filters = filter.split(",");
    var filtered = [];
    for (var i1 = 0; i1 < fileList.length; i1++) {
        var matched = false;
        for (var i2 = 0; i2 < filters.length && !matched; i2++) {
            matched = fileList[i1].match(filters[i2].trim()) && filtered.push(fileList[i1]);
        }
    }

    return filtered;
}

function checkTargetDir(targetDir) {
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, "0755");
    }
}

function makeTargetFilename(sourceFileName) {
    return sourceFileName.indexOf(".") !== -1 ?
        sourceFileName.substring(0, sourceFileName.lastIndexOf(".")) + ".md" :
        sourceFileName + ".md";
}

function makeModuleName(sourceFileName) {
    return path.basename(sourceFileName);
}
