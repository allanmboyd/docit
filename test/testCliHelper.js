var docit = require("../lib/docit");
var fs = require("fs");
var path = require("path");
var loadModule = require("./testHelpers/moduleLoader.js").loadModule;
var should = require("should");
var sinon = require("sinon");

var docitStub;
var cliHelperMocker;
var fsMocker;
var fsStub;
var pathMocker;

var mocks = {
    docit: docit,
    fs: fs,
    path: path
};

var cliHelperModule = loadModule("./lib/cliHelper.js", mocks);
var cliHelper = cliHelperModule.module.exports;

module.exports = {
    setUp: function (callback) {
        cliHelperMocker = sinon.mock(cliHelperModule);
        fsMocker = sinon.mock(fs);
        pathMocker = sinon.mock(path);
        callback();
    },
    tearDown: function (callback) {
        cliHelperMocker.restore();
        fsMocker.restore();
        pathMocker.restore();
        if (docitStub) {
            docitStub.restore();
        }
        if (fsStub) {
            fsStub.restore();
        }
        callback();
    },
    testProcessFiles: function (test) {
        var mkDirSyncStub = sinon.stub(fs, "mkdirSync");
        pathMocker.expects("existsSync").twice();
        fsMocker.expects("readFile").exactly(5);
        var readDirStub = sinon.stub(fs, "readdir").yields(null, ["file1.js", "folder", "file2.js"]);
        var statSyncStub = sinon.stub(fs, "statSync", function(path) {
            return path === "sourceDir/folder" ? {
                isDirectory: function () {
                    return true;
                }
            } : {
                isDirectory: function () {
                    return false;
                }
            };
        });
        cliHelper.processFiles({
            get: function () {
                return "";
            }
        }, "sourceDir", "targetDir");

        fsMocker.verify();
        pathMocker.verify();

        mkDirSyncStub.restore();
        readDirStub.restore();
        statSyncStub.restore();
        test.done();
    },
    testProcessFilesWithFilter: function (test) {
        var mkDirSyncStub = sinon.stub(fs, "mkdirSync");
        pathMocker.expects("existsSync").once();
        fsMocker.expects("readFile").exactly(2);
        var readDirStub = sinon.stub(fs, "readdir").yields(null, ["file1.js", "folder", "file2.js"]);
        var statSyncStub = sinon.stub(fs, "statSync", function(path) {
            return path === "sourceDir/folder" ? {
                isDirectory: function () {
                    return true;
                }
            } : {
                isDirectory: function () {
                    return false;
                }
            };
        });
        cliHelper.processFiles({
            get: function (setting) {
                if (setting === "includeFiles") {
                    return ".js";
                } else {
                    return "";
                }
            }
        }, "sourceDir", "targetDir");

        fsMocker.verify();
        pathMocker.verify();

        mkDirSyncStub.restore();
        readDirStub.restore();
        statSyncStub.restore();
        test.done();
    },
    testProcessFilesSourceTargetConfig: function (test) {
        var mkDirSyncStub = sinon.stub(fs, "mkdirSync");
        pathMocker.expects("existsSync").withArgs("targetDir").once();
        var readDirStub = sinon.stub(fs, "readdir").withArgs("sourceDir").yields(null, []);
        cliHelper.processFiles({
            get: function(arg) {
                switch (arg) {
                    case "dir":
                        return "sourceDir";
                    case "out":
                        return "targetDir";
                }
            }
        });
        pathMocker.verify();

        mkDirSyncStub.restore();
        readDirStub.reset(); // restore does not exist for some reason - sinon bug?

        test.done();
    },
    testProcessFile: function (test) {
        fsStub = sinon.stub(fs, "readFile").yields(null, "hello");
        docitStub = sinon.stub(docit, "commentsToMD").returns("hello md");
        fsMocker.expects("writeFile").withArgs("target", "hello md", "utf8").once();
        cliHelperModule.processFile("source", "target");
        fsMocker.verify();
        test.done();
    },
    testProcessFileError: function (test) {
        fsStub = sinon.stub(fs, "readFile").yields(new Error("an error"), "hello");
        docitStub = sinon.stub(docit, "commentsToMD").returns("hello md");
        fsMocker.expects("writeFile").withArgs("target", "hello md", "utf8").never();
        cliHelperModule.processFile("source", "target"); // this should cause a warning to be logged - todo  test that it does
        fsMocker.verify();
        test.done();
    },
    testCheckTargetDirNotExists:  function (test) {
        pathMocker.expects("existsSync").withExactArgs("td").once();
        fsMocker.expects("mkdirSync").withExactArgs("td", "0755").once();
        cliHelperModule.checkTargetDir("td");
        pathMocker.verify();
        fsMocker.verify();
        test.done();
    },
    testCheckTargetDirExists: function (test) {
        sinon.stub(path, "existsSync").returns(true);
        fsMocker.expects("mkdirSync").never();
        cliHelperModule.checkTargetDir("td");
        fsMocker.verify();
        test.done();
    },
    testMakeModuleName: function (test) {
        cliHelperModule.makeModuleName("hello/name.js").should.equal("name.js");
        cliHelperModule.makeModuleName("name.js").should.equal("name.js");
        cliHelperModule.makeModuleName("/hello/name.js").should.equal("name.js");
        test.done();
    },
    testMakeTargetFileName: function (test) {
        cliHelperModule.makeTargetFilename("should.js").should.equal("should.md");
        cliHelperModule.makeTargetFilename("hello/should.js").should.equal("hello/should.md");
        cliHelperModule.makeTargetFilename("/hello/should.js").should.equal("/hello/should.md");

        test.done();
    },
    testFilterFiles: function (test) {
        var filtered = cliHelperModule.filterFiles(["hello.js", "hello.rb", "hello", "test.js", "test.java"],
            "hello, bye, .*.js, .*.rb, .*.py");
        filtered.length.should.equal(4);
        filtered[0].should.equal("hello.js");
        filtered[1].should.equal("hello.rb");
        filtered[2].should.equal("hello");
        filtered[3].should.equal("test.js");
        test.done();
    }
};


