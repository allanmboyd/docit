var loadModule = require("./testHelpers/moduleLoader.js").loadModule;
var parser = require("../lib/parser");
var should = require("should");
var util = require("util");
var docitModule = loadModule("./lib/docit.js");
var docitExports = docitModule.module.exports;
var TEST_CODE = "/** \n" + " * An API that provides various options for formatting and highlighting Errors. May be useful for logging and test\n" + " * frameworks for example.\n" + " *\n" + " * Stack lines can be filtered in and out based on patterns and limited by range (e.g. lines 2 through 10). Stack lines\n" + " * and error message can have highlights applied based on patterns. Finally stack lines can be formatted to include or\n" + " * exclude available fields.\n" + " *\n" + " * The API is quite flexible with a range of methods varying in level with means to specify custom highlights and\n" + " * formats.\n" + " * @module formaterrors\n" + " * @class formaterrors\n" + " * @requires diffMatchPatch, stack-trace\n" + " */\n" + "var util = require('util');\n" + "var diffMatchPatch = new (require('diff_match_patch')).diff_match_patch();\n" + "var stackTrace = require('stack-trace');\n" + "\n" + "var LONG_EXPECTED = 40;\n" + "var LONG_ACTUAL = 40;\n" + "var DEFAULT_FORMAT = new StackFormat();\n" + "\n" + "/**\n" + " * Format the stack part (i.e. the stack lines not the message part in the stack) according to a specified StackFormat.\n" + " * (See exports.StackFormat for available stack line fields.)\n" + " *\n" + " * @param {Error} error the error whose stack to format\n" + " * @param {StackFormat} stackFormat the specification for the required format\n" + " * @return {Error} the given error with its stack modified according to the given StackFormat\n" + " */\n" + "exports.formatStack = function (error, stackFormat) {\n" + "    return formatStackInternal(error, getMessages(error).join(' ') + '\n', stackFormat);\n" + "};\n" + "\n";
exports.testCommentsToMD = function(test) {
	var comment = "/**\nSome module comment\n*@module Something\n*@requires nothing\n*/\n";
	var md = docitExports.commentsToMD(comment);
	should.equal(md, "Something\n=========\nSome module comment\n*Requires:* nothing\n");
	docitExports.commentsToMD(TEST_CODE);
	test.done();
};
exports.testBuildMarkdownFromComment = function(test) {
	var comment = "/**\nSome module comment\n*@module Something\n*@requires nothing\n*/\n";
	var comments = parser.parse(comment);
	var md = "";
	md = docitModule.buildMarkdownFromComment(comments[0], md);
	should.equal(md, "Some module comment\n*Requires:* nothing\n");
	test.done();
};
exports.testDetermineModuleName = function(test) {
	var moduleName = docitModule.determineModuleName(TEST_CODE);
	moduleName.should.equal("formaterrors");
	var comment = "/**\nSome module comment\n*@module Something\n*requires nothing\n*/\n";
	moduleName = docitModule.determineModuleName(comment);
	moduleName.should.equal("Something");
	test.done();
};
exports.testApplyMarkdown = function(test) {
	var md = docitModule.applyMarkdown("Hello", "=");
	md.should.equal("Hello\n=====\n");
	md = docitModule.applyMarkdown("Hello", "-");
	md.should.equal("Hello\n-----\n");
	md = docitModule.applyMarkdown("Hello", "*");
	md.should.equal("*Hello*");
	md = docitModule.applyMarkdown("Hello", "**");
	md.should.equal("**Hello**");
	md = docitModule.applyMarkdown("Hello", "#");
	md.should.equal("#Hello#");
	md = docitModule.applyMarkdown("Hello", "##");
	md.should.equal("##Hello##");
	md = docitModule.applyMarkdown("Hello", "###");
	md.should.equal("###Hello###");
	md = docitModule.applyMarkdown("Hello", "`");
	md.should.equal("`Hello`");
	md = docitModule.applyMarkdown("Hello", "_");
	md.should.equal("_Hello_");
	md = docitModule.applyMarkdown("Hello", "__");
	md.should.equal("__Hello__");
	test.done();
};
exports.testCharConcat = function(test) {
	var s = docitModule.charConcat("=", 5);
	s.should.equal("=====");
	test.done();
};