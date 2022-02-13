const mongoose = require("mongoose");
const {
  resolveInput,
  randomNumber,
  randomDate,
  resolvePath,
  formatDate,
} = require("./../utils");
const path = require("path");
const fs = require("fs");

const getDatabaseConnection = () => {
  // import config
  const dbConfig = require("../config/db.config");

  // create connection
  const connection = mongoose.createConnection(dbConfig.URI, {
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

  const addSuperAdminUser = async ({
    username = undefined,
    email,
    password,
    productKey = undefined,
    activationDate = new Date(),
    activated = true,
    validityPeriod = 24 * 30 * 24 * 60 * 60, // in seconds aka 2 years
  }) => {
    // --- Product Key process
    let productKeyId;

    if (productKey) {
      // check if the key is already here
      const { isDuplicated, duplicateProductKey, errors } =
        ProductKey.checkDuplicate(productKey);

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
        // check if a user is attached to it

        User.find({ key: duplicateProductKey._id }, (err, users) => {
          if (err) console.log(err);
          if (users) {
            throw new Error(
              "This product key is alredy use. You can't use it "
            );
          } else {
            productKeyId = duplicateProductKey._id;
          }
        });
      }
    }
    if (!productKeyId) {
      // new key to add
      const newProductKey = new ProductKey({
        key: productKey,
        activationDate,
        activated,
        validityPeriod,
      });
      try {
        const pk = await newProductKey.save();
        productKeyId = pk._id;
      } catch (error) {
        throw new Error(`error on creation of Product Key:\n${err}`);
      }
    }
    // --- Role process
    let roleId;

    // retrieve highest role
    Role.find(
      {},
      { _id: 1, name: 1 },
      { limit: 1, sort: { level: -1 } },
      (err, highestRole) => {
        if (err) console.log(err);
        if (!highestRole)
          throw new Error("No highest role found, check the database");
        roleId = highestRole._id;
      }
    );

    // --- User process
    const user = new User({
      username,
      email,
      password: await User.hashPassword(password),
      productKey: productKeyId,
      role: roleId,
    });
    user.save((err, user) => {
      console.log("try there");
      if (err) console.log(err);
      if (!user) throw new Error("Problem during the creation of the user");
    });
    console.log("super admin created with the following id", user._id);
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
      //const all = await ProductKey.find({});
      //console.log("allPK", all.length ? all.length : 0);
      const pk = await ProductKey.findOne({ key });
      //console.log("mapped pk", pk ? pk._id : undefined);
      return pk ? pk._id : undefined;
    };

    const mapToRoleId = async (name) => {
      //const all = await Role.find({});
      //console.log("allR", all.length ? all.length : 0);
      const role = await Role.findOne({ name });
      //console.log("mapped role", role ? role._id : undefined);
      return role ? role._id : undefined;
    };

    const formattedData = [];

    for (let index = 0; index < data.length; index++) {
      console.log("--------index", index);
      const { productKey, role, ...rest } = data[index];

      //console.log("productKey", productKey);
      //console.log("role", role);
      const formattedProductKey = await mapToProductKeyId(productKey);
      let formattedRole = await mapToRoleId(role);

      //console.log("formattedProductKey", formattedProductKey);
      //console.log("formattedRole", formattedRole);

      let hasInconsistentProductKey = !formattedProductKey;
      let hasInconsistentRole = !formattedRole;

      // handle inconsistency
      if (hasInconsistentProductKey) {
        console.log("inconsistency on the product key.");
      }
      if (hasInconsistentRole) {
        if (coerceRole) {
          formattedRole = Role.defaultRole._id;
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
          role: formattedRole,
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
    roles = [
      { name: "invited", level: 0 },
      { name: "basic", level: 1 },
      { name: "admin", level: 10 },
      { name: "moderator", level: 5 },
    ],
    defaultRoleName = "invited",
  }) => {
    // import roles
    const data = roles.map((role) => ({
      ...role,
      isDefault: role.name === defaultRoleName,
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
        : Array.from(Array(numberOfProductKeys), (v, k) =>
            ProductKey.generateKey()
          );

    // create pseudo-documents
    const formattedData = data.map((key) => ({
      key,
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
      role: roles[randomNumber(0, roles.length - 1)].name,
    }));
    return formattedData;
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
        console.log("--data raw", data);
      case "json":
        data = {
          roles: formatRolesFromJson(roleInput),
          productKeys: resolveInput(productKeyInput),
          users: resolveInput(userInput),
        };
        console.log("--data json", data);
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

    try {
      console.log("initDatabase -- insertion ");
      if (method === "raw") {
        Role.insertFromData(data.roles);
        ProductKey.insertFromData(data.productKeys);
        User.insertFromData(data.users);
      } else {
        // TODO: bad idea how to have something not nested
        Role.insertFromData(data.roles, (err, docs) => {
          console.log("err role insert", err);
          console.log("docs role insert", docs.length ? docs.length : 0);

          ProductKey.insertFromData(data.productKeys, async (err, docs) => {
            console.log("err pk insert", err);
            console.log("docs pk insert", docs.length ? docs.length : 0);

            console.log("data.users[0]", data.users[0]);
            const userData = await formatUsersFromJson(data.users, coerceRole);
            console.log("userdata", userData);
            User.insertFromData(userData, (err, docs) => {
              console.log("err user insert", err);
              console.log("docs user insert", docs.length ? docs.length : 0);
            });
          });
        });
      }
    } catch (error) {
      throw new Error(`error during the ingestion phase:\n${error}`);
    }
    console.log("initDatabase -- end");
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
        const modelName = availableModels[index];
        const model = connection.models[modelName];
        const filename = path.join(pth, `${modelName}.json`);
        try {
          await model.dumpData({ filename });
        } catch (error) {
          throw new Error(error.toString());
        }
      }
    });
    console.log("dumpDatabase -- end");
  };

  // create output
  const db = {
    mongoose: mongoose,
    conn: connection,
    User: User,
    ProductKey: ProductKey,
    Role: Role,
    config: dbConfig,
    addSuperAdminUser: addSuperAdminUser,
    initDatabase: initDatabase,
    dumpDatabase: dumpDatabase,
  };

  return db;
};

module.exports = { getDatabaseConnection };
