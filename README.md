FormatErrors
============

An API that provides various options for formatting and highlighting Errors. May be useful for logging and test
frameworks for example.

Stack lines can be filtered in and out based on patterns and limited by range (e.g. lines 2 through 10). Stack lines
and error message can have highlights applied based on patterns. Finally stack lines can be formatted to include or
exclude available fields.

The API is quite flexible with a range of methods varying in level with means to specify custom highlights and
formats.


Installation
------------

    $ npm install formaterrors

Or include as a dependency within packakage.json and use: *npm link*.


Usage
-----

    var formatErrors = require("formaterrors");


Then invoke the provided APIs on instances of Error or Error.stack as required.


Examples
--------

Some examples are available within the *examples* folder. They can be executed as follows:

    $node examples/<file.js>

    
API Docs
--------

[Here is the HTML source](https://github.com/allanmboyd/formaterrors/blob/master/docs/out "API Docs")
of the API docs. These docs needs to be downloaded and opened in a browser.


Testing
-------

Tests utilise [nodeunit](https://github.com/caolan/nodeunit). In addition jshint is run against both lib and test
javascript files.

First install the dependencies:

    $ npm link

Then to run the tests:

    $ npm test


Known Issues
------------


  * Changing the stack line prefix and subsequently applying stack highlights or theme is not likely to produce the
    desired result because the stack prefix is key to differentiating between the message and the stack lines parts of
    the error stack.



