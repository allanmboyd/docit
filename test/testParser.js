var loadModule = require("./testHelpers/moduleLoader.js").loadModule;
var should = require("should");
var util = require("util");

var parserModule = loadModule("./lib/parser.js");
var parserExports = parserModule.module.exports;

var MULTILINE_CODE_COMMENTS = "/**\n * Some comment text\n* @module testmodule\n * @requires nothing, something\n**/\nfunction () { some \ncode\n here }\n\n /** \n * This is a comment\n\n * @param {String} param a parameter\n *@return {String} the return value\n*/\nvar f = function () { more code }\n /**\n * Another comment \n @param p1 first param\n @param p2 second param\n   */\nfunction codeCodeCode(p1, p2) {\n    code code code \n}";

exports.testParseNoCodeHandler = function (test) {
    var comments;
    comments = parserExports.parse("\n/**\nThis is a module that does something.\n* @module moduleName\n * @requires something\n*/");

    comments.length.should.equal(1);
    comments[0].text.should.equal("This is a module that does something.");
    comments[0].type.should.equal("MODULE");
    comments[0].tags.length.should.equal(2);
    comments[0].tags[0]["@module"].should.equal("moduleName");
    comments[0].tags[1]["@requires"].should.equal("something");

    comments = parserExports.parse("\n/**\nThis is a module that does something.\n* @module moduleName\n * @requires something\n*/" +
        "\nthis should not appear in the result\n/**\nAnother comment\n*/");
    comments.length.should.equal(2);
    comments[0].text.should.equal("This is a module that does something.");
    comments[0].tags.length.should.equal(2);
    comments[0].tags[0]["@module"].should.equal("moduleName");
    comments[0].tags[1]["@requires"].should.equal("something");
    comments[1].text.should.equal("Another comment");
    comments[1].tags.length.should.equal(0);
    util.inspect(comments).should.not.include("this should not appear");

    comments = parserExports.parse("var a = 1;\nfunction hello() {\n   console.log(a); \n}");
    util.inspect(comments).should.equal("''");
    
    comments = parserExports.parse(MULTILINE_CODE_COMMENTS);
    comments.length.should.equal(3);
    comments[0].text.should.equal("Some comment text");
    comments[0].tags.length.should.equal(2);
    comments[0].tags[0]["@module"].should.equal("testmodule");
    comments[0].tags[1]["@requires"].should.equal("nothing, something");
    comments[1].text.should.equal("This is a comment\n");
    comments[1].type.should.equal("METHOD");
    comments[1].tags.length.should.equal(2);
    comments[1].tags[0]["@param"].type.should.equal("String");
    comments[1].tags[0]["@param"].name.should.equal("param");
    comments[1].tags[0]["@param"].comment.should.equal("a parameter");
    comments[1].tags[1]["@return"].type.should.equal("String");
    comments[1].tags[1]["@return"].comment.should.equal("the return value");
    comments[2].text.should.equal("Another comment");
    comments[2].type.should.equal("METHOD");
    should.not.exist(comments[2].tags[0]["@param"].type);
    comments[2].tags.length.should.equal(2);
    comments[2].tags[0]["@param"].name.should.equal("p1");
    comments[2].tags[0]["@param"].comment.should.equal("first param");
    comments[2].tags[1]["@param"].name.should.equal("p2");
    comments[2].tags[1]["@param"].comment.should.equal("second param");

    test.done();
};

