const { User, Role, ProductKey } = require("../models");

const deleteUser = (req, res) => {
  User.findOneAndDelete({ _id: req.body.id }, (err) => {
    if (err) res.status(500).send({ message: err });
    console.log("Successful deletion of a user");
    res.status(200);
  });
};

const getInfo = (req, res) => {
  const user = User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) res.status(500).send({ message: err });
  });
  res.status(200).send({
    user: user,
  });
};

const getAllInfo = (req, res) => {
  const users = User.find({}, (err, users) => {
    if (err) console.log(err);
    console.log(`${users.length} user info found`);
  });
  res.status(200).send({
    users: users,
  });
};

const modifyUser = (req, res) => {
  const { id, username, email, password, productKey, roles } = req.body;
  const update = { username, email };
  User.findOneAndUpdate({ _id: id }, update, null, (err, updatedUser) => {
    if (err) console.log(err);
    // update password
    if (password) {
      const isSamePassword = updatedUser.checkPassword(password);
      if (isSamePassword) {
        console.log("it's the same password");
      } else {
        updatedUser.password = User.hashPassword(password);
      }
    }

    // update product key
    if (productKey) {
      const { isDuplicated, duplicateProductKey, errors } =
        ProductKey.checkDuplicate(productKey);
      if (errors) console.log(errors);
      if (!isDuplicated) {
        res.status(500).send({ message: "Unknown product key" });
      } else {
        updatedUser.productKey = duplicateProductKey._id;
      }
    }

    // update roles
    if (roles) {
      const allRoles = Role.allRoles();
      const lastRoles = updatedUser.roles;
      //const errorMsgs = [];
      for (let index = 0; index < roles.length; index++) {
        // role as a name
        const role = roles[index];
        // role exists ?
        const foundRole = allRoles.find(({ name }) => role === name);
        if (foundRole) {
          if (lastRoles.includes(foundRole._id)) {
            lastRoles.push(foundRole._id);
          }
        } else {
          console.push(`The following role is not present: ${role}.`);
        }
      }
      updatedUser.roles = lastRoles;
    }

    res.status(200);
  });
};

/* --- Fake stuff --- */
const getAllAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

const getUserStats = (req, res) => {
  res.status(200).send("User Content.");
};

const getAdminStats = (req, res) => {
  res.status(200).send("Admin Content.");
};

const getModeratorStats = (req, res) => {
  res.status(200).send("Moderator Content.");
};

module.exports = {
  deleteUser,
  getInfo,
  getAllInfo,
  modifyUser,
  getAllAccess,
  getUserStats,
  getAdminStats,
  getModeratorStats,
};
