import { Location } from 'react-router-dom';

interface LocationState {
  from?: {
    pathname?: string;
  };
}

function extractPathFromLocation(
  location: Location,
  defaultPath: string,
  excludedPaths: string | string[]
): string {
  let ourExcludedPaths: string[];
  if (typeof excludedPaths === 'string') {
    ourExcludedPaths = [excludedPaths];
  } else if (excludedPaths instanceof Array) {
    ourExcludedPaths = excludedPaths;
  } else {
    throw new Error(
      `excludedPaths should be a string or an array. Instead, it's a ${typeof excludedPaths}.`
    );
  }
  const from: undefined | string = (location.state as LocationState)?.from?.pathname;
  if (!from || ourExcludedPaths.includes(from)) {
    return defaultPath;
  }
  return from;
}

export { extractPathFromLocation, LocationState };
