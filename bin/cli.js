var argv = require('optimist').argv;
var config = require("nconf");
var docit = require("../lib/docit");
var fs = require("fs");
var path = require("path");
var util = require("util");

var configFile = argv.config || "config.json";
config.argv().env().file({file: configFile});
config.defaults(docit.DEFAULT_SETTINGS);

if (config.get("dir")) {
    var outDir = config.get("out") || "docit";
    processFiles(config.get("dir"), outDir);
} else {
    var buf = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        buf += chunk;
    });
    process.stdin.on('end',
        function() {
            var md = docit.commentsToMD(buf, codeHandler);
            process.stdout.write(md);
        }).resume();
}

function processFiles(sourceDir, targetDir) {
    fs.readdir(sourceDir, function(error, dirContents) {
        if (error) {
            throw error;
        }
        checkTargetDir(targetDir);
        for (var i = 0; i < dirContents.length; i += 1) {
            var path = sourceDir + "/" + dirContents[i];
            var stats = fs.statSync(path);
            if (stats.isDirectory()) {
                processFiles(path, targetDir + "/" + dirContents[i]);
            } else {
                var targetFile = makeTargetFilename(dirContents[i]);
                processFile(path, targetDir + "/" + targetFile)
            }
        }
    });
}

function processFile(source, target) {
    fs.readFile(source, "utf8", function (error, data) {
        if (error) {
            throw error;
        }
        data = docit.commentsToMD(data, config);
        fs.writeFile(target, data, "utf8", function (error) {
            if (error) {
                throw error;
            }
        });
    })
}

function checkTargetDir(targetDir) {
    if (!path.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, 0766);
    }
}

function makeTargetFilename(sourceFileName) {
    return sourceFileName.indexOf(".") !== -1 ?
        sourceFileName.substring(0, sourceFileName.lastIndexOf(".")) + ".md" :
        sourceFileName + ".md";
}