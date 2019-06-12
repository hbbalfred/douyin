const ds = module.exports;

/**
 * deserialize a bundle of expression to dictionary
 */
ds.exprToDict = function exprToDict(str, separator = "\n", assignment = "=") {
  return str.split(separator).reduce((dict, expr) => {
    const [k, v] = [...expr.split(assignment)];
    dict[k] = v;
    return dict;
  }, {});
};
