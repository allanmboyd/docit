var Comment = require("./comments").Comment;

var STATES = {
    "START": {
        name: "START",
        next: "IN_COMMENT"
    },
    "IN_COMMENT" : {
        name: "IN_COMMENT",
        next: "OUT_COMMENT"
    },
    "OUT_COMMENT" : {
        name: "OUT_COMMENT",
        next: "IN_COMMENT"
    }
};

var state = STATES.START;

/**
 * Process a closing comment. Just return the end comment tag
 *
 * NOTE: any other information on end comment line is ignored
 * @private
 */
var commentEndProcessor = function () {
    state = STATES[state.next];
    return TOKEN_PROCESSORS.COMMENT_END.TOKEN;
};

/**
 * Process an opening comment. Just return the start comment tag.
 *
 * NOTE: any other information on the start-comment line is ignored
 * @private
 */
var commentStartProcessor = function () {
    state = STATES[state.next];
    return TOKEN_PROCESSORS.COMMENT_START.TOKEN;
};

var processSimpleTagValue = function(commentLine, tagToken) {
    if(state !== STATES.IN_COMMENT) {
        return "";
    }
    var tag = {};
    tag[tagToken] = determineTagValue(commentLine, tagToken);
    return tag;
};

var parseCommonMethodTag = function (commentLine, tagToken) {
    if(state !== STATES.IN_COMMENT) {
        return "";
    }
    var parts = {};
    var words = commentLine.split(" ");
    var i = 0;
    while (words.length > 0 && !parts.comment) {
        var word = words.shift();
        if (word.length > 0 && word.indexOf(tagToken) === -1) {
            if (word.indexOf("{") === 0 && word.indexOf("}") !== -1 && !parts.type) {
                parts.type = word.substring(1, word.indexOf("}"));
                i += 1;
            } else if (!parts.name && tagToken === TOKEN_PROCESSORS.PARAM_TAG.TOKEN) {
                parts.name = word;
            } else if (words.length > 0) {
                parts.comment = word + " " + words.join(" ");
            } else {
                parts.comment = word;
            }
        }
    }

    var tag = {};
    tag[tagToken] = parts;
    return tag;
};

/**
 * Process a line beginning with a *. If this is in a comment then remove all the * from the start of the line
 * @param commentLine the comment line
 * @return the line with the * part of the comment - if any - removed
 * @private
 */
var inlineCommentProcessor = function (commentLine) {
    if (state === STATES.IN_COMMENT) {
        commentLine = removePrecedingAsterisks(commentLine);
        // If there is a single space after the * then remove it. Otherwise assume that the user is indenting.
        if (commentLine.indexOf("  ") !== 0 && commentLine.indexOf(" ") === 0) {
            commentLine = commentLine.substr(1);
        }
    }

    return commentLine;
};

/**
 * Constants identifying the types of comments.
 */
exports.COMMENT_TYPES = {
    METHOD: "METHOD",
    MODULE: "MODULE",
    TYPE: "TYPE",
    VARIABLE: "VARIABLE"
};

/**
 * Constants that identify all the documentation tags that may be embedded within comments.
 */
exports.TAG_NAMES = {
    API: "@api",
    AUTHOR: "@author",
    CLASS: "@class",
    CONSTRUCTOR: "@constructor",
    DEPRECATED: "@deprecated",
    EXCEPTION: "@exception",
    METHOD: "@method",
    METHOD_NAME: "methodName",
    METHOD_SIGNATURE: "methodSignature",
    MODULE: "@module",
    PARAM: "@param",
    PRIVATE: "@private",
    RETURN: "@return",
    REQUIRES: "@requires",
    SEE: "@see",
    THROWS: "@throws",
    VARIABLE_NAME: "variableName",
    VERSION: "@version"
};


/**
 * Tokens to be parsed. Note that the order is significant and allows reduction in the number of passes of a comment.
 * @private
 */
