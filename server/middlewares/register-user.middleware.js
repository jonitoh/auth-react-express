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
          res.status(400).send({ message: "Failed! Email is already in use!" });
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
          res
            .status(400)
            .send({ message: "Failed! Username is already in use!" });
          return;
        }
      }
    );
  } else {
    // we have a problem
    res.status(500).send({
      message:
        "We can't check for duplicate user registration without username or email",
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
      message: `Unknown product key`,
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
        res
          .status(400)
          .send({ message: "Failed! ProductKey is already in use!" });
        return;
      }
      next();
    }
  );
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    const allRoles = Role.allRoles().map(({ name }) => name);
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!allRoles.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`,
        });
        return;
      }
    }
  }
  next();
};

module.exports = {
  checkDuplicateUsernameOrEmail,
  checkDuplicateProductKey,
  checkRolesExisted,
};
