var formaterrors = require("formaterrors");
var loadModule = require("./testHelpers/moduleLoader.js").loadModule;
var parser = require("../lib/parser");
var should = require("should");
var util = require("util");

var docitModule;
var docitExports;

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
    "(See exports.StackFormat for available stack line fields.)\n\n" +
    "####Parameters####\n\n* error *Error* the error whose stack to format\n" +
    "* stackFormat *StackFormat* the specification for the required format\n\n" +
    "####Returns####\n\n" +
    "*Error* the given error with its stack modified according to the given StackFormat\n\n";

module.exports = {
    setUp: function (callback) {
        docitModule = loadModule("./lib/docit.js");
        docitExports = docitModule.module.exports;
        callback();
    },
    testCommentsToMDMultiLineTags : function (test) {
        var methodComment = "/**\nA method comment\n@param {String} s a\nmulti\nline\nparam\ncomment\n" +
            "@return {Object} a\nmulti\nline\nreturn\ncomment\n*/\n";
        methodComment += methodComment;

        var config = require("nconf");
        config.overrides({
            "includeHRBeforeMethod": "false"
        });
        config.defaults(docitModule.DEFAULT_SETTINGS);

        var md = docitExports.commentsToMD(methodComment, config);

        var expected = "A method comment\n####Parameters####\n\n* s *String* a\nmulti\nline\nparam\ncomment\n\n" +
            "####Returns####\n\n*Object* a\nmulti\nline\nreturn\ncomment\n\n";
        expected += expected;
        md.should.equal(expected);

        test.done();
    },
    testCommentsToMD : function(test) {
        var config = require("nconf");
        config.overrides({
            "codeHandler": "../lib/codeHandlers/jsCodeHandler",
            "includeHRBeforeMethod": "false"
        });
        config.defaults(docitModule.DEFAULT_SETTINGS);

        var comment = "/**\nSome module comment\n*@module Something\n*@requires nothing\n*/\n";
        var md = docitExports.commentsToMD(comment);
        should.equal(md, "Something\n=========\n\nSome module comment\n\n*Requires:* nothing\n\n");
        md = docitExports.commentsToMD(TEST_CODE, config);
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
    },

    testApplyMarkdown : function(test) {
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
    },

    testCharConcat : function(test) {
        var s = docitModule.charConcat("=", 5);
        s.should.equal("=====");
        test.done();
    },

    testDetermineTagValue : function (test) {
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

        comment = "/**\nSome method comment\n@private\n*/\nfunction aMethod() {}";
        comments = parser.parse(comment, require("../lib/codeHandlers/jsCodeHandler"));
        tagValue = docitModule.determineTagValue("methodSignature", comments[0]);
        tagValue.should.equal("function aMethod()");

        tagValue = docitModule.determineTagValue("methodName", comments[0]);
        tagValue.should.equal("aMethod");

        tagValue = docitModule.determineTagValue("@private", comments[0]);
        tagValue.should.equal("");
        test.done();
    },

    testIsPrivateComment : function (test) {
        docitModule.isPrivateComment(parser.parse("/**\nHello\n*/\n")[0]).should.equal(false);
        docitModule.isPrivateComment(parser.parse("/**\nHello\n@api private\n*/\n")[0]).should.equal(true);
        docitModule.isPrivateComment(parser.parse("/**\nHello\n@api public\n*/\n")[0]).should.equal(false);
        docitModule.isPrivateComment(parser.parse("/**\nHello\n@private\n*/\n")[0]).should.equal(true);

        test.done();
    },

    testProcessPrivateComment : function (test) {
        var privateComment = "/**\nhello\n\n@method m\n@private\n*/";
        var md = docitExports.commentsToMD(privateComment);
        md.should.equal("");

        privateComment = "/**\n@api private\n*/";
        md = docitExports.commentsToMD(privateComment);
        md.should.equal("");

        var config = require("nconf");
        config.overrides({
            "codeHandler": "../lib/codeHandlers/jsCodeHandler",
            "includePrivate" : "true",
            "includeHRBeforeMethod" : "false"
        });
        config.defaults(docitModule.DEFAULT_SETTINGS);

        privateComment = "/**\nhello\n\n@method m\n@private\n*/";
        md = docitExports.commentsToMD(privateComment, config);
        md.should.equal("m\n-\n\nhello\n\n*API* private\n\n");
        test.done();
    },

    testProcessModuleComment : function (test) {
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

        comments = parser.parse("/**\n@module hello\n*/");
        md = docitModule.processModuleComment(comments[0], "defaultName");
        md.should.include("hello");
        md.should.not.include("defaultName");

        comments = parser.parse("/**\n Some module comment\n*/");
        md = docitModule.processModuleComment(comments[0], "defaultName");
        md.should.include("defaultName");

        test.done();
    },

    testProcessVariableComment : function (test) {
        var comment = "/**\nHold all the states for tags.\n*/\nexports.STATES = some stuff\n";
        var comments = parser.parse(comment, require("../lib/codeHandlers/jsCodeHandler"));
        var md = docitModule.processVariableComment(comments[0]);
        md.should.equal("Variables\n---------\n\n###STATES###\n\nHold all the states for tags.\n");

        comment += "\n/**\nAnother variable\n@private\n*/\nexports.priv = 5\n";
        comments = parser.parse(comment, require("../lib/codeHandlers/jsCodeHandler"));
        comments.length.should.equal(2);
        docitModule.processVariableComment(comments[1]).should.equal("");

        var config = require("nconf");
        config.overrides({
            "codeHandler": "../lib/codehandlers/jsCodeHandler",
            "includePrivate": "true"
        });
        config.defaults(docitModule.DEFAULT_SETTINGS);
        md = docitExports.commentsToMD(comment, config);
        md.should.equal("Variables\n---------\n\n###STATES###\n\nHold all the states for tags.\n" +
            "\n\n###priv (private)###\n\nAnother variable\n\n");
        test.done();
    },

    testProcessTypeComment : function (test) {
        var comment = "/**\nStore comment details\nfor comments.\n@class Comment\n@constructor new Comment()\n*/\nexports.Comment = function ()\n";
        var comments = parser.parse(comment, require("../lib/codeHandlers/jsCodeHandler"));
        var md = docitModule.processTypeComment(comments[0]);
        md.should.equal("Types\n-----\n\n###Comment###\n*Constructor:* new Comment()\n\nStore comment details\nfor comments.\n");

        md = docitExports.commentsToMD(comment);
        md.should.equal("Types\n-----\n\n###Comment###\n*Constructor:* new Comment()\n\nStore comment details\nfor comments.\n\n");

        comment += "\n/**\nAnother class\n@class Another\n@constructor new Another()\n@private\n*/";
        md = docitExports.commentsToMD(comment);
        md.should.equal("Types\n-----\n\n###Comment###\n*Constructor:* new Comment()\n\nStore comment details\nfor comments.\n\n");

        var config = require("nconf");
        config.overrides({
            "codeHandler": "../lib/codehandlers/jsCodeHandler",
            "includePrivate": "true"
        });
        config.defaults(docitModule.DEFAULT_SETTINGS);
        md = docitExports.commentsToMD(comment, config);
        md.should.equal("Types\n-----\n\n###Comment###\n*Constructor:* new Comment()\n\nStore comment details\nfor comments.\n\n" +
            "\n###Another (private)###\n*Constructor:* new Another()\n\nAnother class\n\n");

        test.done();
    },

    testProcessMethodComment : function (test) {

        var comment = "/**\nSome method comment\n\n*@param {Object} p1 param1\n@param p2 param2\n" +
            "@return {String} returned value\n*@method hello\n*/\nfunction hello(p1, p2) {}\n";
        var comments = parser.parse(comment);
        var md = docitModule.processMethodComment(comments[0]);
        md.should.equal(docitModule.DEFAULT_SETTINGS.horizontalRuleMarkdown + "hello\n-----\n\nSome method comment\n\n####Parameters####\n\n* p1 *Object* param1\n* p2 param2\n" +
            "\n####Returns####\n\n*String* returned value\n");

        comment = "/**\nSome method comment\n\n*@param {Object} p1 param1\n@param p2 param2\n" +
            "@return {String} returned value\n*@method hello\n*/\nfunction hello(p1, p2) {}\n";
        comments = parser.parse(comment, require("../lib/codeHandlers/jsCodeHandler"));
        md = docitModule.processMethodComment(comments[0]);
        md.should.equal(docitModule.DEFAULT_SETTINGS.horizontalRuleMarkdown + "hello\n-----\n\n###function hello(p1, p2)###\n\nSome method comment\n\n####Parameters####\n\n* p1 *Object* param1\n* p2 param2\n" +
            "\n####Returns####\n\n*String* returned value\n");

        comment = "/**\nSome method comment\n\n*@param {Object} p1 param1\n@param p2 param2\n" +
            "@return {String} returned value\n*@method hello\n*/\nexports.hello = function (p1, p2) {}\n";
        comments = parser.parse(comment, require("../lib/codeHandlers/jsCodeHandler"));
        md = docitModule.processMethodComment(comments[0]);
        md.should.equal(docitModule.DEFAULT_SETTINGS.horizontalRuleMarkdown + "hello\n-----\n\n###exports.hello = function (p1, p2)###\n\nSome method comment\n\n####Parameters####\n\n* p1 *Object* param1\n* p2 param2\n" +
            "\n####Returns####\n\n*String* returned value\n");

        test.done();
    },

    testCodeComment : function (test) {
        var config = require("nconf");
        config.overrides({
            "includeHRBeforeMethod": "false"
        });
        config.defaults(docitModule.DEFAULT_SETTINGS);

        var comment = "/**\n* Here is an example:\n*    a = 5;\n*    b = 6;\n@method test\n*/";
        var md = docitExports.commentsToMD(comment, config);
        var lines = md.split("\n");
        lines[3].should.equal("Here is an example:");
        lines[4].should.equal("    a = 5;");
        lines[5].should.equal("    b = 6;");
        test.done();
    },

    testProcessParamTag : function (test) {
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
    },

    testProcessReturnTag : function (test) {
        var returnTag = {
            type: "String",
            comment: "comment"
        };

        var md = docitModule.processReturnTag(returnTag);
        md.should.equal("*String* comment");

        test.done();
    }
};
