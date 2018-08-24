
/**
 * @group hook 
 * @function
 * Function called after flag is added to an item.
 * <code>file.*ext.item.*itemType.*flagName.added</code>.
 * For example: a hook <code>file.js.item.function.param.added</code>
 * would be called when finished processing param flag and added it to 
 * already identified function.
 * @param {string} flagName 
 * @param {string} flagContent
 * @param {Item} item
 */