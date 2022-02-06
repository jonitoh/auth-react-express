const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

module.exports = {
  mongoose: mongoose,
  User: require("./user.model"),
  ProductKey: require("./product-key.model"),
  Role: require("./role.model"),
  ROLES: ["user", "admin", "moderator"],
};
