/**
 * DocIt
 *
 * Generate Markdown code documentation from jsdoc / javadoc style code comments.
 *
 */
var parser = require("./parser");
var util = require("util");

var TAGS = {
    "api": "@api",
    "class": "@class",
    "method": "@method",
    "module": "@module",
    "param": "@param",
    "private": "@private",
    "return": "@return",
    "requires": "@requires"
};

var TAG_MARKDOWN = {
    "methodTitle": "-",
    "methodSignature": "###",
    "moduleTitle": "=",
    "paramType": "*",
    "paramsTitle": "####",
    "returnType": "*",
    "returnsTitle": "####",
    "requiresLabel": "*",
    "typeTitle": "-"
};

var SETTINGS = {
    "moduleHeading": "Module",
    "includePrivate": "false"
};

var apiTagProcessor = function (commentLine) {
    return commentLine;
};

var classTagProcessor = function (commentLine) {
    return commentLine.indexOf(TAGS["class"]) === 0 ? "" : commentLine;
};

var methodTagProcessor = function (commentLine) {
    return commentLine;
};

var moduleTagProcessor = function (commentLine) {
    return commentLine.indexOf(TAGS.module) === 0 ? "" : commentLine;
};

var privateTagProcessor = function (commentLine) {
    return commentLine;
};

var returnTagProcessor = function (commentLine) {
    return commentLine;
};

var requiresTagProcessor = function (commentLine) {
    var md = commentLine;
    if (commentLine.indexOf(TAGS.requires) === 0) {
        var requires = commentLine.substr(TAGS.requires.length).trim();
        md = TAG_MARKDOWN.requiresLabel + "Requires:" + TAG_MARKDOWN.requiresLabel + " " + requires;
    }
    return md;
};

var TAG_PROCESSORS = [
    apiTagProcessor,
    classTagProcessor,
    methodTagProcessor,
    moduleTagProcessor,
    privateTagProcessor,
    returnTagProcessor,
    requiresTagProcessor
];

var processModuleComment = function (comment, moduleName) {
    var md = (moduleName || determineModuleName(comment.doc) || SETTINGS.moduleHeading) + "\n\n";
    applyMarkdown(md, TAG_MARKDOWN.moduleTitle);

//    buildMarkdownFromComment(comment, md);

    return md;

};

var javascriptMethod = function (comment) {
    console.log("processing js method");
};

var javascriptVar = function (comment) {
    console.log("processing js var");
};

var CODE_PATTERNS = {
    "function" : javascriptMethod,
    "var": javascriptVar
};

var METHOD_PATTERNS = {
    "javascript": "function" // todo improve
};

var VARIABLE_PATTERNS = {
    "javascript": "var " // todo improve
};

/**
 * Translate commented code into Markdown.
 * @param {String} commentedCode commented code from a single file
 * @param {String} moduleName the name of the module for which Markdown is generated. If this is not specified then
 * docit will use the @module tag attached to the module comments - assuming it is present.
 * @return {String} the jsdoc / javadoc style comments provided within the commented code translated into Markdown
 */
exports.commentsToMD = function (commentedCode, moduleName) {
    var comments = parser.parse(commentedCode);
    var md = "";
    if (comments.length > 0 && isModuleComment(comments[0])) {
        md = processModuleComment(comments[0], moduleName);
    }
    for (var i = 1; i < comments.length; i++) {
        for (var pattern in CODE_PATTERNS) {
            if (CODE_PATTERNS.hasOwnProperty(pattern)) {
                var match = comments[i].codeFirstLine && comments[i].codeFirstLine.match(pattern);
                if (match) {
                    CODE_PATTERNS[pattern](comments[i]);
                }
            }
        }
    }
    return null;
};

function buildMarkdownFromComment(comment, md) {
    for (var i1 = 0; i1 < comment.triagedDoc.length; i1 += 1) {
        var processed = false;
        for (var i2 = 0; i2 < TAG_PROCESSORS.length && !processed; i2 += 1) {
            var next = TAG_PROCESSORS[i2](comment.triagedDoc[i1]);
            if (next !== comment.triagedDoc[i1]) {
                md += next + "\n";
                processed = true;
            }
        }
        console.log("processed = "+ processed + ", line = " + comment.triagedDoc[i1]);
        if (!processed) {
            md += comment.triagedDoc[i1] + "\n";
        }
    }

    return md;
}

function determineModuleName(moduleComment) {
    var moduleName = null;
    var moduleTagIndex = moduleComment.indexOf(TAGS.module);
    if (moduleTagIndex != -1) {
        moduleName = moduleComment.substr(moduleTagIndex + TAGS.module.length).split("\n")[0].trim();
    }

    return moduleName;
}

function isModuleComment(comment) {
    return (comment.doc.indexOf(TAGS.requires) !== -1 || comment.doc.indexOf(TAGS.module) !== -1) ||
        (comment.doc.indexOf(TAGS.param) === -1 && comment.doc.indexOf(TAGS["return"]) === -1 &&
            comment.doc.indexOf(TAGS.method) === -1 && comment.doc.indexOf(TAGS["class"]) === -1);
}

function isMethodComment(comment) {
    return comment.doc.indexOf(TAGS.method) !== -1 || comment.doc.indexOf(TAGS["return"]) !== -1 ||
        (comment.doc.indexOf(TAGS.param) !== -1 && comment.doc.indexOf(TAGS["class"]) === -1) ||
        (comment.code && isMethoDecl(comment.code));
}

function isTypeComment(comment) {
    return comment.doc.indexOf(TAGS["class"]) !== -1;
}

function isVariableComment(comment) {
    return comment.code && isVariableDecl(comment.code);
}

function isVariableDecl(code) {
    return isDeclaration(VARIABLE_PATTERNS, code);
}

function isMethoDecl(code) {
    return isDeclaration(METHOD_PATTERNS, code);
}

function isDeclaration(declarations, code) {
    var firstLine = code.trim().split("\n");
    var found = false;
    for (var prop in declarations) {
        found = declarations.hasOwnProperty(prop) && firstLine.match(declarations.prop);
    }

    return found;
}

function applyMarkdown(text, markDown) {
    var md;
    switch (markDown) {
        case "=":
        case "-":
            md = text + "\n" + charConcat(markDown, text.length) + "\n";
            break;
        default:
            md = markDown + text + markDown;
    }

    return md;
}

function charConcat(c, count) {
    var s = "";
    for (var i = 0; i < count; i++) {
        s += c;
    }
    return s;
}