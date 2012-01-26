/**
 * Parse a String looking for jsdoc / javadoc style comments and provide these in a data structure for subsequent
 * use.
 */
exports.parse = function (commentedCode) {
    var comments = findComments(commentedCode);
    for (var i = 0; i < comments.length; i += 1) {
        comments[i].triagedDoc = triageComment(comments[i].doc);
        if (comments[i].code) {
            comments[i].codeFirstLine = firstNonEmptyLine(comments[i].code);
        }
    }

    return comments;
};

/**
 * Trim whitespace from comment lines and split into lines separated by newline characters. Also remove * characters
 * from the start of lines and remove lines that are opening and closing comments.
 * @param {String} comment a comment
 * @return {String []} an array of comment lines without comment markup and whitespace trimmed
 */
function triageComment(comment) {
    var commentLines = comment.split("\n");
    var triagedComments = [];
    for (var i = 0; i < commentLines.length; i += 1) {
        var line = commentLines[i].trim();
        if (!isCommentLine(line)) {
            if (line.indexOf("*") === 0) {
                line = line.substr(1).trim();
            }
            triagedComments.push(line);
        }
    }

    return triagedComments;
}

/**
 * Return the first non-empty line of some text.
 * @param {String} text the text
 * @return {String} the first non-empty line of the given text or the given text if no such line is encountered
 */
function firstNonEmptyLine(text) {
    var lines = text.split("\n");
    var nonEmptyLine = null;
    for (var i = 0; i < lines.length && nonEmptyLine === null; i += 1) {
        if (lines[i].trim().length > 0) {
            nonEmptyLine = lines[i];
        }
    }
    return nonEmptyLine ? nonEmptyLine : text;
}

/**
 * Determine if a line is a opening comment line or a closing comment line.
 * @param line the line
 * @return {Boolean} true if the line is an opening or closing comment line; false otherwise
 */
function isCommentLine(line) {
    line = line.trim();
    var endMatch = line.match("(\\*+)/");
    return line.indexOf("/**") === 0 || endMatch !== null;
}

/**
 * Find all the comments and their associated code within the given commentedCode String and return these as
 * an array of objects. Each object in the returned array contains the comment part as *doc* and the associated
 * code if any as *code*.
 *
 * @param {String} commentedCode
 * @return {Object[]} an array of comments and their associated code blocks
 */
function findComments(commentedCode) {
    var comments = [];
    var index = 0;
    var nextComment;
    do {
        nextComment = firstComment(commentedCode);
        if (nextComment) {
            var comment = {};
            comment.doc = nextComment[0];
            index = nextComment.index + comment.doc.length;
            commentedCode = commentedCode.substr(index);
            comment.code = firstNonComment(commentedCode);
            comments.push(comment);
        }
    } while (nextComment && commentedCode.length > 0);

    return comments;
}

/**
 * Find and return the first string that is not a comment in the provided commentedCode. If the given commented code
 * starts with a comment or there are no comments and no non comments then null is returned.
 *
 * @param {String} commentedCode the commented code
 * @return {String} the result of a String.match that returns the first non-comment - or an empty String if
 * commentedCode starts with a comment. If there are comments and no non-comments then null is returned.
 */
function firstNonComment(commentedCode) {
    var match = commentedCode.match("([\\s\\S]*?)/\\*\\*");
    return match && match[1] ? match[1] : null;
}

/**
 * Find and return the first jsdoc / javadoc style code comment in a given String.
 *
 * @param {String} commentedCode the commented code
 * @return {MatchResult} the result of a String.match that returns the first comment
 */
function firstComment(commentedCode) {
    return commentedCode.match("/\\*\\*([\\s\\S]*?)\\*/");
}
