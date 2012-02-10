commentEndProcessor
-------------------

###var commentEndProcessor = function ()###

Process a closing comment. Just return the end comment tag

NOTE: any other information on end comment line is ignored


commentStartProcessor
---------------------

###var commentStartProcessor = function ()###

Process an opening comment. Just return the start comment tag.

NOTE: any other information on the start-comment line is ignored


",
--

###var inlineCommentProcessor = function (commentLine)###

Process a line beginning with a *. If this is in a comment then remove all the * from the start of the line

####Parameters####

- commentLine the comment line
- PARAM: undefined

####Returns####

RETURN: "@return",



parse
-----

###exports.parse = function (commentedCode, codeHandler)###

Parse a String looking for jsdoc / javadoc style comments and provide these in a data structure for subsequent
use.


identifyCommentType
-------------------

###function identifyCommentType(tag)###

Try to identify the type of a comment from a comment tag.

####Parameters####

- tag a tag

