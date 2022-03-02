const isEmpty = function (value, allowNull = false, allowUndefined = false) {
  if (value === null) {
    return !allowNull;
  }
  if (value === undefined) {
    return !allowUndefined;
  }
  return Object.keys(value).length === 0;
};

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

export { isEmpty, extractPathFromLocation, sortFromDate };
