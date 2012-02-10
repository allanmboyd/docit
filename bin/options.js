exports.options = {
    "codeHandler": {
        "default": "./codehandlers/jsCodeHandler.js",
        "describe": "An optional code handler to handle code specific aspects of the output markdown. For example method signature and deriving method name from signature when not specified within the method comment."
    },
    "config": {
        "describe": "Path to a json configuration file defining custom options. All command line options - except this one and --help - will be used if present. Options specified directly on the command line override file loaded options."
    },
    "defaultModuleHeading": {
        "default": "Module",
        "describe": "The default heading for a any module that does not include one. This is only used when docit takes its input from stdio. Otherwise the input filename becomes the default module name."
    },
    "dir" : {
        "describe": "Path to folder containing commented code to be processed by docit. Docit will recurse down any subfolders within this directory path."
    },
    "includePrivate": {
        "default": "false",
        "describe": "Include comments that are labelled as @private or @api private in the resulting md."
    },
    "includeHRBeforeMethod": {
        "default": "true",
        "describe": "Include a horizontal rule before method comments."
    },
    "help": {
        "alias": "h",
        "describe": "This message."
    },
    "horizontalRuleMarkdown": {
        "default": "\n------------------------------------------------\n",
        "describe": "Horizontal rule markdown string."
    },
    "methodHeadingMarkdown": {
        "default": "-",
        "describe": "Method heading markdown. Single - and = characters are interpreted as underlines spanning the length of the method name."
    },
    "methodSignatureMarkdown": {
        "default": "###",
        "describe": "Markdown to be applied to method signatures."
    },
    "moduleHeadingMarkdown": {
        "default": "=",
        "describe": "Module heading markdown. Single - and = characters are interpreted as underlines spanning the length of the module name."
    },
    "out" : {
        "default": "md",
        "describe": "Path of directory into which to write generated markdown files. This option is only valid when the --dir option is also specified. Each input file will result in a .md equivalent within the named directory. This directory and sub-directories where required will be created if they do not exist"
    },
    "paramsHeading": {
        "default": "Parameters",
        "describe": "By default the list of method parameters is given a heading. This is that heading."
    },
    "paramsHeadingMarkdown": {
        "default": "####",
        "describe": "The markdown to be applied to the parameters list heading."
    },
    "paramsListMarkdown": {
        "default": "*",
        "describe": "This markdown for the list style of method parameter comments."
    },
    "paramTypeMarkdown": {
        "default": "*",
        "describe": "The emphasis markdown surrounding the type of a parameter."
    },
    "requiresLabel": {
        "default": "Requires:",
        "describe": "The label used to tag the line of modules upon which the current module depends."
    },
    "requiresLabelMarkdown": {
        "default": "*",
        "describe": "The emphasis markdown surrounding the requires label."
    },
    "returnHeading": {
        "default": "Returns",
        "describe": "By default the description of the return value from a method is given a heading. This is that heading."
    },
    "returnHeadingMarkdown": {
        "default": "####",
        "describe": "The markdown to be applied to the return heading."
    },
    "returnTypeMarkdown": {
        "default": "*",
        "describe": "The emphasis markdown surrounding the type of a parameter."
    },
    "typeHeadingMarkdown": {
        "default": "-",
        "describe": "Method heading markdown. Single - and = characters are interpreted as underlines spanning the length of the method name."
    }
};