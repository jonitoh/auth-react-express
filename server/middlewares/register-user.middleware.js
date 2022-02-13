const { Role, User } = require("../models");

checkDuplicateUsernameOrEmail = (req, res, next) => {
  if (req.body.email) {
    // check email
    User.findOne(
      {
        email: req.body.email,
      },
      (err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        if (user) {
          res.status(400).send({ message: "USED_EMAIL" });
          return;
        }
      }
    );
  } else if (req.body.username) {
    // check username
    User.findOne(
      {
        username: req.body.username,
      },
      (err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        if (user) {
          res.status(400).send({ message: "USED_USERNAME" });
          return;
        }
      }
    );
  } else {
    // we have a problem
    res.status(500).send({
      message: "UNFOUND_USERNAME_OR_EMAIL",
    });
    return;
  }
  // go back to business
  next();
};

checkDuplicateProductKey = (req, res, next) => {
  // check if the key is already here
  const { isDuplicated, duplicateProductKey, errors } =
    ProductKey.checkDuplicate(req.body.productKey);

  // show potential errors
  if (errors) {
    res.status(500).send({ message: errors });
    return;
  }

  // check if the key is already stored
  if (!isDuplicated) {
    res.status(500).send({
      message: "UNKNOWN_PRODUCT_KEY",
    });
    return;
  }

  User.findOne(
    {
      productKey: duplicateProductKey._id,
    },
    (err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (user) {
        res.status(400).send({ message: "USED_PRODUCT_KEY" });
        return;
      }
      next();
    }
  );
};

checkRoleExisted = (req, res, next) => {
  if (req.body.role) {
    const allRoles = Role.allRoles().map(({ name }) => name);
    if (!allRoles.includes(req.body.role)) {
      res.status(400).send({
        message: "UNKNOWN_ROLE",
      });
      return;
    }
  }
  next();
};

module.exports = {
  checkDuplicateUsernameOrEmail,
  checkDuplicateProductKey,
  checkRoleExisted,
};
