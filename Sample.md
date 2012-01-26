Sample
======

This is the module comment. It is about the module. Typically it would include details about dependencies.

*Requires:* diffMatchPatch, stack-trace

applyFilters
------------

### StringBuffer applyFilters ( includedAction, excludedAction, stack, filters, inclusive, includedMessage ) ###

Apply filters to the lines of an error.stack and call the includedAction or the excludedAction functions based
on the result of the match and the value of the 'inclusive' parameter.

If based on the filter a stack line is included includedAction is invoked with the current value of the stack under
construction and the current stack line. Otherwise excludedAction is called with the same arguments.

This function is common to higher level functions that operate based on stack line filtering and should only be
required to meet bespoke behaviour that cannot be achieved through the higher level functions (e.g.
exports.stackHighlight and exports.stackFilter).

Normally there should be no need to call this function directly.

#### Parameters ####

- includedAction *Function(stack, stackLine)* the function to call for stack lines that are included based on filters
and inclusive parameters. This function returns the updated stack under construction and its signature is:
    includedAction(stackUnderConstruction, includedStackLine)
- stack *String* a stack from an Error (i.e. error.stack)
- filters *String[]* an array of regular expressions against which to perform match operations on each line of the stack

#### Returns ####

*String* a new error stack modified according to the results of calls to includedAction and excludedAction based on
filters provided and the inclusive parameter.

--

applyStackHighlights
--------------------

### String applyStackHighlights ( stack, messageLineHighlights, stackHighlights, stackPatterns, inclusive) ###

Convenience method to apply a given set of highlights to a an error stack.

#### Parameters ####

- stack *String* an Error stack (i.e. error.stack)
- messageLineHighlights *String[]* an prefixes to be applied to the first line of the stack (e.g. [exports.styles.RED,
exports.styles.BOLD])

