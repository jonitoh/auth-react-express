const { model, Schema } = require("mongoose");

const Role = model(
  "Role",
  new Schema({
    name: {
      type: String,
      required: true,
      default: "user",
    },
  })
);

module.exports = Role;
