var docit = require("./docit");
var fs = require("fs");
var path = require("path");

exports.processFiles = function (config, sourceDir, targetDir) {
    if(!sourceDir) {
        sourceDir = config.get("dir");
    }
    if(!targetDir) {
        targetDir = config.get("out");
    }
    fs.readdir(sourceDir, function(error, dirContents) {
        if (error) {
            throw error;
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
            throw error;
        }
        data = docit.commentsToMD(data, config, makeModuleName(source));
        fs.writeFile(target, data, "utf8", function (error) {
            if (error) {
                throw error;
            }
        });
    });
}

function checkTargetDir(targetDir) {
    if (!path.existsSync(targetDir)) {
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
