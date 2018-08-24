
/**
 * @group hook
 * @function file.*.item.?.extractTypeAndName
 * Language-specific function thar tries to extract item details 
 * from the code it self, not from the comment.
 * @param {File} file
 * @param {int} startIndex Position in the file where comment ends and the following 
 * code begins
 * @param {bool} checkFunctions check for function definitions
 * @param {bool} checkVars check for variable definitions
 * @returns {array} [type, name]
 */