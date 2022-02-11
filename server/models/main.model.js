const mongoose = require("mongoose");
const {
  resolveInput,
  randomProductKey,
  randomNumber,
  randomDate,
  resolvePath,
  formatDate,
} = require("./../utils");
const path = require("path");
const fs = require("fs");

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
  console.log("main model -- readyState", connection.readyState);

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
    "productkey",
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

  const formatUsersFromJson = async (input, coerceRole) => {
    // import users
    const data = resolveInput(input);

    // helpers
    const mapToProductKeyId = async (key) => {
      const pk = await ProductKey.findOne({ key });
      return pk ? pk._id : undefined;
    };

    const mapToRoleId = async (name) => {
      const role = await Role.findOne({ name });
      return role ? role._id : undefined;
    };

    const formattedData = [];

    for (let index = 0; index < data.length; index++) {
      const { productKey, roles, ...rest } = data[index];

      let formattedProductKey = await mapToProductKeyId(productKey);

      let formattedRoles = [];
      for (let idx = 0; idx < roles.length; idx++) {
        formattedRoles.push(await mapToRoleId(roles[idx]));
      }
      formattedRoles = formattedRoles.filter((role) => !!role);

      let hasInconsistentProductKey = !formattedProductKey;
      let hasInconsistentRole = formattedRoles.length === 0;

      // handle inconsistency
      if (hasInconsistentProductKey) {
        console.log("inconsistency on the product key.");
      }
      if (hasInconsistentRole) {
        if (coerceRole) {
          formattedRoles = [Role.defaultRole._id];
          hasInconsistentRole = false;
          console.log(
            "inconsistency on the role being corrected with the default value."
          );
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
      `${data.length - formattedData.length} users removed from inconsitency`
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
    const formattedData = productKeys.map((key, idx) => ({
      username: `user ${idx}`,
      email: `user${idx}@test.com`,
      password: `passwordOfUser${idx}`,
      productKey: key,
      roles: Array.from(
        Array(randomNumber(1, roles.length)),
        (v, k) => roles[randomNumber(0, roles.length - 1)]
      ),
    }));
    return formattedData;
  };

  const dumpDatabase = async ({
    parentDir = "./tmp",
    outputDirName = undefined,
    ignoreModels = [],
    keepModels = [],
  }) => {
    console.log("dumpDatabase -- init ");
    // find list of models to dump
    let availableModels = Object.keys(connection.models);
    if (keepModels.length > 0) {
      availableModels = availableModels.filter((model) =>
        keepModels.includes(model)
      );
    }
    if (ignoreModels.length > 0) {
      availableModels = availableModels.filter(
        (model) => !ignoreModels.includes(model)
      );
    }
    if (availableModels.length === 0) {
      throw new Error(
        "No more available models after filtering with keepModels and ignoreModels options!"
      );
    }

    // find absolute directory path
    const absoluteOutputDir = path.join(
      resolvePath(parentDir),
      outputDirName || `dump-${formatDate(new Date())}`
    );
    console.log("absoluteOutputDir", absoluteOutputDir);

    // create directory if necessary
    fs.mkdir(absoluteOutputDir, { recursive: true }, async (err, pth) => {
      if (err) console.log("err on fullpathdir", err);

      for (let index = 0; index < availableModels.length; index++) {
        //dumpData = async (outputDir)
        try {
          const modelName = availableModels[index];
          const model = connection.models[modelName];
          const filename = path.join(pth, `${modelName}.json`);
          const data = await model.find({});
          const jsonData = JSON.stringify(data);
          fs.writeFile(filename, jsonData, "utf-8", (err) => {
            if (err) console.log(err);
          });
        } catch (error) {
          throw new Error(error.toString());
        }
      }
    });
    console.log("dumpDatabase -- end");
  };

  const initDatabase = async (
    method = "raw",
    {
      roleInput = "",
      productKeyInput = "",
      userInput = "",
      coerceRole = true, //false,
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
        const { roles, defaultRoleName } = resolveInput(roleInput);
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
          productKeys: finalProductKeys,
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
    //console.log("Prepared data:", data);

    try {
      console.log("initDatabase -- insertion ");
      if (method === "raw") {
        const roles = await Role.insertMany(data.roles);
        console.log(
          roles instanceof Array
            ? `${roles.length} documents added to the role collection.`
            : "No roles added to the role collection"
        );

        const productKeys = await ProductKey.insertMany(data.productKeys);
        console.log(
          productKeys instanceof Array
            ? `${productKeys.length} documents added to the productkeys collection.`
            : "No document added to the collection productkeys"
        );

        const users = await User.insertMany(data.users);
        console.log(
          users instanceof Array
            ? `${users.length} documents added to the users collection.`
            : "No document added to the collection users"
        );
      } else {
        const roles = await Role.insertMany(data.roles);
        console.log(
          roles instanceof Array
            ? `${roles.length} documents added to the role collection.`
            : "No roles added to the role collection"
        );

        const productKeys = await ProductKey.insertMany(data.productKeys);
        console.log(
          productKeys instanceof Array
            ? `${productKeys.length} documents added to the productkeys collection.`
            : "No document added to the collection productkeys"
        );

        const userData = await formatUsersFromJson(data.users, coerceRole);
        const users = await User.insertMany(userData);
        console.log(
          users instanceof Array
            ? `${users.length} documents added to the users collection.`
            : "No document added to the collection users"
        );
      }
    } catch (error) {
      throw new Error(`error during the ingestion phase:\n${error}`);
    }
    console.log("initDatabase -- end");
  };

  // create output
  const db = {
    mongoose: mongoose,
    conn: connection,
    User: User,
    ProductKey: ProductKey,
    Role: Role,
    config,
    addSuperAdminProductKey: addSuperAdminProductKey,
    initDatabase: initDatabase,
    dumpDatabase: dumpDatabase,
  };

  return db;
};

module.exports = { getDatabaseConnection };
