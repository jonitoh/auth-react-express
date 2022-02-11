const fs = require("fs");
const path = require("path");
const { Model } = require("mongoose"); // for a hack -- https://github.com/DefinitelyTyped/DefinitelyTyped/issues/33103#issuecomment-464355173

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
    //  || (typeof(input) === 'object' && input !== null)
    return input;
  } else if (typeof input === "string") {
    return require(resolvePath(input));
  } else {
    throw new Error(
      "Invalid format. It should be an array, an object or the path to the json file."
    );
  }
};

const randomProductKey = () =>
  "product-key-" + Math.round(Math.random() * 10000 + 1) + "-fake";

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

class BaseSchemaClass extends Model {
  // for now, ut's in the class
  static formatDate = (newDate) => formatDate(newDate);

  // for now it's a virtual
  get dumpFilename() {
    return `dump-file-${this.formatDate(new Date())}.json`;
  }

  // `basicCallback` becomes a static
  static basicCallback = (error, docs) => {
    if (error) console.log(error);
    console.log(`${docs.length} documents added.`);
    /*
    docs.forEach((doc) => {
      console.log(`added '${doc._id}' to collection`);
    });
    */
  };

  /* NOT WORKING 
  // `insertFromData` becomes a static
  static insertFromData = (
    data,
    cb = (error, docs) => {
      if (error) console.log(error);
      console.log(`${docs.length} documents added.`);
      /*
      docs.forEach((doc) => {
        console.log(`added '${doc._id}' to collection`);
      });
      *
    }
  ) => this.insertMany(data, (error, docs) => cb(error, docs));
  */

  // `dumpData` becomes a static
  static dumpData = async (outputDir, filename = this.dumpFilename) => {
    try {
      const data = await this.find({});
      const absoluteOutputDir = resolvePath(outputDir);
      // check folder existence
      fs.mkdir(absoluteOutputDir, { recursive: true }, (err, pth) => {
        if (err) console.log(err);
      });

      const fullPath = path.join(absoluteOutputDir, filename);
      fs.writeFile(fullPath, data, (err) => {
        if (err) console.log(err);
      });
    } catch (error) {
      console.log(error);
      throw new Error(error.toString());
    }
    console.log("data should be dumped by now");
  };
}

module.exports = {
  resolveInput,
  resolvePath,
  randomProductKey,
  randomNumber,
  randomDate,
  BaseSchemaClass,
  formatDate,
};
