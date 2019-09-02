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

/**
 * lead zero
 * @param {String} str raw string
 * @param {Number} i index
 * @param {Number} n count
 * @return {String}
 */
ds.leadZero = function leadZero(str, i, n) {
  const dn = (Math.log10(n) >> 0);
  const di = (Math.log10(i) >> 0);
  const dt = dn - di;
  const zero = dt > 0 ? new Array(dt).fill("0", 0, dt).join("") : "";
  return `${zero}${i}${str}`;
};

/**
 * average
 * @param {Number[]} nums
 * @returns {Number}
 */
ds.average = function avrage(nums) {
  if (!Array.isArray(nums)) {
    return 0;
  }
  const sum = nums.reduce((n, i) => n += i, 0);
  return sum / nums.length;
};