const { User, ProductKey } = require("../models");

const deleteUser = (req, res) => {
  User.findOneAndDelete({ _id: req.body.id }, (err) => {
    if (err) res.status(500).send({ message: err });
    console.log("Successful deletion of a user");
    res.status(200);
  });
};

const getInfo = (req, res) => {
  User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    res.status(200).send({
      user: user,
    });
  });
};

const getAllInfo = (req, res) => {
  User.find({}, (err, users) => {
    if (err) console.log(err);
    if (!users) {
      res.status(400).send({ message: "UNFOUND_USERS" });
      return;
    }
    console.log(`${users.length} user info found`);
    res.status(200).send({
      users: users,
    });
  });
};

const modifyUser = async (req, res) => {
  const { id, username, email, password, productKey, role } = req.body;
  User.findOneAndUpdate(
    { _id: id },
    { username, email, role },
    null,
    async (err, user) => {
      if (err) console.log(err);
      // update password
      if (password) {
        const isSamePassword = await user.checkPassword(password);
        if (isSamePassword) {
          console.log("it's the same password");
        } else {
          user.password = await User.hashPassword(password);
        }
      }

      // update product key
      if (productKey) {
        const { isDuplicated, duplicateProductKey, errors } =
          ProductKey.checkDuplicate(productKey);
        if (errors) console.log(errors);
        if (!isDuplicated) {
          res.status(500).send({ message: "UNFOUND_PRODUCT_KEY" });
        } else {
          user.productKey = duplicateProductKey._id;
        }
      }
      res.status(200);
    }
  );
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
