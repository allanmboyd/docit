var formaterrors = require("formaterrors");
var jsCodeHandler = require("../lib/codeHandlers/jsCodeHandler");
var loadModule = require("./testHelpers/moduleLoader.js").loadModule;
var parser = require("../lib/parser");
var should = require("should");
var util = require("util");

var docitModule = loadModule("./lib/docit.js");
var docitExports = docitModule.module.exports;

var TEST_CODE = "/** \n" +
    " * An API that provides various options for formatting and highlighting Errors. May be useful for logging and test\n" +
    " * frameworks for example.\n" +
    " *\n" +
    " * Stack lines can be filtered in and out based on patterns and limited by range (e.g. lines 2 through 10). Stack lines\n" +
    " * and error message can have highlights applied based on patterns. Finally stack lines can be formatted to include or\n" +
    " * exclude available fields.\n" +
    " *\n" +
    " * The API is quite flexible with a range of methods varying in level with means to specify custom highlights and\n" +
    " * formats.\n" +
    " * @module formaterrors\n" +
    " * @class formaterrors\n" +
    " * @requires diffMatchPatch, stack-trace\n" +
    " */\n" +
    "var util = require('util');\n" +
    "var diffMatchPatch = new (require('diff_match_patch')).diff_match_patch();\n" +
    "var stackTrace = require('stack-trace');\n" +
    "\n" +
    "var LONG_EXPECTED = 40;\n" +
    "var LONG_ACTUAL = 40;\n" +
    "var DEFAULT_FORMAT = new StackFormat();\n" +
    "\n" +
    "/**\n" +
    " * Format the stack part (i.e. the stack lines not the message part in the stack) according to a specified StackFormat.\n" +
    " * (See exports.StackFormat for available stack line fields.)\n" +
    " *\n" +
    " * @param {Error} error the error whose stack to format\n" +
    " * @param {StackFormat} stackFormat the specification for the required format\n" +
    " * @return {Error} the given error with its stack modified according to the given StackFormat\n" +
    " */\n" +
    "exports.formatStack = function (error, stackFormat) {\n" +
    "    return formatStackInternal(error, getMessages(error).join(' ') + '\n', stackFormat);\n" +
    "};\n" +
    "\n";

TEST_CODE_MD = "formaterrors\n============\n\n" +
    "An API that provides various options for formatting and highlighting Errors. May be useful for logging and test\n" +
    "frameworks for example.\n\n" +
    "Stack lines can be filtered in and out based on patterns and limited by range (e.g. lines 2 through 10). Stack lines\n" +
    "and error message can have highlights applied based on patterns. Finally stack lines can be formatted to include or\n" +
    "exclude available fields.\n\n" +
    "The API is quite flexible with a range of methods varying in level with means to specify custom highlights and\n" +
    "formats.\n\n" +
    "*Requires:* diffMatchPatch, stack-trace\n\n" +
    "formatStack\n-----------\n\n###exports.formatStack = function (error, stackFormat)###\n\n" +
    "Format the stack part (i.e. the stack lines not the message part in the stack) according to a specified StackFormat.\n" +
    "(See exports.StackFormat for available stack line fields.)\n\n\n" +
    "####Parameters####\n\n* error *Error* the error whose stack to format\n" +
    "* stackFormat *StackFormat* the specification for the required format\n\n" +
    "####Returns####\n\n" +
    "*Error* the given error with its stack modified according to the given StackFormat\n\n";

exports.testCommentsToMD = function(test) {
    var comment = "/**\nSome module comment\n*@module Something\n*@requires nothing\n*/\n";
    var md = docitExports.commentsToMD(comment);
    should.equal(md, "Something\n=========\n\nSome module comment\n\n*Requires:* nothing\n\n");
    md = docitExports.commentsToMD(TEST_CODE, jsCodeHandler);
    try {
        should.equal(TEST_CODE_MD, md);
    } catch (error) {
        var stackTheme = new formaterrors.StackTheme();
        stackTheme.messageLineHighlights = [formaterrors.STYLES.BOLD];
        stackTheme.stackHighlights = [formaterrors.STYLES.BOLD];
        stackTheme.stackHighlightPatterns = ["testDocit"];
        throw formaterrors.highlightAssertionError(error, stackTheme);
    }
    test.done();
};

