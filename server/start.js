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

  // Import database and check it's working
  const db = require("./models");
  console.log("check readyState", db.conn.readyState);

  // Populate database in development if necessary
  if (process.env.NODE_ENV && process.env.NODE_ENV === "development") {
    // main function
    console.log("generate data -- start");
    //const method = process.env.DATA_GENERATION_METHOD || "json";
    /* -- raw method -- *
    const method = "raw",
    const options = {
      roleInput:  "./../data/raw/roles.json",
      productKeyInput: "./../data/raw/product-keys.json",
      userInput: "./../data/raw/users.json",
      coerceRole: false,
      dumpData: false,
      outputDir: "./../temp",
    }*/
    /* -- json method -- /
    const method = "json",
    const options = {
      roleInput: "./../data/json/roles.json",
      productKeyInput: "./../data/json/product-keys.json",
      userInput: "./../data/json/users.json",
      coerceRole: true,
      dumpData: false,
      outputDir: "./../temp",
    }*/
    /* -- random method -- */
      const method = "random",
      const options = {
        roleInput: "./../data/random/roles.json",
        productKeyInput: "./../data/random/product-keys.json",
        userInput: "./../data/random/users.json",//{ numberOfKeysUnused: 3 }
        coerceRole: false,
        dumpData: true,
        outputDir: "./../temp",
    }
    db.initDatabase(method, options);
  }

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
      console.log(`Mongo uri at ${db.config.URI}`);
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
