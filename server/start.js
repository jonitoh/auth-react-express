const express = require("express"); // Import express framework
const bodyParser = require("body-parser");
const { getRoutes } = require("./routes");

// thx https://github.com/kentcdodds/express-app-example
const setupCloseOnExit = (server) => {
  // thank you stack overflow
  // https://stackoverflow.com/a/14032965/971592
  const exitHandler = async (options = {}) => {
    await server
      .close()
      .then(() => {
        logger.info("Server successfully closed");
      })
      .catch((e) => {
        logger.warn("Something went wrong closing the server", e.stack);
      });
    // eslint-disable-next-line no-process-exit
    if (options.exit) process.exit();
  };

  // do something when app is closing
  process.on("exit", exitHandler);

  // catches ctrl+c event
  process.on("SIGINT", exitHandler.bind(null, { exit: true }));

  // catches "kill pid" (for example: nodemon restart)
  process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
  process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));

  // catches uncaught exceptions
  process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
};

const startServer = (port = process.env.PORT || 4000) => {
  // Initiate express app
  const app = express();

  // Implement middleware;
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // being able to serve static files
  app.use("/public", express.static("public"));

  // Implement routes
  app.use("/", getRoutes());

  // Set up the database
  const db = require("./models");
  const dbConfig = require("./config/db.config");

  const initiateRolesinDB = () => {
    db.Role.estimatedDocumentCount((err, count) => {
      if (!err && count === 0) {
        for (let i = 0; i < db.ROLES.length; i++) {
          const name = db.ROLES[i];
          const role = new db.Role({
            name: name,
          });
          role.save((err, savedRole) => {
            if (err) console.log(err);
            console.log(`added '${savedRole.name}' to roles collection`);
          });
        }
      }
    });
  };

  const addSuperAdminProductKeyInDB = () => {
    const key = process.env.SUPER_ADMIN_PRODUCT_KEY || undefined;
    // check if there is a key
    if (!key) {
      console.log("The product key is missing");
      return;
    }
    // check if the key is already stored
    db.ProductKey.find(
      {
        key: key,
      },
      { _id: 1, activationDate: 1 },
      { sort: { activationDate: -1 } },
      (err, result) => {
        // show potential errors
        if (err) console.log(err);
        // new key to add
        if (result.length === 0) {
          const productKey = new db.ProductKey({
            key: key,
            activationDate: new Date(),
            activated: true,
            validityPeriod: 1 * 30 * 24 * 60 * 60, // in seconds aka 1 month
          });

          productKey.save((err, savedProductKey) => {
            // show potential errors
            if (err) console.log(err);
            console.log(
              "Super admin product Key was created and registered successfully!"
            );
          });
        } else {
          if (result.length > 1) {
            // it should not be possible
            console.log(
              "There is an inconsistency in the product key collection. You should resolve this later."
            );
          }
          const foundProductKey = result[0];
          console.log(
            `Super admin product key has already been added and activated since ${foundProductKey.activationDate}.`
          );
        }
      }
    );
  };

  const __generateRolesMap = async () => {
    console.log("generateRolesMap -- start");
    const result = await db.Role.find();
    console.log("result", result);
    const rolesMap = result.map(({ _id, name }) => ({ _id, name }));
    console.log("Available roles", rolesMap);
    console.log("generateRolesMap -- finish");
    return rolesMap;
  };

  const generateRolesMap = async () => {
    console.log("generateRolesMap -- start");
    const rolesMap = await db.Role.find(
      {},
      { _id: 1, name: 1 },
      (err, result) => {
        if (err) console.log(err);
        console.log("generateRolesMap -- in find", result);
      }
    ); /*.exec((err, result) => {
      if (err) return console.log(err);
      console.log("generateRolesMap -- in exec", result);
      return result;
    });*/
    console.log("generateRolesMap -- finish", rolesMap);
    return rolesMap;
  };

  const _initiateRolesinDB = (db) => {
    db.Role.estimatedDocumentCount((err, count) => {
      if (!err && count === 0) {
        for (let i = 0; i < db.ROLES.length; i++) {
          const name = db.ROLES[i];
          const role = new db.Role({
            name: name,
          });
          role.save((err, savedRole) => {
            if (err) console.log(err);
            console.log(`added '${savedRole.name}' to roles collection`);
          });
        }
      }
    });
  };

  // db connection
  const connection = db.mongoose.createConnection(dbConfig.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //useFindAndModify: true,
    family: 4, // Use IPv4, skip trying IPv6
    maxPoolSize: 5,
  });
  /*
    .asPromise()
    .then((dbase) => {
      console.log("what is this?", dbase.models);
      //initiateRolesinDB();
      console.log("well");
    })*/
  /*
    .then(() => {
      // ready to use. The `mongoose.connect()` promise resolves to mongoose instance.
      console.log("Successfully connect to MongoDB.");
      initiateRolesinDB();
      console.log("Successfully initiate roles.");
      addSuperAdminProductKeyInDB();
      console.log("Successfully add super admin product key.");

      // Populate database in development if necessary
      if (process.env.NODE_ENV && process.env.NODE_ENV === "development") {
        console.log("generate data -- start");
        const { generateData } = require("./data/generate-data");
        const rolesMap = generateRolesMap().then((value) => value);
        console.log("gen data rolesMap", rolesMap);
        generateData(db, process.env.DATA_GENERATION_METHOD || "json", {
          rolesMap: rolesMap,
          coerceRole: true, //false,
          outputDir: "",
        });
        console.log("generate data -- finish");
      }
    })*/
  /*
    .catch((err) => {
      console.error("Connection error", err);
      process.exit();
    });*/

  console.log("readyState", connection.readyState);

  /*
  // Populate database in development if necessary
  if (process.env.NODE_ENV && process.env.NODE_ENV === "development") {
    console.log("generate data -- start");
    const { generateData } = require("./data/generate-data");
    const rolesMap = generateRolesMap();
    console.log("gen data rolesMap", rolesMap);
    generateData(db, process.env.DATA_GENERATION_METHOD || "json", {
      rolesMap: rolesMap,
      coerceRole: true, //false,
      outputDir: "",
    });
    console.log("generate data -- finish");
  }*/

  //const connection = db.mongoose.Connection;

  /*  connection.on("open", () => {
    console.log("Database opened");
  });

  connection.on("close", () => {
    console.log("Database closed");
  });
  /*
      db.mongoose
    .connect(dbConfig.URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      //useFindAndModify: true,
      family: 4, // Use IPv4, skip trying IPv6
    })
    .then(() => {
      console.log("Successfully connect to MongoDB.");
      initiateRolesinDB();
    })
    .then(() => {
      console.log("Successfully initiate roles.");
      addSuperAdminProductKeyInDB();
      console.log("Successfully add super admin product key.");
    })
    .then(() => {
      console.log("node env?", process.env.NODE_ENV);
      if (process.env.NODE_ENV && process.env.NODE_ENV === "development") {
        console.log("generate data -- start");
        const { generateData } = require("./data/generate-data");
        generateData(db, process.env.DATA_GENERATION_METHOD || "json", {
          rolesMap: generateRolesMap(),
          coerceRole: true, //false,
          outputDir: "",
        });
        console.log("generate data -- finish");
      }
    })
    .catch((err) => {
      console.error("Connection error", err);
      process.exit();
    });
    */

  // for development and avoid CORS stuff
  if (process.env.NODE_ENV && process.env.NODE_ENV !== "development") {
    app.get("*", (req, res) => {
      res.sendFile("build/index.html", { root: __dirname });
    });
  }

  // HELLO WORLD ROUTE
  app.get("/hello-world", (req, res) => {
    res.send({ express: "YOUR EXPRESS BACKEND IS ALIVE" });
  });

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.info(`Listening on port ${server.address().port}`);
      console.log(`Mongo uri at ${dbConfig.URI}`);
      const originalClose = server.close.bind(server);
      server.close = () => {
        return new Promise((resolveClose) => {
          originalClose(resolveClose);
        });
      };
      setupCloseOnExit(server);
      resolve(server);
    });
  });
};

module.exports = { startServer };