var TOKEN_PROCESSORS = {
    COMMENT_START: {
        TOKEN: "/**",
        PROCESSOR: commentStartProcessor
    },
    COMMENT_END: {
        TOKEN: "*/",
        PROCESSOR: commentEndProcessor
    },
    INLINE_COMMENT: {
        TOKEN: "*",
        PROCESSOR: inlineCommentProcessor
    },
    AUTHOR_TAG: {
        TOKEN: exports.TAG_NAMES.AUTHOR,
        PROCESSOR: processSimpleTagValue
    },
    API_TAG: {
        TOKEN: exports.TAG_NAMES.API,
        PROCESSOR: processSimpleTagValue
    },
    CLASS_TAG: {
        TOKEN: exports.TAG_NAMES.CLASS,
        PROCESSOR: processSimpleTagValue
    },
    CONSTRUCTOR_TAG: {
        TOKEN: exports.TAG_NAMES.CONSTRUCTOR,
        PROCESSOR: processSimpleTagValue
    },
    DEPRECATED_TAG: {
        TOKEN: exports.TAG_NAMES.DEPRECATED,
        PROCESSOR: processSimpleTagValue
    },
    EXCEPTION_TAG: {
        TOKEN: exports.TAG_NAMES.EXCEPTION,
        PROCESSOR: parseCommonMethodTag
    },
    METHOD_TAG: {
        TOKEN: exports.TAG_NAMES.METHOD,
        PROCESSOR: processSimpleTagValue
    },
    MODULE_TAG: {
        TOKEN: exports.TAG_NAMES.MODULE,
        PROCESSOR: processSimpleTagValue
    },
    PARAM_TAG: {
        TOKEN: exports.TAG_NAMES.PARAM,
        PROCESSOR: parseCommonMethodTag
    },
    PRIVATE_TAG: {
        TOKEN: exports.TAG_NAMES.PRIVATE,
        PROCESSOR: processSimpleTagValue
    },
    RETURN_TAG: {
        TOKEN: exports.TAG_NAMES.RETURN,
        PROCESSOR: parseCommonMethodTag
    },
    REQUIRES_TAG: {
        TOKEN: exports.TAG_NAMES.REQUIRES,
        PROCESSOR: processSimpleTagValue
    },
    SEE_TAG: {
        TOKEN: exports.TAG_NAMES.SEE,
        PROCESSOR: processSimpleTagValue
    },
    THROWS_TAG: {
        TOKEN: exports.TAG_NAMES.THROWS,
        PROCESSOR: parseCommonMethodTag
    },
    VERSION_TAG: {
        TOKEN: exports.TAG_NAMES.VERSION,
        PROCESSOR: processSimpleTagValue
    }
};

/**
 * Parse a String looking for jsdoc / javadoc style comments and provide these in a data structure for subsequent
 * use.
 * @param {String} commentedCode code presumably containing comments to be parsed
 * @param {CodeHandler} codeHandler an optional code handler that if supplied will be used to identify method signatures and
 * variable names
 * @return {Comment[]} an array of Comment objects for all the identified jsdoc / javadoc style comments. The returned
 * array is sorted into Module, Class, Variable and Method comments in that order.
 */
exports.parse = function (commentedCode, codeHandler) {
    state = STATES.START;
    var lines = commentedCode.split("\n");
    var augmentedLines = lines.map(function(line) {
        var newLine = line;
        for (var token in TOKEN_PROCESSORS) {
            if (TOKEN_PROCESSORS.hasOwnProperty(token) && newLine.indexOf(TOKEN_PROCESSORS[token].TOKEN) !== -1) {
                newLine = TOKEN_PROCESSORS[token].PROCESSOR(newLine, TOKEN_PROCESSORS[token].TOKEN);

                if (typeof newLine !== "string") {
                    break;
                }
            }
        }

        if (newLine === line && state === STATES.OUT_COMMENT && newLine !== TOKEN_PROCESSORS.COMMENT_END.TOKEN) {
            if (codeHandler) {
                newLine = augmentNonCommentLine(line, codeHandler);
            } else {
                newLine = "";
            }
        }
        return newLine;
    });

    if (state === STATES.START) {
        // No comments
        return [];
    }

    state = STATES.START;

    return augmentedLines.reduce(function (previousValue, currentValue, index, mappedArray) {
        var returnValue;
        if (state === STATES.START && previousValue !== TOKEN_PROCESSORS.COMMENT_START.TOKEN) {
            returnValue = currentValue;
        } else {
            if (state === STATES.START && previousValue === TOKEN_PROCESSORS.COMMENT_START.TOKEN) {
                state = STATES.IN_COMMENT;
                previousValue = [
                    new Comment()
                ];
                returnValue = previousValue;
            }
            if (state === STATES.OUT_COMMENT && currentValue === TOKEN_PROCESSORS.COMMENT_START.TOKEN) {
                state = STATES.IN_COMMENT;
                previousValue.push({tags: []});
                returnValue = previousValue;
            } else {
                var last = previousValue[previousValue.length - 1];
                if (state === STATES.IN_COMMENT && typeof currentValue === "string") {
                    if (currentValue === TOKEN_PROCESSORS.COMMENT_END.TOKEN) {
                        state = STATES.OUT_COMMENT;
                        last.currentTag = null;
                    } else if (last.currentTag) {
                        last.currentTag.comment += "\n" + currentValue;
                    } else {
                        last.text = last.text ? last.text + "\n" + currentValue :
                            currentValue;
                    }
                } else if (typeof currentValue !== "string") {
                    last.tags.push(currentValue);
                    last.type = last.type ? last.type : identifyCommentType(currentValue);
                    last.currentTag = currentValue[keys(currentValue)[0]];
                }
                returnValue = previousValue;
            }
        }

        if (index === mappedArray.length - 1 && returnValue && returnValue.length > 1) {
            returnValue = sortComments(returnValue);
        }

        return returnValue;
    });
};

