var Comment = require("../lib/comments").Comment;

var loadModule = require("./testHelpers/moduleLoader.js").loadModule;
var should = require("should");
var util = require("util");

var parserModule = loadModule("./lib/parser.js");
var parserExports = parserModule.module.exports;

var MULTILINE_CODE_COMMENTS = "/**\n * Some comment text\n* @module testmodule\n * @requires nothing, something\n**/\nfunction () { some \ncode\n here }\n\n /** \n * This is a comment\n\n * @param {String} param a parameter\n *@return {String} the return value\n*/\nvar f = function () { more code }\n /**\n * Another comment \n @param p1 first param\n @param p2 second param\n   */\nfunction codeCodeCode(p1, p2) {\n    code code code \n}";

exports.testParseMultiLineParam = function (test) {
    var comments;
    comments = parserExports.parse("/**\nTest\n@param {String} s multi\nline\nparam\ncomment\n*/");
    comments.length.should.equal(1);
    comments[0].text.should.equal("Test");
    comments[0].tags[0]["@param"].name.should.equal("s");
    comments[0].tags[0]["@param"].type.should.equal("String");
    comments[0].tags[0]["@param"].comment.should.equal("multi\nline\nparam\ncomment");
    test.done();
};

exports.testParseMultiLineReturn = function (test) {
    var comments;
    comments = parserExports.parse("/**\nTest\n@param {String} s multi\nline\nparam\ncomment\n" +
        "@return {Object} a\nmulti\nline\nreturn\n*/");
    comments.length.should.equal(1);
    comments[0].text.should.equal("Test");
    comments[0].tags[0]["@param"].name.should.equal("s");
    comments[0].tags[0]["@param"].type.should.equal("String");
    comments[0].tags[0]["@param"].comment.should.equal("multi\nline\nparam\ncomment");
    comments[0].tags[1]["@return"].type.should.equal("Object");
    comments[0].tags[1]["@return"].comment.should.equal("a\nmulti\nline\nreturn");
    test.done();
};

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

exports.testParseCommonMethodTag = function (test) {
    var paramLine = "@param {StackTheme} stackTheme the theme for the error";
    var tag = parserModule.parseCommonMethodTag(paramLine, "@param");
    tag["@param"].type.should.equal("StackTheme");
    tag["@param"].name.should.equal("stackTheme");
    tag["@param"].comment.should.equal("the theme for the error");

    paramLine = "@param   {StackTheme}   stackTheme   the   theme   for   the   error ";
    tag = parserModule.parseCommonMethodTag(paramLine, "@param");
    tag["@param"].type.should.equal("StackTheme");
    tag["@param"].name.should.equal("stackTheme");
    tag["@param"].comment.should.equal("the   theme   for   the   error ");

    paramLine = "@param";
    tag = parserModule.parseCommonMethodTag(paramLine, "@param");
    should.not.exist(tag["@param"].type);
    should.not.exist(tag["@param"].name);
    should.not.exist(tag["@param"].comment);

    tag = parserModule.parseCommonMethodTag("", "@param");
    should.not.exist(tag["@param"].type);
    should.not.exist(tag["@param"].name);
    should.not.exist(tag["@param"].comment);

    var returnLine = "@return {String} a String";
    tag = parserModule.parseCommonMethodTag(returnLine, "@return");
    tag["@return"].type.should.equal("String");
    should.not.exist(tag["@return"].name);
    tag["@return"].comment.should.equal("a String");

    var throwsLine = "@throws {IllegalStateException} when there is an illegal state";
    tag = parserModule.parseCommonMethodTag(throwsLine, "@throws");
    tag["@throws"].type.should.equal("IllegalStateException");
    should.not.exist(tag["@throws"].name);
    tag["@throws"].comment.should.equal("when there is an illegal state");
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

exports.testSimpleTags = function (test) {

    var checkSimpleTag = function (tagDetails) {
        for (var i = 0; i < tagDetails.length; i += 1) {
            var result = parserExports.parse("/**\nA comment\n" + tagDetails[i].tag + " tag comment\n*/");
            result.length.should.equal(1);
            result[0].text.should.equal("A comment");
            result[0].tags.length.should.equal(1);
            result[0].tags[0][tagDetails[i].tag].should.equal("tag comment");
            if (tagDetails[i].type) {
                result[0].type.should.equal(tagDetails[i].type);
            }
        }
    };
    checkSimpleTag([
        {tag: "@api", type: "METHOD"},
        {tag: "@class", type: "TYPE"},
        {tag: "@requires", type: "MODULE"},
        {tag: "@constructor"},
        {tag: "@author"},
        {tag: "@deprecated"},
        {tag: "@method", type: "METHOD"},
        {tag: "@module", type: "MODULE"},
        {tag: "@private"},
        {tag: "@see"},
        {tag: "@version"}
    ]
    );

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

exports.testKeys = function (test) {
    var keys = parserModule.keys({a: 5, b: "three"});
    keys.length.should.equal(2);
    keys[0].should.equal("a");
    keys[1].should.equal("b");
    test.done();
};

exports.testSortComments = function (test) {
    var moduleComment = new Comment();
    var typeComment = new Comment();
    var varComment = new Comment();
    var methodComment = new Comment();
    var typelessComment = new Comment();

    moduleComment.type = parserExports.COMMENT_TYPES.MODULE;
    typeComment.type = parserExports.COMMENT_TYPES.TYPE;
    varComment.type = parserExports.COMMENT_TYPES.VARIABLE;
    methodComment.type = parserExports.COMMENT_TYPES.METHOD;

    var comments = [];
    comments.push(typelessComment);
    comments.push(varComment);
    comments.push(methodComment);
    comments.push(typeComment);
    comments.push(moduleComment);

    var sorted = parserModule.sortComments(comments);

    sorted.length.should.equal(5);
    sorted[0].should.equal(moduleComment);
    sorted[1].should.equal(typeComment);
    sorted[2].should.equal(varComment);
    sorted[3].should.equal(methodComment);
    sorted[4].should.equal(typelessComment);

    comments.push(methodComment);
    comments.push(varComment);
    comments.push(typelessComment);

    sorted = parserModule.sortComments(comments);

    sorted.length.should.equal(8);
    sorted[0].should.equal(moduleComment);
    sorted[1].should.equal(typeComment);
    sorted[2].should.equal(varComment);
    sorted[3].should.equal(varComment);
    sorted[4].should.equal(methodComment);
    sorted[5].should.equal(methodComment);
    sorted[6].should.equal(typelessComment);
    sorted[7].should.equal(typelessComment);
    
    test.done();
};