function isEmpty(value: unknown, allowNull = false, allowUndefined = false): boolean {
  if (value === null) {
    return !allowNull;
  }
  if (value === undefined) {
    return !allowUndefined;
  }
  return Object.keys(value as Record<string, unknown>).length === 0;
}

function sortFromDate<T>(
  items: T[],
  getDate = (item: T) => item as unknown as Date,
  ascending = true
): T[] {
  const factor = ascending ? 1 : -1;
  return [...items].sort(
    (a: T, b: T) => factor * (getDate(a).getTime() - getDate(b).getTime() > 0 ? 1 : -1)
  );
}

// cf. https://www.digitalocean.com/community/tutorials/js-capitalizing-strings
function capitalize(str: string, toLowerCase = false): string {
  let result = str.toString().trim();
  if (toLowerCase) {
    result = result.toLowerCase();
  }
  return result.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
}

function getFromNestedObject(
  obj: Record<string, unknown> | Object,
  ...selectors: string[]
): (Record<string, unknown> | Object | undefined)[] {
  return [...selectors].map((str) =>
    str
      // eslint-disable-next-line no-useless-escape
      .replace(/\[([^\[\]]*)\]/g, '.$1.')
      .split('.')
      .filter((t) => t !== '')
      .reduce(
        (prev, cur) => (prev && (prev as Record<string, unknown>)[cur]) as Record<string, unknown>,
        obj
      )
  );
}

function emptyFunction() {}

export { emptyFunction, isEmpty, sortFromDate, capitalize, getFromNestedObject };
