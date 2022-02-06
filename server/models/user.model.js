const { model, Schema } = require("mongoose");

const User = model(
  "User",
  new Schema(
    {
      username: {
        type: String,
        required: false,
        default: "unknown user",
      },
      email: {
        type: String,
        required: true,
      },

      password: {
        type: String,
        required: true,
      },

      productKey: {
        type: Schema.Types.ObjectId,
        ref: "ProductKey",
      },

      roles: [
        {
          type: Schema.Types.ObjectId,
          ref: "Role",
        },
      ],
    },
    { timestamps: true } // createdAt & updatedAt
  )
);

module.exports = User;
