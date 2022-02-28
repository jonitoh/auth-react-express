const isEmpty = function (value, allowNull = false, allowUndefined = false) {
  if (value === null) {
    return !allowNull;
  }
  if (value === undefined) {
    return !allowUndefined;
  }
  return Object.keys(value).length === 0;
};

export { isEmpty };
