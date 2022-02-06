const generateDataFromJson = ({
  rolesMap,
  coerceRole = true,
  outputDir = "",
}) => {
  console.log("Generate data from json");
  const roles = [];
  const productKeys = [];
  const users = [];
  return { roles, productKeys, users };
};

const generateDataFromRandom = ({
  rolesMap,
  coerceRole = true,
  numUser = 5,
  numProductKey = undefined,
  outputDir = "",
}) => {
  console.log("Generate data from json");
  const roles = [];
  const productKeys = [];
  const users = [];
  return { roles, productKeys, users };
};

const generateData = (db, method = "json", options) => {
  const { rolesPath, _doNotPopulate, ...opts } = options;
  // initiate rolesMap
  let rolesMap = [];
  if (rolesPath) {
    rolesMap = resolve(rolesPath);
  } else {
    rolesMap = db;
  }
  // initiate data
  let data = {};
  switch (method) {
    case "json":
      data = generateDataFromJson({ ...opts, rolesMap });
      break;
    case "random":
      data = generateDataFromRandom({ ...opts, rolesMap });
      break;
    default:
      throw new Error("Unknow method");
      break;
  }

  //
  if (_doNotPopulate || false) {
    console.log("It has been asked to not populate the database");
    return;
  }

  // for inserting large batches of documents
  db.user.insertMany(users, (err) => {
    console.log("Error for the users", err);
  });
  db.productKey.insertMany(productKeys, (err) => {
    console.log("Error for the productKeys", err);
  });
};

module.exports = { generateData };
