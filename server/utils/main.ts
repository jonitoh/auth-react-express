import path from "path";

function resolvePath(input: string): string {
  if (path.isAbsolute(input)) {
    return require.resolve(input); // tackle fetching ?
  } 
    // if relative path
    return path.resolve(__dirname, input);
};

/* eslint-disable global-require, import/no-dynamic-require, @typescript-eslint/no-var-requires */
function resolveInput<T>(input: unknown): Array<T> | T {
  if (input instanceof Array) {
    return input as Array<T>;
  }
  if (typeof input === "string") {
    return require(resolvePath(input)) as T;
  } 
  throw new Error(
    `Invalid format. It should be an array, an object or the path to the json file. Instead, it's a ${typeof input}.`
  );
  
};
/* eslint-enable */

const randomNumber = (start: number, end: number): number =>
  Math.round(start + Math.random() * (end - start));

const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const pad = (number: number): string => (number < 10 ? `0${  number}` : `${number}`);

const formatDate = (date: Date): string =>
  `${date.getUTCFullYear() 
  }-${ 
  pad(date.getUTCMonth() + 1) 
  }-${ 
  pad(date.getUTCDate()) 
  }-${ 
  pad(date.getUTCHours()) 
  }-${ 
  pad(date.getUTCMinutes()) 
  }-${ 
  pad(date.getUTCSeconds())}`;
 
// cf. https://www.digitalocean.com/community/tutorials/js-capitalizing-strings
function capitalize(string: string, shouldLowerCase: boolean = false): string {
  let result: string = string.trim();
  if (shouldLowerCase) {
    result = result.toLowerCase();
  }
  return result.replace(/\w\S*/g, (w) =>
    w.replace(/^\w/, (c) => c.toUpperCase())
  );
};

function isLike<T>(obj: any, keys: Array<keyof T>): obj is T {
  return keys.every((value: keyof T) => Object.prototype.hasOwnProperty.call(obj, value))
}

const HTTP_STATUS_CODE: {[key:string]: number} = {
  OK: 200, //Standard response for successful HTTP requests
  CREATED: 201, //Request has been fulfilled. New resource created
  NO_CONTENT: 204, //Request processed. No content returned
  MOVED_PERMANENTLY: 301, //This and all future requests directed to the given URI
  NOT_MODIFIED: 304, //Resource has not been modified since last requested
  BAD_REQUEST: 400, //Request cannot be fulfilled due to bad syntax
  UNAUTHORIZED: 401, //Authentication is possible, but has failed or needs to be done
  FORBIDDEN: 403, //Server refuses to respond to request and the server known the client's identity unlike unauthorized 401
  NOT_FOUND: 404, //Requested resource could not be found
  UNSUPPORTED_MEDIA_TYPE: 415, //The media format of the requested data is not supported by the server, so the server is rejecting the request.
  INTERNAL_SERVER_ERROR: 500, //Generic error message when server fails
  NOT_IMPLEMENTED: 501, //Server does not recognize method or lacks ability to fulfill
  SERVICE_UNAVAILABLE: 503, //Server is currently unavailable
};

export {
  resolveInput,
  resolvePath,
  randomNumber,
  randomDate,
  formatDate,
  capitalize,
  isLike,
  HTTP_STATUS_CODE,
};
