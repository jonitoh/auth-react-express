const mongoose = require("mongoose");
const {
  resolveInput,
  randomProductKey,
  randomNumber,
  randomDate,
} = require("./../utils");

const getDatabaseConnection = () => {
  // import config
  const config = require("../config/db.config");

  // create connection
  const connection = mongoose.createConnection(config.URI, {
    useNewUrlParser: true, // use the newest url string parser
    useUnifiedTopology: true, // use the newest monitoring engine
    //useFindAndModify: true,
    family: 4, // Use IPv4, skip trying IPv6
    maxPoolSize: 5,
  });
  console.log("readyState", connection.readyState);

  // add listeners to the connection
  connection.on("open", () => {
    console.log("Database opened");
  });

  connection.on("close", () => {
    console.log("Database closed");
  });

  // create models
  const User = connection.model("user", require("../schemas/user.schema"));
  const ProductKey = connection.model(
    "product_key",
    require("../schemas/product-key.schema")
  );
  const Role = connection.model("role", require("../schemas/role.schema"));

  const addSuperAdminProductKey = ({
    key,
    activationDate = new Date(),
    activated = true,
    validityPeriod = 1 * 30 * 24 * 60 * 60, // in seconds aka 1 month
  }) => {
    // check if the key is already here
    const { isDuplicated, duplicateProductKey, errors } =
      ProductKey.checkDuplicate(key);

    // show potential errors
    if (errors) {
      console.log(errors);
      return;
    }

    // check if the key is already stored
    if (isDuplicated) {
      console.log(
        `Super admin product key has already been added and activated since ${duplicateProductKey.activationDate}.`
      );
      return;
    }

    // new key to add
    const productKey = new ProductKey({
      key,
      activationDate,
      activated,
      validityPeriod,
    });

    productKey.save((err, _) => {
      // show potential errors
      if (err) console.log(err);
      console.log(
        "Super admin product Key was created and registered successfully!"
      );
    });
  };

  // --- init database functions --- //
  // *** json has no ref nor _id
  const formatRolesFromJson = (input) => {
    // import roles
    const data = resolveInput(input);
    // role should look like this [{ name: ... }, ..., { name: ..., isDefault: true }]
    // check for default role
    let defaultRole = data.find(({ isDefault }) => isDefault === true);
    if (!!defaultRole) throw new Error("No default role found.");

    // set default role name
    Role.defaultRole = defaultRole.name;

    return data.map(({ name, isDefault }) => ({
      name: name,
      isDefault: !!isDefault,
    }));
  };

  const formatUsersFromJson = (input, coerceRole) => {
    // import users
    const data = resolveInput(input);

    // helpers
    const mapToProductKeyId = (key) =>
      ProductKey.findOne({ key: key }, (err, pk) => {});
    const mapToRoleId = (role) =>
      Role.findOne({ name: role }, (err, role) => {});

    const formattedData = [];

    for (let index = 0; index < data.length; index++) {
      const { productKey, roles, ...rest } = data[index];
      let formattedProductKey = mapToProductKeyId(productKey);
      let formattedRoles = roles.map((role) => mapToRoleId(role));

      let hasInconsistentProductKey = !formattedProductKey;
      let hasInconsistentRole = formattedRoles.some((role) => !role);

      // handle inconsistency
      if (hasInconsistentProductKey) {
        console.log("inconsistency on the product key.");
      }
      if (hasInconsistentRole) {
        if (coerceRole) {
          /*
          formattedRoles = formattedRoles.map((role) =>
            role ? role : Role.defaultRole.name
          );
          hasInconsistentRole = false;
          */
        } else {
          console.log("inconsistency on the role.");
        }
      }

      // add if possible the data
      if (!hasInconsistentProductKey && !hasInconsistentRole) {
        formattedData.push({
          productKey: formattedProductKey,
          roles: formattedRoles,
          ...rest,
        });
      }
    }
    console.log(
      `${data.length - formattedData.length} removed from inconsitency`
    );
    return formattedData;
  };

  const formatRolesFromRandom = ({
    roles = ["admin", "moderator", "user", "invited"],
    defaultRoleName = "invited",
  }) => {
    // import roles
    const data = roles.map((name) => ({
      name: name,
      isDefault: name === defaultRoleName,
    }));

    // set default role name
    Role.defaultRole = defaultRoleName;

    return data;
  };

  const formatProductKeysFromRandom = ({
    productKeys = [],
    numberOfProductKeys = 10,
    returnList = false,
  }) => {
    // create product keys
    const data =
      productKeys.length > 0
        ? productKeys
        : Array.from(Array(numberOfProductKeys), (v, k) => randomProductKey());

    // create pseudo-documents
    const formattedData = data.map((key) => ({
      key: key,
      activationDate: randomDate(new Date(2022, 1, 1), new Date()),
      activated: Math.random() > 0.5,
      validityPeriod: randomNumber(1, 100) * 60, //in seconds
    }));

    if (returnList) {
      return [formattedData, data];
    }
    return formattedData;
  };

  const formatUsersFromRandom = ({
    roles,
    productKeys,
    numberOfKeysUnused = 2,
  }) => {
    if (numberOfKeysUnused < productKeys.length) {
      for (let i = 0; i < numberOfKeysUnused; i++) {
        const index = randomNumber(0, productKeys.length);
        productKeys.splice(index, 1);
      }
    }

    // create pseudo-documents
    const formattedData = productKeys.map((i, key) => ({
      username: `user ${i}`,
      email: `user${i}@test.com`,
      password: `passwordOfUser${i}`,
      productKey: key,
      roles: Array.from(
        Array(randomNumber(1, roles.length)),
        (v, k) => roles[randomNumber(0, roles.length - 1)]
      ),
    }));
    return formattedData;
  };

  const initDatabase = (
    method = "raw",
    {
      roleInput = "",
      productKeyInput = "",
      userInput = "",
      coerceRole = true, //false,
      dumpData = false,
      outputDir = "./../utils",
    }
  ) => {
    // prepare data to insert
    let data = {};
    switch (method) {
      case "raw":
        data = {
          roles: resolveInput(roleInput),
          productKeys: resolveInput(productKeyInput),
          users: resolveInput(userInput),
        };
      case "json":
        data = {
          roles: formatRolesFromJson(roleInput),
          productKeys: resolveInput(productKeyInput),
          users: resolveInput(userInput),
        };
        break;
      case "random":
        // random roles
        const { roles, defaultRoleName } = roleInput;
        const formattedRoles = formatRolesFromRandom({
          roles,
          defaultRoleName,
        });

        // random product keys
        const { productKeys, numberOfProductKeys } = productKeyInput;
        const [formattedProductKey, finalProductKeys] =
          formatProductKeysFromRandom({
            productKeys,
            numberOfProductKeys,
            returnList: true,
          });

        // random users
        const { numberOfKeysUnused } = userInput;
        const formattedUsers = formatUsersFromRandom({
          roles,
          finalProductKeys,
          numberOfKeysUnused,
        });
        data = {
          roles: formattedRoles,
          productKeys: formattedProductKey,
          users: formattedUsers,
        };
        break;

      default:
        throw new Error("Unknow method. Unable to continue.");
        break;
    }
    console.log("data prepared");

    // insert according to the method
    if (method === "raw") {
      Role.insertFromData(data.roles);
      ProductKey.insertFromData(data.productKeys);
      User.insertFromData(data.users);
    } else {
      Role.insertFromData(data.roles);
      ProductKey.insertFromData(data.productKeys);
      // depend on pkeys and roles
      const userData = formatUsersFromJson(data.users, coerceRole);
      User.insertFromData(userData);
    }

    // dump all the data ?
    if (dumpData) {
      Role.dumpData(outputDir);
      ProductKey.dumpData(outputDir);
      User.dumpData(outputDir);
    }
  };

  // create output
  const db = {
    mongoose: mongoose,
    conn: connection,
    User: User,
    ProductKey: ProductKey,
    Role: Role,
    config: config,
    addSuperAdminProductKey: addSuperAdminProductKey,
    initDatabase: initDatabase,
  };

  return db;
};

module.exports = { getDatabaseConnection };
