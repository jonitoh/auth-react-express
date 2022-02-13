const express = require("express"); // Import express framework
const { getRoutes } = require("./routes");
const { resolveInput } = require("./utils");

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

const startServer = async (port = process.env.PORT || 4000) => {
  // Initiate express app
  const app = express();

  // Implement middleware;
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // being able to serve static files
  app.use("/public", express.static("public"));

  // Implement routes
  app.use("/", getRoutes());

  // Import database and check it's working
  const { db } = require("./models");
  app.db = db;
  console.log("check readyState", app.db.conn.readyState);

  // Populate database if necessary
  const populateDatabase =
    process.env.DB_POPULATE_DATABASE &&
    process.env.DB_POPULATE_DATABASE === "true";
  if (populateDatabase) {
    console.log("let's populate database");
    //const method = process.env.DATA_GENERATION_METHOD || "json";
    /* -- raw method -- *
    const method = "raw";
    const populateDbOptions = {
      roleInput:  process.env.DB_GENERATION_OPTIONS_ROLE || "./data/raw/roles.json",
      productKeyInput: process.env.DB_GENERATION_OPTIONS_PRODUCTKEY || "./data/raw/product-keys.json",
      userInput: process.env.DB_GENERATION_OPTIONS_USER || "./data/raw/users.json",
      coerceRole: false,
    }*/
    /* -- json method -- /
    const method = "json";
    const populateDbOptions = {
      roleInput: process.env.DB_GENERATION_OPTIONS_ROLE || "./data/json/roles.json",
      productKeyInput: process.env.DB_GENERATION_OPTIONS_PRODUCTKEY || "./data/json/product-keys.json",
      userInput: process.env.DB_GENERATION_OPTIONS_USER || "./data/json/users.json",
      coerceRole: true,
    }*/
    /* -- random method -- */
    const method = "random";
    const populateDbOptions = {
      roleInput:
        process.env.DB_GENERATION_OPTIONS_ROLE || "./data/random/roles.json",
      productKeyInput:
        process.env.DB_GENERATION_OPTIONS_PRODUCTKEY ||
        "./data/random/product-keys.json",
      userInput:
        process.env.DB_GENERATION_OPTIONS_USER || "./data/random/users.json", //{ numberOfKeysUnused: 3 }
      coerceRole: true, //false,
    };
    console.log("chosen method:", method);
    console.log("chosen options:", populateDbOptions);
    await app.db.initDatabase(method, populateDbOptions);
  }

  // Make a dump of the database at the start of the app if necessary
  const dumpDatabaseAtOpen =
    process.env.DB_DUMP_AT_OPEN && process.env.DB_DUMP_AT_OPEN === "true";
  if (dumpDatabaseAtOpen) {
    console.log("dump database at open -- start");
    const dumpDbOptions = {
      parentDir: "./temp",
      //outputDirName: "my-little-dump",
    };
    console.log("dump database at open -- options", dumpDbOptions);
    await app.db.dumpDatabase(dumpDbOptions);
    console.log("populate database -- end");
  }

  // Add super admin product key
  if (process.env.SUPER_ADMIN_INFO && false) {
    const adminOptions = resolveInput(process.env.SUPER_ADMIN_INFO);
    console.log(adminOptions);
    app.db.addSuperAdminUser(adminOptions);
  }

  if (process.env.NODE_ENV && process.env.NODE_ENV !== "development") {
    // for development and avoid CORS stuff
    app.get("*", (req, res) => {
      res.sendFile("build/index.html", { root: __dirname });
    });

    // HELLO WORLD ROUTE
    app.get("/hello-world", (req, res) => {
      res.send({ express: "YOUR EXPRESS BACKEND IS ALIVE" });
    });
  }

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.info(`Listening on port ${server.address().port}`);
      console.log(`Mongo uri at ${app.db.config.URI}`);
      const originalClose = server.close.bind(server);
      server.close = () => {
        //dump database to see
        /*console.log(
          "Should we dump the database?",
          process.env.DB_DUMP_AT_CLOSE
        );*/
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
