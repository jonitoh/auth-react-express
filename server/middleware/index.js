const authJwt = require("./auth-jwt.middleware");
const registerProductKey = require("./register-product-key.middleware");
const registerUser = require("./register-user.middleware");

module.exports = {
  authJwt,
  registerProductKey,
  registerUser,
};
