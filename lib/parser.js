/**
 * Parse a String looking for jsdoc / javadoc style comments and provide these in a data structure for subsequent
 * use.
 */
exports.parse = function (commentedCode) {
    var comments = {};
};

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

//var match = "/** hi */\nfunction () { some code here }\n\n /** \n * This is a comment\n\n * @param {String} param a parameter\n */\nvar f = function () { more code }".match("([\\s\\S]*?)/\\*\\*");
//console.log(match);