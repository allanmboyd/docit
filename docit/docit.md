DocIt
=====

Language independent translation of code comments into Markdown


commentsToMD
------------

###exports.commentsToMD = function(commentedCode, customSettings, moduleName)###

Return a String of Markdown generated from the comments within some code that is provided as a String.

when these are not explicitly listed within comments

####Parameters####

- commentedCode *String* commented code
- customSettings *Object* optional settings to override defaults that can be used for example to determine method names
- moduleName optional override for the name and main heading for the module comments

