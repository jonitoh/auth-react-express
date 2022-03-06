const { Role } = require("../models");
const { handleMessageForResponse } = require("../utils/main.js");

const hasRole = (roleName, include = true) => {
  const middleware = async (req, res, next) => {
    console.log("in hasRoles");
    let names = [];
    if (typeof roleName === "string") {
      names = [roleName];
    }
    if (roleName instanceof Array) {
      names = roleName;
    }
    // check if the role exists
    const allRoles = await Role.allRoles();
    const roles = allRoles
      .filter(({ name }) =>
        include ? names.includes(name) : !names.includes(name)
      )
      .map(({ _id }) => _id.toString());
    if (!roles.length) {
      return handleMessageForResponse("UNFOUND_ROLE", res, 500);
    }
    const { roleId } = req.checks;
    if (roles.includes(roleId)) {
      console.log("about to next from hasRole");
      return next();
    }
    return handleMessageForResponse("UNAUTHORIZED", res, 403);
  };
  return middleware;
};

const hasAtLeastLevel = (level) => {
  const middleware = async (req, res, next) => {
    console.log("in hasAtLeastLevel");
    const { roleId } = req.checks;

    const role = await Role.findById(roleId);

    if (!role) {
      return handleMessageForResponse("UNFOUND_ROLE", res, 500);
    }
    if (role.level >= level) {
      console.log("about to next from hasAtLeastLevel");
      return next();
    }
    return handleMessageForResponse("UNAUTHORISED", res, 403);
  };
  return middleware;
};

module.exports = {
  hasRole,
  hasAtLeastLevel,
};
