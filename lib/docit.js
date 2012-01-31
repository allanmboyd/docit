var exceptions = require("exceptions");
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

var apiTagProcessor = function(commentLine) {
    return commentLine;
};

var classTagProcessor = function(commentLine) {
    return commentLine.indexOf(TAGS["class"]) === 0 ? "" : commentLine;
};

var methodTagProcessor = function(commentLine) {
    return commentLine;
};

var moduleTagProcessor = function(commentLine) {
    return commentLine.indexOf(TAGS.module) === 0 ? "" : commentLine;
};

var privateTagProcessor = function(commentLine) {
    return commentLine;
};

var returnTagProcessor = function(commentLine) {
    return commentLine;
};

var requiresTagProcessor = function(commentLine) {
    var md = commentLine;
    if (commentLine.indexOf(TAGS.requires) === 0) {
        var requires = commentLine.substr(TAGS.requires.length).trim();
        md = TAG_MARKDOWN.requiresLabel + "Requires:" + TAG_MARKDOWN.requiresLabel + " " + requires + "\n";
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

var processModuleComment = function(comment, moduleName) {
    var md = "";
    if (isModuleComment(comment)) {
        moduleName = (moduleName || determineModuleName(comment) || SETTINGS.moduleHeading);
        md = applyMarkdown(moduleName, TAG_MARKDOWN.moduleTitle);
        md += buildMarkdownFromComment(comment, md);
    }
    return md;
};

var methodNameFromJSCode = function(methodSignature) {
    var methodName = null;
    if (methodSignature.indexOf("function") != -1) {
        if (methodSignature.indexOf("=") !== -1) {
            if (methodSignature.trim().indexOf("exports.") === 0) {
                methodName = methodSignature.substring(methodSignature.indexOf("exports.") + 8, methodSignature.indexOf("="));
            } else if (methodSignature.trim().indexOf("var") === 0) {
                methodName = methodSignature.substring(methodSignature.indexOf("var") + 4, methodSignature.indexOf("="));
            }
        } else {
            methodName = methodSignature.substring(methodSignature.indexOf("function") + 8, methodSignature.indexOf("("));
        }

    }

    return methodName && methodName.length > 0 ? methodName.trim() : null;
};

var processMethodComment = function(comment) {
    var methodMd = "";
    if (isMethodComment(comment)) {
        var methodName = determineMethodName(comment, methodNameFromJSCode);
        if (!methodName) {
            exceptions.ILLEGAL_ARGUMENT.thro("Cannot find method name from comment: '" + comment.doc + "'");
        }
        methodMd = applyMarkdown(methodName, TAG_MARKDOWN.methodTitle) + "\n\n";

        if (comment.codeFirstLine) {
            methodMd += applyMarkdown(comment.codeFirstLine, TAG_MARKDOWN.methodSignature) + "\n\n";
        }

        var paramsStarted = false;
        for (var i = 0; i < comment.triagedDoc.length; i += 1) {
            var line = comment.triagedDoc[i];
            switch (commentLineTag(line)) {
                case TAGS.param:
                    if (!paramsStarted) {
                        methodMd += applyMarkdown("Parameters", TAG_MARKDOWN.paramsTitle) + "\n\n";
                        paramsStarted = true;
                    }
                    methodMd += applyMarkdown();
                    break;
                case TAGS["return"]:
                    break;
                default:

            }
        }
    }
    return methodMd;
};

function commentLineTag(commentLine) {
    var tag = null;
    for (var i = 0; i < TAGS.length && tag === null; i += 1) {
        if (commentLine.indexOf(TAGS[i]) === 0) {
            tag = TAGS[i];
        }
    }

    return tag;
}

var processVariableComment = function(comment) {
    console.log("processing js var");
    return "";
};

var processTypeComment = function (comment) {
    console.log("processing type comment");
    return "";
};

var COMMENT_TYPES = {
    "method": processMethodComment,
    "module": processModuleComment,
    "type": processTypeComment,
    "variable": processVariableComment
};

var METHOD_PATTERNS = {
    "javascript": "function"
};

var VARIABLE_PATTERNS = {
    "javascript": "var "
};

exports.commentsToMD = function(commentedCode, moduleName) {
    var comments = parser.parse(commentedCode);
    var md = "";
    if (comments.length > 0 && isModuleComment(comments[0])) { // todo - this should be able to go into the loop below
        md = processModuleComment(comments[0], moduleName);
    }
    for (var i = 1; i < comments.length; i++) {
        for (var commentType in COMMENT_TYPES) {
            if (COMMENT_TYPES.hasOwnProperty(commentType)) {
                md += COMMENT_TYPES[commentType](comments[i]);
            }
        }
    }
    return md;
};

function buildMarkdownFromComment(comment) {
    var md = "";
    for (var i1 = 0; i1 < comment.triagedDoc.length; i1 += 1) {
        var processed = false;
        for (var i2 = 0; i2 < TAG_PROCESSORS.length && !processed; i2 += 1) {
            var next = TAG_PROCESSORS[i2](comment.triagedDoc[i1]);
            if (next !== comment.triagedDoc[i1]) {
                md += next;
                processed = true;
            }
        }
        if (!processed) {
            md += comment.triagedDoc[i1] + "\n";
        }
    }
    return md;
}

function parseParameterTag(paramCommentLine) { // todo consider moving to parser
    var paramParts = {};
    var words = paramCommentLine.split(" ");
    var i = 0;
    while(words.length > 0 && !paramParts.comment) {
        var word = words.shift();
        if(word.length > 0 && word.indexOf(TAGS.param) === -1) {
            if(word.indexOf("{") === 0 && word.indexOf("}") !== -1 && !paramParts.type) {
                paramParts.type = word.substring(1, word.indexOf("}"));
                i+=1;
            } else if(!paramParts.name) {
                paramParts.name = word;
            } else {
                paramParts.comment = words.join(" ");
            }
        }
    }

    console.log(util.inspect(paramParts));
    return paramParts;
}

function determineModuleName(moduleComment) {
    return determineTagValue(moduleComment, TAGS.module);
}

function determineMethodName(comment, codeToMethodNameFunction) {
    var methodName = determineTagValue(comment, TAGS.method);
    if (!methodName && comment.codeFirstLine) {
        methodName = codeToMethodNameFunction(comment.codeFirstLine);
    }

    return methodName;
}

function determineTagValue(comment, tag) {
    var tagValue = null;
    var tagIndex = comment.doc.indexOf(tag);
    if (tagIndex != -1) {
        tagValue = comment.doc.substr(tagIndex + tag.length).split("\n")[0].trim();
    }
    return tagValue;
}

var isModuleComment = function (comment) {
    return (comment.doc.indexOf(TAGS.requires) !== -1 || comment.doc.indexOf(TAGS.module) !== -1) || (comment.doc.indexOf(TAGS.param) === -1 && comment.doc.indexOf(TAGS["return"]) === -1 && comment.doc.indexOf(TAGS.method) === -1 && comment.doc.indexOf(TAGS["class"]) === -1);
};

var isMethodComment = function (comment) {
    return comment.doc.indexOf(TAGS.method) !== -1 || comment.doc.indexOf(TAGS["return"]) !== -1 || (comment.doc.indexOf(TAGS.param) !== -1 && comment.doc.indexOf(TAGS["class"]) === -1) || (comment.code && isMethoDecl(comment.code));
};

var isTypeComment = function (comment) {
    return comment.doc.indexOf(TAGS["class"]) !== -1;
};

var isVariableComment = function (comment) {
    return comment.code && isVariableDecl(comment.code);
};

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