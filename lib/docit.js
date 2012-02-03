/**
 * @module DocIt
 *
 * Language independent translation of code comments into Markdown
 */
var parser = require("./parser");

var COMMENT_TYPES = parser.COMMENT_TYPES;
var TAG_NAMES = parser.TAG_NAMES;

var SETTINGS = {
    "defaultModuleHeading": "Module",
    "includePrivate": "false",
    "methodHeadingMarkdown": "-",
    "methodSignatureMarkdown": "###",
    "moduleHeadingMarkdown": "=",
    "paramsHeading": "Parameters",
    "paramsHeadingMarkdown": "####",
    "paramsListMarkdown": "*",
    "paramTypeMarkdown": "*",
    "requiresLabel": "Requires:",
    "requiresLabelMarkdown": "*",
    "returnHeading": "Returns",
    "returnHeadingMarkdown": "####",
    "returnTypeMarkdown": "*",
    "typeHeadingMarkdown": "-"
};

/**
 * Return a String of Markdown generated from the comments within some code that is provided as a String.
 *
 * @param {String} commentedCode commented code
 * @param {Object} codeHandler an optional code handler that can be used for example to determine method names
 * when these are not explicitly listed within comments
 * @param moduleName optional override for the name and main heading for the module comments
 */
exports.commentsToMD = function(commentedCode, codeHandler, moduleName) {
    var comments = parser.parse(commentedCode, codeHandler);
    var md = "";
    for (var i = 0; i < comments.length; i++) {
        var comment = comments[i];
        switch (comment.type) {
            case COMMENT_TYPES.METHOD:
                md += processMethodComment(comment);
                break;
            case COMMENT_TYPES.MODULE:
                md += processModuleComment(comment, moduleName);
                break;
            case COMMENT_TYPES.TYPE:
                md += processTypeComment(comment); // todo implement this
                break;
            case COMMENT_TYPES.VARIABLE:
                md += processVariableComment(comment); // todo implement this
                break;
            default:
                md += processGenericComment(comment); // todo implement this
        }
        md += "\n";
    }
    return md;
};

function processModuleComment(comment, moduleName) {
    var md = "";
    var name = moduleName || determineTagValue(TAG_NAMES.MODULE, comment) || SETTINGS.defaultModuleHeading;

    md = applyMarkdown(name, SETTINGS.moduleHeadingMarkdown) + "\n\n";

    if (comment.text) {
        md += comment.text + "\n\n";
    }
    var requires = determineTagValue(TAG_NAMES.REQUIRES, comment);
    if (requires) {
        md += SETTINGS.requiresLabelMarkdown + SETTINGS.requiresLabel + SETTINGS.requiresLabelMarkdown +
            " " + requires + "\n";
    }
    return md;
}

function processMethodComment(comment) {
    var md = "";
    var methodName = determineTagValue(TAG_NAMES.METHOD, comment) || determineTagValue(TAG_NAMES.METHOD_NAME, comment);

    if (methodName) {
        md += applyMarkdown(methodName, SETTINGS.methodHeadingMarkdown) + "\n\n";
    }
    var signature = determineTagValue(TAG_NAMES.METHOD_SIGNATURE, comment);
    if (signature) {
        md += applyMarkdown(signature, SETTINGS.methodSignatureMarkdown) + "\n\n";
    }

    if (comment.text) {
        md += comment.text + "\n\n";
    }

    var paramsStarted = false;
    var tags = comment.tags;
    for (var i in tags) {
        for (var tagName in tags[i]) { // I wish I knew another in-built way to get hold of the key in a key/value pair
            switch (tagName) {
                case TAG_NAMES.PARAM:
                    if (!paramsStarted) {
                        md += applyMarkdown(SETTINGS.paramsHeading, SETTINGS.paramsHeadingMarkdown) + "\n\n";
                        paramsStarted = true;
                    }
                    md += processParamTag(tags[i][tagName]) + "\n";
                    break;
                case TAG_NAMES.RETURN:
                    md += "\n" + applyMarkdown(SETTINGS.returnHeading, SETTINGS.returnHeadingMarkdown) + "\n\n";
                    md += processReturnTag(tags[i][tagName]) + "\n";
                // todo private, api and throws tags
            }
        }
    }
    return md;
}

function processVariableComment(comment) {
    // todo - implement this method
    return "";
}

function processTypeComment(comment) {
    // todo - implement this method
    return "";
}

function processGenericComment(comment) {
    // todo - implement this method
    return "";
}

function processParamTag(paramTag) {
    var md = SETTINGS.paramsListMarkdown + " " + paramTag.name + " ";
    if (paramTag.type) {
        md += applyMarkdown(paramTag.type, SETTINGS.paramTypeMarkdown) + " ";
    }
    md += paramTag.comment;
    return md;
}

function processReturnTag(returnTag) {
    var md = "";
    if (returnTag.type) {
        md += applyMarkdown(returnTag.type, SETTINGS.returnTypeMarkdown) + " ";
    }
    md += returnTag.comment;
    return md;
}

function applyMarkdown(text, markDown) {
    var md;
    switch (markDown) {
        case "=":
        case "-":
            md = text + "\n" + charConcat(markDown, text.length);
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

function determineTagValue(tagName, comment) {
    var tagValue = null;
    if (comment.tags && comment.tags.length > 0) {
        for (var i = 0; i < comment.tags.length && !tagValue; i++) {
            var tag = comment.tags[i];
            tagValue = tag[tagName] ? tag[tagName] : null;
        }
    }

    return tagValue;
}
