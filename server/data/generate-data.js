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
  const { rolesMap, _doNotPopulate, ...opts } = options;
  // initiate rolesMap
  if (rolesMap instanceof String) {
    rolesMap = resolve(rolesMap);
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
  console.log("generated data", data);
  /*
  // for inserting large batches of documents
  db.User.insertMany(users, (err) => {
    console.log("Error for the users", err);
  });
  db.ProductKey.insertMany(productKeys, (err) => {
    console.log("Error for the productKeys", err);
  });*/
};

module.exports = { generateData };
