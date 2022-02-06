const { model, Schema } = require("mongoose");

const ProductKey = model(
  "ProductKey",
  new Schema(
    {
      key: {
        type: String,
        required: true,
        unique: true,
      },

      activationDate: {
        type: Date,
        required: true,
        default: new Date(),
      },

      activated: {
        type: Boolean,
        required: true,
        default: true,
      },

      validityPeriod: {
        type: Number,
        required: true,
        default: 60 * 60, // in seconds
      },
    },
    { timestamps: true } // createdAt & updatedAt
  )
);

module.exports = ProductKey;
