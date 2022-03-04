const isEmpty = function (value, allowNull = false, allowUndefined = false) {
  if (value === null) {
    return !allowNull;
  }
  if (value === undefined) {
    return !allowUndefined;
  }
  return Object.keys(value).length === 0;
};

// react pur et dur
const extractPathFromLocation = function (
  location,
  defaultPath,
  excludedPaths
) {
  if (typeof excludedPaths === "string") {
    excludedPaths = [excludedPaths];
  }
  if (!excludedPaths instanceof Array) {
    throw new Error(
      `excludedPaths should be a string or an array. Instead, it's a ${typeof excludedPaths}.`
    );
  }
  const from = location.state?.from?.pathname;
  if (!from || excludedPaths.includes(from)) {
    return defaultPath;
  }
  return from;
};

const sortFromDate = function (
  items,
  getDate = (item) => item,
  ascending = true
) {
  const factor = ascending ? 1 : -1;
  return [...items].sort(
    (a, b) => factor * (getDate(a) - getDate(b) > 0 ? 1 : -1)
  );
};

// cf. https://www.digitalocean.com/community/tutorials/js-capitalizing-strings
const capitalize = (string, lowerCase = false) => {
  let result = string.toString().trim();
  if (lowerCase) {
    result = result.toLowerCase();
  }
  return result.replace(/\w\S*/g, (w) =>
    w.replace(/^\w/, (c) => c.toUpperCase())
  );
};

const getFromNestedObject = (obj, ...selectors) =>
  [...selectors].map((str) =>
    str
      .toString()
      .replace(/\[([^\[\]]*)\]/g, ".$1.")
      .split(".")
      .filter((t) => t !== "")
      .reduce((prev, cur) => prev && prev[cur], obj)
  );

export {
  isEmpty,
  extractPathFromLocation,
  sortFromDate,
  capitalize,
  getFromNestedObject,
};
