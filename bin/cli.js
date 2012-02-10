var config = require("nconf");
var docit = require("../lib/docit");
var fs = require("fs");
var optimist = require("optimist");
var options = require("./options").options;
var path = require("path");
var util = require("util");

initializeOptimist();

var argv = optimist.argv;

if(argv.h || argv.help) {
    optimist.showHelp();
    process.exit(0);
}

config.argv().env();

if(argv.config){
    config.file({file: argv.config});
}

initializeConfigDefaults();

if (config.get("dir")) {
    var outDir = config.get("out");
    processFiles(config.get("dir"), outDir);
} else {
    var buf = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        buf += chunk;
    });
    process.stdin.on('end',
        function() {
            var md = docit.commentsToMD(buf, config);
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
        data = docit.commentsToMD(data, config, makeModuleName(source));
        fs.writeFile(target, data, "utf8", function (error) {
            if (error) {
                throw error;
            }
        });
    })
}

function checkTargetDir(targetDir) {
    if (!path.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, 0755);
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

function initializeOptimist() {
    importOptionsIntoOptimist();
    optimist.wrap(79).usage(usage());
}

function usage() {
    var u = "Usage: docit [--config=<path/to/config/file>] " +
        "[--dir=<folder/containing/commented/code> | <stdin>] [--out=<path/to/output/folder>] [configOption]";

    return u;
}

function importOptionsIntoOptimist() {
    for (var option in options) {
        if (options.hasOwnProperty(option)) {
            for(var optionAttribute in options[option]) {
                if(options[option].hasOwnProperty(optionAttribute)) {
                    optimist[optionAttribute](option, options[option][optionAttribute]);
                }
            }
        }
    }
}

function initializeConfigDefaults() {
    var defaults = (function () {
        var d = {};
        for (var option in options) {
            if(options.hasOwnProperty(option) && options[option]["default"]) {
                d[option] = options[option]["default"];
            }
        }

        return d;
    }());

    config.defaults(defaults);
}