var loadModule = require("./testHelpers/moduleLoader.js").loadModule;
var should = require("should");
var util = require("util");

var jsModule = loadModule("./lib/codehandlers/jsCodeHandler.js");
var jsExports = jsModule.module.exports;

exports.testMethodSignature = function (test) {
    jsExports.methodSignature("function hello() {").should.equal("function hello()");
    jsExports.methodSignature(" function hello() { ").should.equal("function hello()");
    jsExports.methodSignature("var hello = function () { ").should.equal("var hello = function ()");
    test.done();
};

exports.testMethodNameFromMethodSignature = function (test) {
    var mName = jsExports.methodNameFromMethodSignature("var hello = function()");
    mName.should.equal("hello");
    mName = jsExports.methodNameFromMethodSignature("var helloVar = function ()");
    mName.should.equal("helloVar");
    mName = jsExports.methodNameFromMethodSignature("    var helloVar   =   function ()");
    mName.should.equal("helloVar");
    mName = jsExports.methodNameFromMethodSignature("exports.hello = function ()");
    mName.should.equal("hello");
    mName = jsExports.methodNameFromMethodSignature("    exports.hello   = function ()");
    mName.should.equal("hello");
    mName = jsExports.methodNameFromMethodSignature("var variable = function ()");
    mName.should.equal("variable");
    mName = jsExports.methodNameFromMethodSignature("var hello = function ()");
    mName.should.equal("hello");
    mName = jsExports.methodNameFromMethodSignature("var hello = function ()");
    mName.should.equal("hello");
    mName = jsExports.methodNameFromMethodSignature("var hello = function()");
    mName.should.equal("hello");
    mName = jsExports.methodNameFromMethodSignature("var hello= function ()");
    mName.should.equal("hello");
    mName = jsExports.methodNameFromMethodSignature("var hello=function ()");
    mName.should.equal("hello");
    mName = jsExports.methodNameFromMethodSignature("var hello=function()");
    mName.should.equal("hello");
    mName = jsExports.methodNameFromMethodSignature("var hello=function ()");
    mName.should.equal("hello");
    mName = jsExports.methodNameFromMethodSignature("function hello ()");
    mName.should.equal("hello");
    mName = jsExports.methodNameFromMethodSignature("function hello ()");
    mName.should.equal("hello");
    mName = jsExports.methodNameFromMethodSignature("    function hello ()");
    mName.should.equal("hello");
    mName = jsExports.methodNameFromMethodSignature("function hello()");
    mName.should.equal("hello");
    mName = jsExports.methodNameFromMethodSignature("function()");
    should.not.exist(mName);
    mName = jsExports.methodNameFromMethodSignature("var hello = 5;");
    should.not.exist(mName);
    test.done();
};

exports.testIsMethodDecl = function (test) {
    jsExports.isMethodDecl("hello").should.equal(false);
    jsExports.isMethodDecl("var hello = function ()").should.equal(true);
    jsExports.isMethodDecl("var hello = function (param1)").should.equal(true);
    jsExports.isMethodDecl("var hello = function (param1, param2)").should.equal(true);
    jsExports.isMethodDecl("var hello = function(param1, param2)").should.equal(true);
    jsExports.isMethodDecl("function hello ()").should.equal(true);
    jsExports.isMethodDecl("function hello()").should.equal(true);
    jsExports.isMethodDecl("function hello(param1)").should.equal(true);
    jsExports.isMethodDecl("function hello(param1, param2)").should.equal(true);
    jsExports.isMethodDecl("function ()").should.equal(true);
    test.done();
};

exports.testVariableNameFromVariableDecl = function (test) {
    jsExports.variableNameFromVariableDecl("var hello = 1").should.equal("hello");
    jsExports.variableNameFromVariableDecl("var    hello = 1").should.equal("hello");
    jsExports.variableNameFromVariableDecl("var    hello    = 1").should.equal("hello");
    jsExports.variableNameFromVariableDecl("var    hello").should.equal("hello");
    test.done();
};