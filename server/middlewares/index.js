const verifyJwt = require("./jwt.middleware");
const verifyRoles = require("./auth.middleware");
const registerProductKey = require("./register-product-key.middleware");
const registerUser = require("./register-user.middleware");
const verifyCredentials = require("./credentials.middleware");
const handleLog = require("./log.middleware");
const handleError = require("./error.middleware");

module.exports = {
  verifyRoles,
  verifyJwt,
  registerProductKey,
  registerUser,
  verifyCredentials,
  handleLog,
  handleError,
};
