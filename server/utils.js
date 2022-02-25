const fs = require("fs");
const path = require("path");

const resolvePath = (input) => {
  if (path.isAbsolute(input)) {
    return require(input); // tackle fetching ?
  } else {
    // if relative path
    return path.resolve(__dirname, input);
  }
};

const resolveInput = (input) => {
  if (input instanceof Array) {
    return input;
  } else if (typeof input === "string") {
    return require(resolvePath(input));
  } else {
    throw new Error(
      "Invalid format. It should be an array, an object or the path to the json file."
    );
  }
};

const randomNumber = (start, end) =>
  Math.round(start + Math.random() * (end - start));

const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const pad = (number) => (number < 10 ? "0" + number : number);

const formatDate = (date) =>
  date.getUTCFullYear() +
  "-" +
  pad(date.getUTCMonth() + 1) +
  "-" +
  pad(date.getUTCDate()) +
  "-" +
  pad(date.getUTCHours()) +
  "-" +
  pad(date.getUTCMinutes()) +
  "-" +
  pad(date.getUTCSeconds());

const handleErrorForLog = (error, priorMessage = "", strictMode = false) => {
  if (priorMessage) {
    console.log(priorMessage);
  }
  console.error(`Error ${error}\n${error.stack}`);
  if (strictMode) {
    process.exitCode = 2;
    throw new Error(error.message);
  }
};

const handleMessageForResponse = (obj, res, code = 500, priorMessage = "") => {
  let name = "Error";
  let stack = undefined;
  if (priorMessage) {
    console.log(priorMessage);
  }
  let message;
  if (obj instanceof Error) {
    message = obj.message;
    name = obj.name;
    stack = obj.stack;
  }
  if (typeof obj === "string") {
    message = obj;
  }
  res.status(code).send({ name, message, stack });
  return;
};

class CustomError {
  constructor(errors) {
    this._separator = " || ";
    this._errors = [];
    if (typeof errors === "string") {
      this._errors.push(errors);
    }
    if (errors instanceof Array) {
      this.errors = [...errors];
    }
  }

  get separator() {
    return this._separator;
  }

  set separator(separator) {
    this._separator = separator;
  }

  add(error) {
    if (!!error) {
      if (error instanceof Error) {
        this._errors.push(error.message);
        return;
      }
      this._errors.push(error);
    }
  }

  get message() {
    return this.list.join(this.separator);
  }

  get list() {
    return this._errors.filter((e) => !!e);
  }
}

// cf. https://www.digitalocean.com/community/tutorials/js-capitalizing-strings
const capitalize = (string) =>
  string
    .trim()
    .toLowerCase()
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));

class BaseSchemaClass {
  // `insertFromData` becomes a static
  static async insertFromData(data) {
    try {
      return await this.insertMany(data);
    } catch (e) {
      return handleErrorForLog(e);
    }
  }

  // `dumpData` becomes a static
  static async dumpData({
    filename,
    filter = {},
    projection = null,
    options = {},
    encoding = "utf-8",
  }) {
    try {
      const data = await this.find(filter, projection, options);
      const jsonData = JSON.stringify(data);
      fs.writeFile(filename, jsonData, encoding, (err) => {
        if (err) console.log(err);
      });
    } catch (error) {
      handleErrorForLog(error, "Error during dumping process");
    }
  }
}

module.exports = {
  resolveInput,
  resolvePath,
  randomNumber,
  randomDate,
  formatDate,
  BaseSchemaClass,
  handleErrorForLog,
  handleMessageForResponse,
  CustomError,
  capitalize,
};
