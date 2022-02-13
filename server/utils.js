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
  "" +
  pad(date.getUTCSeconds());

function handleError(error) {
  console.error(`Error ${error}\n${error.stack}`);
  process.exit(2);
}

class BaseSchemaClass {
  // `basicCallback` becomes a static
  static basicCallback(error, docs) {
    if (error) console.log(error);
    if (docs) {
      console.log(`${docs.length} documents added.`);
      /*
      docs.forEach((doc) => {
        console.log(`added '${doc._id}' to collection`);
      });
      */
    } else {
      console.log("no documents");
    }
  }

  // `insertFromData` becomes a static
  static insertFromData(data, cb = this.basicCallback) {
    this.insertMany(data, cb);
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
      console.log("error during dumping process");
      throw new Error(error.toString());
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
};
