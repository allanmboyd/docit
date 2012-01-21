/**
 * DocIt
 *
 * Generate Markdown code documentation from jsdoc / javadoc style code comments.
 *
 * @requires dox
 */
var dox = require("dox");
var util = require("util");

/**
 * Translate commented code into Markdown.
 * @param {String} commentedCode commented code from a single file
 * @return {String} the jsdoc / javadoc style comments provided within the commented code translated into Markdown
 */
exports.commentsToMD = function (commentedCode) {
    var jsonComments = dox.parseComments(commentedCode);
    var md = jsonComments;
    return md;
};