const config = require("../config/auth.config");
const { User, Role, ProductKey } = require("../models");
const jwt = require("jsonwebtoken");

const signup = (req, res) => {
  const { username, email, password, productKey, roles } = req.body;
  const user = new User({
    username,
    email,
    password: User.hashPassword(password),
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
        }
      );
    } else {
      res.status(500).send({ message: "product key missing" });
      return;
    }
    // Roles
    if (roles) {
      const allRoles = Role.allRoles();
      const mappedRoles = [];
      const errorMsgs = [];
      for (let index = 0; index < roles.length; index++) {
        // role as a name
        const role = roles[index];
        // role exists ?
        const foundRole = allRoles.find(({ name }) => role === name);
        if (foundRole) {
          if (mappedRoles.includes(foundRole._id)) {
            mappedRoles.push(foundRole._id);
          }
        } else {
          errorMsgs.push(`The following role is not present: ${role}.`);
        }
      }
      if (mappedRoles.length === 0) {
        if (req.body.forceRole) {
          user.roles = [
            allRoles.find(({ name }) => name === Role.defaultRole)._id,
          ];
          console.log("No given role. Set to default.");
        } else {
          res.status(500).send({ message: errorMsgs.join(" || ") });
        }
      } else {
        user.roles = mappedRoles;
        res.send({ message: "User was registered successfully!" });
      }
    } else {
      if (req.body.forceRole) {
        user.roles = [
          allRoles.find(({ name }) => name === Role.defaultRole)._id,
        ];
        res.status(200).send({ message: "No given role. Set to default." });
      } else {
        res.status(500).send({ message: "No given role" });
      }
    }
  });
};

const signinWithEmail = async (req, res) => {
  const { email, password } = req.body;
  await User.findByEmail(email)
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      // check password -- TODO
      const isValidPassword = user.checkPassword(password);
      if (!isValidPassword) {
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
    async (err, productKey) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      await User.findOne({
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
    }
  );
};

module.exports = {
  signup,
  signinWithEmail,
  signinWithProductKey,
};
