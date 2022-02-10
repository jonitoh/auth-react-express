const { Schema } = require("mongoose");
const { insertFromData, dumpData } = require("../utils");
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: false,
      default: "unknown user",
    },
    email: {
      type: String,
      required: true,
      unique: true,
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
);

class SchemaClass {
  // `checkPassword` becomes a document method
  checkPassword = (password) => bcrypt.compareSync(password, this.password);

  // `findByEmail` becomes a static
  static findByEmail = (email) => this.findOne({ email });

  // `hashPassword` becomes a static
  static hashPassword = (password) => bcrypt.hashSync(password, 8);

  // `insertFromData` becomes a static
  static insertFromData = (data, cb = undefined) =>
    insertFromData(data, this, cb);

  // `dumpData` becomes a static
  static dumpData = (outputDir, filename, cb = undefined) =>
    dumpData(
      this,
      outputDir,
      !!filename ? filename : `users-${new Date()}.json`
    );
}

// `userSchema` will now have a getter ans setter as virtuals,  methods as methods and statics as statics
userSchema.loadClass(SchemaClass);

module.exports = userSchema;
