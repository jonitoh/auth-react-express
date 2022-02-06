/*const config = require("../config/auth.config");
const db = require("../models");
const { user: User, role: Role } = db;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ProductKey = require("../models/product-key.model");

// delete user
// modify user
// get info from us
// get info from any user
// get userstats
// get moderator stats
// get admin stats

const signup = (req, res) => {
  const { username, email, password, productKey, roles } = req.body;
  const user = new User({
    username,
    email,
    password: bcrypt.hashSync(password, 8),
  });
  user.save((err, user) => {
    // errors
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    // Product Key
    if (productKey) {
      ProductKey.findOne(
        {
          key: productKey,
        },
        (err, foundProductKey) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          user.productKey = foundProductKey._id;
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            // Roles
            if (roles) {
              Role.find(
                {
                  name: { $in: roles },
                },
                (err, foundRoles) => {
                  if (err) {
                    res.status(500).send({ message: err });
                    return;
                  }
                  user.roles = foundRoles.map((role) => role._id);
                  user.save((err) => {
                    if (err) {
                      res.status(500).send({ message: err });
                      return;
                    }
                    // Everything went well
                    res.send({ message: "User was registered successfully!" });
                  });
                }
              );
            } else {
              // Role by default
              Role.findOne({ name: "user" }, (err, foundRole) => {
                if (err) {
                  res.status(500).send({ message: err });
                  return;
                }
                user.roles = [foundRole._id];
                user.save((err) => {
                  if (err) {
                    res.status(500).send({ message: err });
                    return;
                  }
                  // Everything went well
                  res.send({ message: "User was registered successfully!" });
                });
              });
            }
          });
        }
      );
    } else {
      res.status(500).send({ message: "ProductKey missing" });
      return;
    }
    //
    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

const signinWithEmail = (req, res) => {
  const { email, password } = req.body;
  User.findOne({
    email: email,
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      // check password
      const passwordIsValid = bcrypt.compareSync(password, user.password);
      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }
      // retrieve token
      const token = jwt.sign({ id: user.id }, config.SECRET, {
        expiresIn: 86400, // 24 hours
      });
      const authorities = [];
      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token,
      });
    });
};

const signinWithProductKey = (req, res) => {
  ProductKey.findOne(
    {
      key: req.body.productKey,
    },
    (err, productKey) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      User.findOne({
        productKey: productKey.key,
      })
        .populate("roles", "-__v")
        .exec((err, user) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          if (!user) {
            return res.status(404).send({ message: "User Not found." });
          }

          const token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400, // 24 hours
          });
          const authorities = [];
          for (let i = 0; i < user.roles.length; i++) {
            authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
          }
          res.status(200).send({
            id: user._id,
            username: user.username,
            email: user.email,
            roles: authorities,
            accessToken: token,
          });
        });
    }
  );
};

const generateProductKey = (req, res) => {
  const { key, activationDate, activated, validityPeriod } = req.body;
  const productKey = new ProductKey({
    key,
    activationDate,
    activated,
    validityPeriod,
  });
  productKey.save((err, productKey) => {
    // errors
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    // It should not have the same Product Key stored
    if (key) {
      ProductKey.findOne(
        {
          key: key,
        },
        (err, foundProductKey) => {
          if (err) {
            // a new Product Key
            res.status(200).send({
              productKey: productKey.key,
              message: "Product Key was created and registered successfully!",
            });
            return;
          }
          // oops ! existing Product Key
          res.status(500).send({
            message: `This ProductKey already exist and it has been activated since ${foundProductKey.activationDate}.`,
          });
          return;
        }
      );
    } else {
      res.status(500).send({ message: "ProductKey missing" });
      return;
    }
  });
};
*/
const allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

const userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

const adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

const moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

module.exports = {
  allAccess,
  userBoard,
  adminBoard,
  moderatorBoard,
};