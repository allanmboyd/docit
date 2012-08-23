[![build status](https://secure.travis-ci.org/allanmboyd/docit.png)](http://travis-ci.org/allanmboyd/docit)
DocIt
=====

Generate Markdown from jsdoc style code comments.

Background
----------

I like the way GitHub presents project README.md files. I also like to include API documentation within the
project README.md (assuming the API is not particularly large). Being quite lazy I did not want to have to keep
my README.md API docs in sync and up-to-date each time I made a change to the commented code docs.

I looked around for some tool that would generate Markdown from my jsdoc style comments. (Oh, and the other thing
I wanted was to have Markdown not HTML for my comments - so that it played nicely with README and other md docs.) So,
anyway I didn't find anything that met all my needs and so decided to make one myself. DocIt is the result.

Installation
------------

    npm install docit

By default docit installs globally.

Usage
-----

Probably easiest to provide a few examples:

1. Iterate over all the files in a folder - and recursively through its sub-folders. Each file is examined for jsdoc
style comments. For each processed file an equivalent <file>.md file is produced within a folder in the current
working directory (by default) called "md" (by default). For each encountered folder an equivalent is created under the
output "md" folder hierarchy:

        docit --dir=lib

2. Same as example 1. but only include files ending in .js:

        docit --dir=lib --includeFiles=.js$

3. Generate md comments from stdio using a javascript code handler for help with method signature, variable names etc.
This command writes to stdout.

        docit --codeHandler="./codehandlers/jsCodeHandler" < module.js

4. Almost all configuration can be specified with a configuration file - an example is in the examples folder. Config
that is missing and not specified on the command line uses a default value. Command line specified arguments override
any equivalent within a config file. To specify a config file:

        docit --config=examples/sample_config.json

5. There are quite a few options for changing labels and markdown associated with tags and labels. To get the full usage
that is shown below:

        docit --help

...which gives:

<pre><code>
Usage: docit [--config=<file path>] [--dir=<dir path> | <stdin>] [--out=<dir path>] [configOption]

Options:
  --apiLabel                  The label to associate with an api tag comment.
                                                              [default: "API:"]
  --apiLabelMarkdown          The emphasis markdown for the api label.
                                                                 [default: "*"]
  --authorLabel               The label to associate with an author tag
                              comment.                     [default: "Author:"]
  --authorLabelMarkdown       The emphasis markdown for the author label.
                                                                 [default: "*"]
  --codeHandler               An optional code handler to handle code specific
                              aspects of the output markdown. For example
                              method signature and deriving method name from
                              signature when not specified within the method
                              comment. If specified codeHandler will override
                              codeHandlers.                     [default: null]
  --codeHandlers              Mappings of code handlers to expressions. Used
                              to associated code handlers with corresponding
                              files e.g. javascript files with .js files.
                          [default: [{"\\.js":"./codehandlers/jsCodeHandler"}]]
  --config                    Path to a json configuration file defining
                              custom options. All command line options -
                              except this one and --help - will be used if
                              present. Options specified directly on the
                              command line override file loaded options.
  --constructorLabel          The label to associate with a constructor tag
                              comment.                [default: "Constructor:"]
  --constructorLabelMarkdown  The emphasis markdown for the constructor label.
                                                                 [default: "*"]
  --defaultModuleHeading      The default heading for a any module that does
                              not include one. This is only used when docit
                              takes its input from stdio. Otherwise the input
                              filename becomes the default module name.
                                                            [default: "Module"]
  --deprecatedLabel           The label to associate with an deprecated tag
                              comment.                 [default: "Deprecated:"]
  --deprecatedLabelMarkdown   The emphasis markdown for the deprecated label.
                                                                 [default: "*"]
  --dir                       Path to folder containing commented code to be
                              processed by docit. Docit will recurse down any
                              subfolders within this directory path.
  --includeFiles              Comma separated list of file names or
                              expressions used to determine the files to
                              process when --dir option is employed.
                                                                [default: null]
  --includeHRAfterMethod      Include a horizontal rule after a method comment.
                                                              [default: "true"]
  --includeHRBeforeMethod     Include a horizontal rule before a method
                              comment.                       [default: "false"]
  --includePrivate            Include comments that are labelled as @private
                              or @api private in the resulting md.
                                                             [default: "false"]
  --help, -h                  This message.
  --horizontalRuleMarkdown    Horizontal rule markdown string.
                                                         [default: "* * *\n\n"]
  --methodHeadingMarkdown     Method heading markdown. Single - and =
                              characters are interpreted as underlines
                              spanning the length of the method name.
                                                                 [default: "-"]
  --methodSignatureMarkdown   Markdown to be applied to method signatures.
                                                               [default: "###"]
  --moduleHeadingMarkdown     Module heading markdown. Single - and =
                              characters are interpreted as underlines
                              spanning the length of the module name.
                                                                 [default: "="]
  --out                       Path of directory into which to write generated
                              markdown files. This option is only valid when
                              the --dir option is also specified. Each input
                              file will result in a .md equivalent within the
                              named directory. This directory and
                              sub-directories where required will be created
                              if they do not exist              [default: "md"]
  --paramsHeading             By default the list of method parameters is
                              given a heading. This is that heading.
                                                        [default: "Parameters"]
  --paramsHeadingMarkdown     The markdown to be applied to the parameters
                              list heading.                   [default: "####"]
  --paramsListMarkdown        This markdown for the list style of method
                              parameter comments.                [default: "*"]
  --paramTypeMarkdown         The emphasis markdown surrounding the type of a
                              parameter.                         [default: "*"]
  --privateTypeLabel          Label displayed adjacent to the type name when
                              the type is private.      [default: " (private)"]
  --privateVariableLabel      Label displayed adjacent to the variable name
                              when the variable is private.
                                                        [default: " (private)"]
  --requiresLabel             The label used to tag the line of modules upon
                              which the current module depends.
                                                         [default: "Requires:"]
  --requiresLabelMarkdown     The emphasis markdown surrounding the requires
                              label.                             [default: "*"]
  --returnHeading             By default the description of the return value
                              from a method is given a heading. This is that
                              heading.                     [default: "Returns"]
  --returnHeadingMarkdown     The markdown to be applied to the return heading.
                                                              [default: "####"]
  --returnTypeMarkdown        The emphasis markdown surrounding the type of
                              the thing returned from a method.  [default: "*"]
  --seeLabel                  The label to associate with a see tag comment.
                                                              [default: "See:"]
  --seeLabelMarkdown          The emphasis markdown for the see label.
                                                                 [default: "*"]
  --throwsHeading             By default the description of any throws value
                              from a method is given a heading. This is that
                              heading.                      [default: "Throws"]
  --throwsHeadingMarkdown     The markdown to be applied to the throws heading.
                                                              [default: "####"]
  --throwsTypeMarkdown        The emphasis markdown surrounding the type of an
                              exception thrown by a method.      [default: "*"]
  --typeNameMarkdown          The markdown to be applied to type names.
                                                               [default: "###"]
  --typesHeading              Heading for types section in the generated
                              markdown.                      [default: "Types"]
  --typesHeadingMarkdown      Type heading markdown. Single - and = characters
                              are interpreted as underlines spanning the
                              length of the method name.         [default: "-"]
  --variableNameMarkdown      The markdown to be applied to variable names.
                                                               [default: "###"]
  --variablesHeading          Heading for variables section in the generated
                              markdown.                  [default: "Variables"]
  --variablesHeadingMarkdown  Varibales heading markdown. Single - and =
                              characters are interpreted as underlines
                              spanning the length of the method name.
                                                                 [default: "-"]
  --versionLabel              The label to associate with a version tag
                              comment.                    [default: "Version:"]
  --versionLabelMarkdown      The emphasis markdown for the version label.
                                                                 [default: "*"]

</code></pre>

Testing
-------

First download. Then install dependencies with:

    npm link

After that to run the tests:

    npm test


Contributing
------------

Contributions are welcome. Please create tests for any updates and ensure jshint is run on any new files. Currently
npm test will run jshint on all lib and test javascript as well as running all the tests.


Bugs & Feature Suggestions
--------------------------

https://github.com/allanmboyd/docit/issues

