const fs = require("fs");
const path = require("path");

const resolveInput = (input) => {
  if (input instanceof Array) {
    return input;
  } else if (input instanceof String) {
    return resolve(input);
  } else {
    throw new Error(
      "Invalid format. It should be an array or the path to the json file."
    );
  }
};

const randomProductKey = () =>
  "product-key-" + Math.round(Math.random() * 10000 + 1) + "-fake";

const randomNumber = (start, end) =>
  Math.round(start + Math.random() * (end - start));

const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// generique insertMany
const insertFromData = (
  data,
  collection,
  cb = (error, docs) => {
    if (error) console.error(error);
    console.log(`${docs.length} documents added.`);
    /*
    docs.forEach((doc) => {
      console.log(`added '${doc._id}' to collection`);
    });
    */
  }
) => {
  collection.insertMany(data, (error, docs) => cb(error, docs));
};

// generique dumping
const dumpData = (collection, outputDir, filename) => {
  const data = collection.find({}, (error, docs) => {});
  // check folder existence
  fs.mkdir(outputDir, { recursive: true }, (err, pth) => {
    if (err) console.log(err);
  });

  const fullPath = path.join(outputDir, filename);
  fs.writeFile(fullPath, data, (err) => {
    if (err) console.log(err);
  });
};

module.exports = {
  resolveInput,
  randomProductKey,
  randomNumber,
  randomDate,
  insertFromData,
  dumpData,
};
