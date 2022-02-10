const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const { User, Role } = require("../models");

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  jwt.verify(token, config.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};

hasRole = (role, req, res, next) => {
  // check if the role exists
  const verifiedRole = Role.findByName(role);
  if (verifiedRole) {
    res.status(500).send({ message: `${role} does not exist.` });
    return;
  }

  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (user.roles.includes(verifiedRole._id)) {
      next();
      return;
    } else {
      res.status(403).send({ message: `Require ${role.toUpperCase()} Role!` });
      return;
    }
  });
};

isAdmin = (req, res, next) => hasRole("admin", req, res, next);

isModerator = (req, res, next) => hasRole("moderator", req, res, next);

module.exports = {
  verifyToken,
  isAdmin,
  isModerator,
};