exports.testApplyMarkdown = function(test) {
    var md = docitModule.applyMarkdown("Hello", "=");
    md.should.equal("Hello\n=====");
    md = docitModule.applyMarkdown("Hello", "-");
    md.should.equal("Hello\n-----");
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


exports.testDetermineTagValue = function (test) {
    var comment = "/**\nSome method comment\n*@method hello\n*/\n";
    var comments = parser.parse(comment);
    var tagValue = docitModule.determineTagValue("@method", comments[0]);
    tagValue.should.equal("hello");
    tagValue = docitModule.determineTagValue("@requires", comments[0]);
    should.not.exist(tagValue);

    comment = "/**\nSome method comment\n@param p a param\n*@method hello\n*/\n";
    comments = parser.parse(comment);
    tagValue = docitModule.determineTagValue("@param", comments[0]);
    util.inspect(tagValue).should.equal(util.inspect({"name": "p", "comment": "a param"}));
    tagValue = docitModule.determineTagValue("@method", comments[0]);
    tagValue.should.equal("hello");
    tagValue = docitModule.determineTagValue("@requires", comments[0]);
    should.not.exist(tagValue);

    comment = "/**\nSome method comment\n*/\nfunction aMethod() {}";
    comments = parser.parse(comment, jsCodeHandler);
    tagValue = docitModule.determineTagValue("methodSignature", comments[0]);
    tagValue.should.equal("function aMethod()");

    tagValue = docitModule.determineTagValue("methodName", comments[0]);
    tagValue.should.equal("aMethod");
    test.done();
};

exports.testProcessModuleComment = function (test) {
    var moduleComment = "/** \n" +
        " * An API that provides various options for formatting and highlighting Errors. May be useful for logging and test\n" +
        " * frameworks for example.\n" +
        " *\n" +
        " * Stack lines can be filtered in and out based on patterns and limited by range (e.g. lines 2 through 10). Stack lines\n" +
        " * and error message can have highlights applied based on patterns. Finally stack lines can be formatted to include or\n" +
        " * exclude available fields.\n" +
        " *\n" +
        " * The API is quite flexible with a range of methods varying in level with means to specify custom highlights and\n" +
        " * formats.\n" +
        " * @module formaterrors\n" +
        " * @class formaterrors\n" +
        " * @requires diffMatchPatch, stack-trace\n" +
        " */\n";
    var comments = parser.parse(moduleComment);
    var md = docitModule.processModuleComment(comments[0]);

    try {
    should.equal("formaterrors\n============\n\nAn API that provides various options for formatting and " +
        "highlighting Errors. May be useful for logging and test\nframeworks for example.\n\n" +
        "Stack lines can be filtered in and out based on patterns and limited by range (e.g. lines 2 through 10). " +
        "Stack lines\nand error message can have highlights applied based on patterns. Finally stack lines can be " +
        "formatted to include or\nexclude available fields.\n\n" +
        "The API is quite flexible with a range of methods varying in level with means to specify custom " +
        "highlights and\nformats.\n\n" +
        "*Requires:* diffMatchPatch, stack-trace\n", md);
    } catch (error) {
        var stackTheme = new formaterrors.StackTheme();
        stackTheme.messageLineHighlights = [formaterrors.STYLES.BOLD];
        stackTheme.stackHighlights = [formaterrors.STYLES.BOLD];
        stackTheme.stackHighlightPatterns = ["testDocit"];
        throw formaterrors.highlightAssertionError(error, stackTheme);
    }
    test.done();
};

exports.testProcessMethodComment = function (test) {
    var comment = "/**\nSome method comment\n*@param {Object} p1 param1\n@param p2 param2\n" +
        "@return {String} returned value\n*@method hello\n*/\nfunction hello(p1, p2) {}\n";
    var comments = parser.parse(comment);
    var md = docitModule.processMethodComment(comments[0]);
    md.should.equal("hello\n-----\n\nSome method comment\n\n####Parameters####\n\n* p1 *Object* param1\n* p2 param2\n" +
        "\n####Returns####\n\n*String* returned value\n");

    comment = "/**\nSome method comment\n*@param {Object} p1 param1\n@param p2 param2\n" +
        "@return {String} returned value\n*@method hello\n*/\nfunction hello(p1, p2) {}\n";
    comments = parser.parse(comment, jsCodeHandler);
    md = docitModule.processMethodComment(comments[0]);
    md.should.equal("hello\n-----\n\n###function hello(p1, p2)###\n\nSome method comment\n\n####Parameters####\n\n* p1 *Object* param1\n* p2 param2\n" +
        "\n####Returns####\n\n*String* returned value\n");

    comment = "/**\nSome method comment\n*@param {Object} p1 param1\n@param p2 param2\n" +
        "@return {String} returned value\n*@method hello\n*/\nexports.hello = function (p1, p2) {}\n";
    comments = parser.parse(comment, jsCodeHandler);
    md = docitModule.processMethodComment(comments[0]);
    md.should.equal("hello\n-----\n\n###exports.hello = function (p1, p2)###\n\nSome method comment\n\n####Parameters####\n\n* p1 *Object* param1\n* p2 param2\n" +
        "\n####Returns####\n\n*String* returned value\n");

    test.done();
};

exports.testProcessParamTag = function (test) {
    var paramTag = {
        name: "p",
        comment: "comment"
    };

    var md = docitModule.processParamTag(paramTag);
    md.should.equal("* p comment");

    paramTag.type = "String";
    md = docitModule.processParamTag(paramTag);
    md.should.equal("* p *String* comment");

    test.done();
};

exports.testProcessReturnTag = function (test) {
    var returnTag = {
        type: "String",
        comment: "comment"
    };

    var md = docitModule.processReturnTag(returnTag);
    md.should.equal("*String* comment");

    test.done();
};
