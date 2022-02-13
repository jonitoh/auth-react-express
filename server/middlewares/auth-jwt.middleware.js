const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config.js");
const { User, Role } = require("../models");

const authentificateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).send({ message: "NO_TOKEN_PROVIDED" });
  }
  jwt.verify(token, authConfig.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "UNAUTHORIZED" });
    }
    req.userId = decoded.id;
    req.roleId = decoded.role;
    next();
  });
};

const hasRole = (roleName) => {
  const middleware = async (req, res, next) => {
    let names = [];
    if (typeof roleName === "string") {
      names = [roleName];
    } else if (roleName instanceof Array) {
      names = roleName;
    }
    // check if the role exists
    const roles = Role.allRoles()
      .filter(({ name }) => names.includes(name))
      .map(({ _id }) => _id);
    if (!roles.length) {
      res.status(500).send({ message: "UNFOUND_ROLE" });
      return;
    }
    let roleId;
    if (req.roleId) {
      roleId = req.roleId;
    } else {
      User.findById(req.userId, (err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        roleId = user.role;
      });
    }
    if (roles.includes(roleId)) {
      next();
      return;
    } else {
      res.status(403).send({ message: "ROLE_REQUIRED" });
      return;
    }
  };
  return middleware;
};

const hasAtLeastLevel = (level) => {
  const middleware = async (req, res, next) => {
    let roleId;
    if (req.roleId) {
      roleId = req.roleId;
    } else {
      User.findById(req.userId, (err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        roleId = user.role;
      });
    }
    const role = Role.allRoles().find((role) => role._id === roleId);
    if (!role) {
      res.status(500).send({ message: "UNFOUND_ROLE" });
      return;
    } else if (role.level >= level) {
      next();
      return;
    } else {
      res.status(403).send({ message: "UNAUTHORISED" });
      return;
    }
  };
  return middleware;
};

module.exports = {
  authentificateToken,
  hasRole,
  hasAtLeastLevel,
};
