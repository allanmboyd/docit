#!/usr/bin/env node

var config = require("nconf");
var cliHelper = require("../lib/cliHelper");
var docit = require("../lib/docit");
var optimist = require("optimist");
var options = require("./options").options;

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
    cliHelper.processFiles(config);
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


function initializeOptimist() {
    importOptionsIntoOptimist();
    optimist.wrap(79).usage("Usage: docit [--config=<file path>] " +
        "[--dir=<dir path> | <stdin>] [--out=<dir path>] [configOption]");
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