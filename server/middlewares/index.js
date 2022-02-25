const verifyJwt = require("./jwt.middleware");
const verifyRoles = require("./auth.middleware");
const registerProductKey = require("./register-product-key.middleware");
const registerUser = require("./register-user.middleware");
const verifyCredentials = require("./credentials.middleware");
const handleLogAndError = require("./log-and-error.middleware");

module.exports = {
  verifyRoles,
  verifyJwt,
  registerProductKey,
  registerUser,
  verifyCredentials,
  handleLogAndError,
};
