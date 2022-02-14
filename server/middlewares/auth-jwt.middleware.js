const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config.js");
const { User, Role } = require("../models");
const { handleMessageForResponse } = require("../utils.js");

const authentificateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return handleMessageForResponse("NO_TOKEN_PROVIDED", res, 403);
  }
  jwt.verify(token, authConfig.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return handleMessageForResponse("UNAUTHORIZED", res, 401);
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
    }
    if (roleName instanceof Array) {
      names = roleName;
    }

    // check if the role exists
    const roles = await Role.allRoles()
      .filter(({ name }) => names.includes(name))
      .map(({ _id }) => _id);

    if (!roles.length) {
      return handleMessageForResponse("UNFOUND_ROLE", res, 500);
    }

    let roleId;
    if (req.roleId) {
      roleId = req.roleId;
    }

    if (req.userId) {
      const user = await User.findById(req.userId);

      if (!user) {
        return handleMessageForResponse("UNFOUND_USER", res, 500);
      }
      roleId = user.role;
    }

    if (roles.includes(roleId)) {
      return next();
    }
    return handleMessageForResponse("ROLE_REQUIRED", res, 403);
  };
  return middleware;
};

const hasAtLeastLevel = (level) => {
  const middleware = async (req, res, next) => {
    let roleId;
    if (req.roleId) {
      roleId = req.roleId;
    }

    if (req.userId) {
      const user = User.findById(req.userId);
      if (!user) {
        return handleMessageForResponse("UNFOUND_USER", res, 500);
      }
      roleId = user.role;
    }

    const role = await Role.allRoles().find((role) => role._id === roleId);

    if (!role) {
      return handleMessageForResponse("UNFOUND_ROLE", res, 500);
    }
    if (role.level >= level) {
      return next();
    }
    return handleMessageForResponse("UNAUTHORISED", res, 403);
  };
  return middleware;
};

module.exports = {
  authentificateToken,
  hasRole,
  hasAtLeastLevel,
};
