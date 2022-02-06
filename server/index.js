const express = require("express");
const bodyParser = require("body-parser");
const router = require("./routes");

/*
const createToken = (payload, jwtSecret, expiresIn = "2h") =>
  jwt.sign(payload, jwtSecret, { expiresIn });
*/

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = require("./models");
const dbConfig = require("./config/db.config");

const initiateRolesinDB = () => {
  db.role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      db.ROLES.forEach((role) => {
        new Role({
          name: role,
        }).save((err) => {
          if (err) {
            console.log("error", err);
          }
          console.log(`added '${role}' to roles collection`);
        });
      });
    }
  });
};

const addSuperAdminProductKeyinDB = () => {
  const key = process.env.SUPER_ADMIN_PRODUCT_KEY || undefined;
  const productKey = new db.productKey({
    key: key,
    activationDate: new Date(),
    activated: true,
    validityPeriod: 1000000000000,
  });
  productKey.save((err, _) => {
    // errors
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    // It should not have the same Product Key stored
    if (key) {
      db.productKey.findOne(
        {
          key: key,
        },
        (err, foundProductKey) => {
          if (err) {
            // a new Product Key
            console.log(
              "Super admin product Key was created and registered successfully!"
            );
          }
          // oops ! existing Product Key
          console.log(
            `Super admin product has already been added and activated since ${foundProductKey.activationDate}.`
          );
        }
      );
    } else {
      console.log("ProductKey missing");
    }
  });
};

// db connection
db.mongoose
  .connect(dbConfig.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //useFindAndModify: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initiateRolesinDB();
    addSuperAdminProductKeyinDB();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

// routes
app.use("/api", router);

// serve the react app files
//app.use(express.static(`${__dirname}/client/build`));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Mongo uri at ${mongo_uri}`);
  console.log(`Example app listening at http://localhost:${port}`);
});
