const mongoose = require("mongoose");
const {
  resolveInput,
  randomNumber,
  randomDate,
  resolvePath,
  formatDate,
  CustomError,
  handleErrorForLog,
} = require("../utils/main");
const path = require("path");
const fs = require("fs");

const getDatabaseConnection = () => {
  // import config
  const dbConfig = require("../config/db.config");

  // global configuration
  //mongoose.ObjectId.get((v) => v.toString());

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

  // create helper function based on models
  const checkProductKey = async (productKey) => {
    // init variables
    let isKeyInvalid = false;
    let isStored = false;
    let storedProductKey = null;
    let isInUse = true;
    let isInUseMsg;
    let isLinkedToUser = false;
    let linkedUser = null;
    let error = new CustomError();
    try {
      // is productKey already stored
      const ifStoredProductKey = await ProductKey.checkIfStored(productKey);
      isStored = ifStoredProductKey.isStored;
      storedProductKey = ifStoredProductKey.storedProductKey;
      isKeyInvalid = ifStoredProductKey.isKeyInvalid;
      error.add(ifStoredProductKey.errorMsg);

      if (isStored) {
        // check if the product key is in use: activated and still valid
        [isInUse, isInUseMsg] = storedProductKey.isInUse();

        // check if the productKey is used by a user
        linkedUser = await User.find({ productKey: storedProductKey._id });
      }
    } catch (err) {
      error.add(err);
    }
    return {
      isKeyInvalid,
      isStored,
      storedProductKey,
      isInUse,
      isInUseMsg,
      isLinkedToUser,
      linkedUser,
      error: error.message,
    };
  };

  const helpers = {
    checkProductKey,
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
    Role.defaultRoleName = defaultRole.name;

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
      const { _id } = await ProductKey.findOne({ key }).select("_id").lean();
      return _id;
    };

    const mapToRoleId = async (name) => {
      const { _id } = await Role.findOne({ name }).select("_id").lean();
      return _id;
    };

    const formattedData = [];

    for (let index = 0; index < data.length; index++) {
      //console.log("--------index", index);
      const { productKey, role, password, ...rest } = data[index];

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
          password: await User.hashPassword(password),
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
    Role.defaultRoleName = defaultRoleName;

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
    }

    try {
      console.log("initDatabase -- insertion ");
      if (method === "raw") {
        const roles = await Role.insertFromData(data.roles);
        await Role.updateDefaultValues();
        const productKeys = await ProductKey.insertFromData(data.productKeys);
        const users = await User.insertFromData(data.users);

        const inventaire = {
          roles: roles?.length ? roles.length : 0,
          productKeys: productKeys?.length ? productKeys.length : 0,
          users: users?.length ? users.length : 0,
        };
        console.log("number of inserted documents", inventaire);
      } else {
        const roles = await Role.insertFromData(data.roles);
        await Role.updateDefaultValues();
        const productKeys = await ProductKey.insertFromData(data.productKeys);
        const userData = await formatUsersFromJson(data.users, coerceRole);
        const users = await User.insertFromData(userData);

        const inventaire = {
          roles: roles?.length ? roles.length : 0,
          productKeys: productKeys?.length ? productKeys.length : 0,
          users: users?.length ? users.length : 0,
        };
        console.log("number of inserted documents", inventaire);
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
      console.log(
        `folder already exists ? ${pth ? `true at ${pth}` : "false"}`
      );
    });

    // create dump files
    for (let index = 0; index < availableModels.length; index++) {
      const modelName = availableModels[index];
      const model = connection.models[modelName];
      const filename = path.join(absoluteOutputDir, `${modelName}.json`);
      try {
        console.log(`Dump file at ${filename} from model ${modelName}`);
        await model.dumpData({ filename });
      } catch (error) {
        throw new Error(error.toString());
      }
    }

    // end
    console.log("dumpDatabase -- end");
  };

  const addSuperAdminUser = async ({
    username = undefined,
    email,
    password,
    productKey = undefined,
    activationDate = undefined,
    activated = true,
    validityPeriod = 24 * 30 * 24 * 60 * 60, // in seconds aka 2 years
  }) => {
    try {
      let productKeyDoc;
      let roleDoc;

      // -- retrieve productKeyDoc
      const {
        isKeyInvalid,
        isStored,
        storedProductKey,
        isInUse,
        isLinkedToUser,
        linkedUser,
        error,
      } = await checkProductKey(productKey);
      console.log("checkpk", {
        isKeyInvalid,
        isStored,
        storedProductKey,
        isInUse,
        isLinkedToUser,
        linkedUser,
        error,
      });

      // we need a new key
      if (isKeyInvalid || !productKey || !isStored) {
        console.log("new pkey to add");
        // new key to add
        const newProductKey = new ProductKey({
          key: isKeyInvalid ? undefined : productKey,
          activationDate,
          activated,
          validityPeriod,
        });
        productKeyDoc = await newProductKey.save();
      }
      // we have a key attached to no one
      if (isStored) {
        console.log("is the key attached to a user");
        if (error) {
          return handleErrorForLog(error);
        }

        if (isLinkedToUser) {
          const isSamePassword = await linkedUser.checkPassword(password);
          // CHECK IF SAME USER
          if (isSamePassword && linkedUser.email === email) {
            console.log("Super admin already registered");
            if (!isInUse) {
              storedProductKey.activate(activationDate);
              await storedProductKey.save();
            }
          }
          return handleErrorForLog(
            "REGISTERED_PRODUCT_KEY_TO_ANOTHER_USER",
            res,
            500
          );
        }
        productKeyDoc = storedProductKey;
      }
      console.log("@@ final pkdoc", productKeyDoc?._id);

      // -- retrieve roleDoc
      [roleDoc] = await Role.find(
        {},
        { _id: 1, name: 1 },
        { limit: 1, sort: { level: -1 } }
      ).lean();

      if (!roleDoc) {
        return handleErrorForLog("UNFOUND_HIGHEST_ROLE");
      }
      console.log("@@ final roledoc", roleDoc._id);

      // -- create user
      const user = new User({
        username,
        email,
        password: await User.hashPassword(password),
        productKey: productKeyDoc._id,
        role: roleDoc._id,
      });

      const userDoc = await user.save();

      if (!userDoc) {
        return handleErrorForLog("NEW_USER_NOT_CREATED");
      }
      console.log("@@ final userdoc", userDoc._id);
      return;
    } catch (error) {
      return handleErrorForLog(error);
    }
  };

  // create output
  const db = {
    mongoose,
    config: dbConfig,
    conn: connection,
    User,
    ProductKey,
    Role,
    helpers,
    addSuperAdminUser,
    initDatabase,
    dumpDatabase,
  };

  return db;
};

module.exports = { getDatabaseConnection };