/**
 * Sort mapped reduced comments. Module comments first followed by class, variables and methods.
 * @param {Comment[]} comments an array of mapped-reduced comments
 * @return {Comment[]} sorted comments array
 * @private
 */
function sortComments(comments) {
    var moduleComments = [];
    var typeComments = [];
    var varComments = [];
    var methodComments = [];
    var typelessComments = [];

    comments.forEach(function (comment) {
        if(comment.type) {
            switch(comment.type) {
                case exports.COMMENT_TYPES.MODULE:
                    moduleComments.push(comment);
                    break;
                case exports.COMMENT_TYPES.METHOD:
                    methodComments.push(comment);
                    break;
                case exports.COMMENT_TYPES.TYPE:
                    typeComments.push(comment);
                    break;
                case exports.COMMENT_TYPES.VARIABLE:
                    varComments.push(comment);
                    break;
            }
        } else {
            typelessComments.push(comment);
        }
    });

    return moduleComments.concat(typeComments.concat(varComments.concat(methodComments.concat(typelessComments))));
}
/**
 * Try to identify the type of a comment from a comment tag.
 * @param tag a tag
 * @return {String} the type of the comment or null if not identified
 * @private
 */
function identifyCommentType(tag) {
    var commentType = null;
    for (var tagName in tag) {
        if (tag.hasOwnProperty(tagName)) {
            switch (tagName) {
                case exports.TAG_NAMES.API:
                case exports.TAG_NAMES.METHOD:
                case exports.TAG_NAMES.METHOD_SIGNATURE:
                case exports.TAG_NAMES.METHOD_NAME:
                case exports.TAG_NAMES.PARAM:
                case exports.TAG_NAMES.RETURN:
                case exports.TAG_NAMES.THROWS:
                    commentType = exports.COMMENT_TYPES.METHOD;
                    break;
                case exports.TAG_NAMES.MODULE:
                case exports.TAG_NAMES.REQUIRES:
                    commentType = exports.COMMENT_TYPES.MODULE;
                    break;
                case exports.TAG_NAMES.CLASS:
                    commentType = exports.COMMENT_TYPES.TYPE;
                    break;
                case exports.TAG_NAMES.VARIABLE_NAME:
                    commentType = exports.COMMENT_TYPES.VARIABLE;
                    break;
            }
        }
    }

    return commentType;
}

function removePrecedingAsterisks(line) {
    if (line.trim().indexOf("*") === 0) {
        line = line.trim();
        var match = line.match("[^\\*]");
        line = match ? line.substr(match.index) : "";
    }
    return line;
}

function augmentNonCommentLine(line, codeHandler) {
    var response = "";
    if (codeHandler.isMethodDecl(line)) {
        response = {};
        response[exports.TAG_NAMES.METHOD_SIGNATURE] = codeHandler.methodSignature(line);
        response[exports.TAG_NAMES.METHOD_NAME] = codeHandler.methodNameFromMethodSignature(response.methodSignature);
    } else if (codeHandler.isVariableDecl(line)) {
        response = {};
        response[exports.TAG_NAMES.VARIABLE_NAME] = codeHandler.variableNameFromVariableDecl(line);
    }

    return response;
}

function determineTagValue(comment, tag) {
    var tagValue = null;
    var tagIndex = comment.indexOf(tag);
    if (tagIndex !== -1) {
        tagValue = comment.substr(tagIndex + tag.length).split("\n")[0].trim();
    }
    return tagValue;
}

function keys(o) {
    var keyArray = [];
    for (var key in o) {
        if (o.hasOwnProperty(key)) {
            keyArray.push(key);
        }
    }

    return keyArray;
}