exports.testParseJsCodeHandler = function (test) {
    var comments = parserExports.parse(MULTILINE_CODE_COMMENTS, require("../lib/codehandlers/jsCodeHandler"));
    comments[0].text.should.equal("Some comment text");
    comments[0].type.should.equal("MODULE");
    comments[0].tags.length.should.equal(3);
    comments[0].tags[0]["@module"].should.equal("testmodule");
    comments[0].tags[1]["@requires"].should.equal("nothing, something");
    comments[0].tags[2].methodSignature.should.equal("function ()");
    comments[0].tags[2].methodName.should.equal("");
    comments[1].text.should.equal("This is a comment\n");
    comments[1].type.should.equal("METHOD");
    comments[1].tags.length.should.equal(3);
    comments[1].tags[0]["@param"].type.should.equal("String");
    comments[1].tags[0]["@param"].name.should.equal("param");
    comments[1].tags[0]["@param"].comment.should.equal("a parameter");
    comments[1].tags[1]["@return"].type.should.equal("String");
    comments[1].tags[1]["@return"].comment.should.equal("the return value");
    comments[1].tags[2].methodSignature.should.equal("var f = function ()");
    comments[1].tags[2].methodName.should.equal("f");
    comments[2].text.should.equal("Another comment");
    comments[2].type.should.equal("METHOD");
    should.not.exist(comments[2].tags[0]["@param"].type);
    comments[2].tags.length.should.equal(3);
    comments[2].tags[0]["@param"].name.should.equal("p1");
    comments[2].tags[0]["@param"].comment.should.equal("first param");
    comments[2].tags[1]["@param"].name.should.equal("p2");
    comments[2].tags[1]["@param"].comment.should.equal("second param");
    comments[2].tags[2].methodSignature.should.equal("function codeCodeCode(p1, p2)");
    comments[2].tags[2].methodName.should.equal("codeCodeCode");

    comments = parserExports.parse("/**\nA method with no method tag\n*/\nfunction name() { }",
        require("../lib/codehandlers/jsCodeHandler"));

    comments[0].tags[0].methodSignature.should.equal("function name()");
    comments[0].tags[0].methodName.should.equal("name");
    comments[0].type.should.equal("METHOD");

    test.done();
};

exports.testParseParameterOrReturnTag = function (test) {
    var paramLine = "@param {StackTheme} stackTheme the theme for the error";
    var tag = parserModule.parseParameterOrReturnTag(paramLine, "@param");
    tag["@param"].type.should.equal("StackTheme");
    tag["@param"].name.should.equal("stackTheme");
    tag["@param"].comment.should.equal("the theme for the error");

    paramLine = "@param   {StackTheme}   stackTheme   the   theme   for   the   error ";
    tag = parserModule.parseParameterOrReturnTag(paramLine, "@param");
    tag["@param"].type.should.equal("StackTheme");
    tag["@param"].name.should.equal("stackTheme");
    tag["@param"].comment.should.equal("the   theme   for   the   error ");

    paramLine = "@param";
    tag = parserModule.parseParameterOrReturnTag(paramLine, "@param");
    should.not.exist(tag["@param"].type);
    should.not.exist(tag["@param"].name);
    should.not.exist(tag["@param"].comment);

    tag = parserModule.parseParameterOrReturnTag("", "@param");
    should.not.exist(tag["@param"].type);
    should.not.exist(tag["@param"].name);
    should.not.exist(tag["@param"].comment);

    var returnLine = "@return {String} a String";
    tag = parserModule.parseParameterOrReturnTag(returnLine, "@return");
    tag["@return"].type.should.equal("String");
    should.not.exist(tag["@return"].name);
    tag["@return"].comment.should.equal("a String");
    
    test.done();
};


exports.testRemovePrecedingAsterisks = function (test) {
    parserModule.removePrecedingAsterisks("*").should.equal("");
    parserModule.removePrecedingAsterisks("************ hello").should.equal(" hello");
    parserModule.removePrecedingAsterisks("************ hello * ").should.equal(" hello *");
    parserModule.removePrecedingAsterisks(" ************ hello * ").should.equal(" hello *");
    parserModule.removePrecedingAsterisks(" ****** ****** hello * ").should.equal(" ****** hello *");
    parserModule.removePrecedingAsterisks("hello").should.equal("hello");
    parserModule.removePrecedingAsterisks("    hello").should.equal("    hello");
    parserModule.removePrecedingAsterisks("*    hello").should.equal("    hello");
    test.done();
};

exports.testApiTagProcessor = function (test) {
    var result = parserModule.apiTagProcessor("@api public");
    result["@api"].should.equal("public");
    test.done();
};


exports.testPrivateTagProcessor = function (test) {
    var result = parserModule.privateTagProcessor("@private");
    result["@private"].should.equal("");
    test.done();
};

exports.testCommentStartProcessor = function (test) {
    var result = parserModule.commentStartProcessor("/**");
    result.should.equal("/**");
    result = parserModule.commentStartProcessor("/***");
    result.should.equal("/**");
    result = parserModule.commentStartProcessor("/** hello");
    result.should.equal("/**");
    test.done();
};

exports.testCommentEndProcessor = function (test) {
    var result = parserModule.commentEndProcessor("*/");
    result.should.equal("*/");
    result = parserModule.commentEndProcessor("**/");
    result.should.equal("*/");
    result = parserModule.commentEndProcessor("hello **/");
    result.should.equal("*/");

    test.done();
};
