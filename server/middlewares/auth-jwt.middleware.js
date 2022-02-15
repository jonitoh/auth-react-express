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
    req.checks = {
      ...req.checks,
      userId: decoded.id,
      roleId: decoded.role,
    };
    next();
  });
};

const hasRole = (roleName, include = true) => {
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
      .filter(({ name }) =>
        include ? names.includes(name) : !names.includes(name)
      )
      .map(({ _id }) => _id);

    if (!roles.length) {
      return handleMessageForResponse("UNFOUND_ROLE", res, 500);
    }

    const { roleId } = req.checks;

    if (roles.includes(roleId)) {
      return next();
    }
    return handleMessageForResponse("UNAUTHORIZED", res, 403);
  };
  return middleware;
};

const hasAtLeastLevel = (level) => {
  const middleware = async (req, res, next) => {
    const { roleId } = req.checks;

    const role = await Role.findById(roleId);

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
