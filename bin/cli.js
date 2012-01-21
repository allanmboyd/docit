#!/usr/bin/env node

var docit = require("../lib/docit");
var argv = require('optimist').argv;
var util = require("util");

// process stdin
var buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    buf += chunk;
});
process.stdin.on('end',
    function() {
        var obj = docit.commentsToMD(buf);
        if (argv.debug) {
            process.stdout.write(util.inspect(obj, false, Infinity, true) + '\n');
        } else {
            process.stdout.write(JSON.stringify(obj));
        }
    }).resume();