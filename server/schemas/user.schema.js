const { Schema } = require("mongoose");
const { BaseSchemaClass, capitalize, handleErrorForLog } = require("../utils");
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: false,
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
    activated: {
      type: Boolean,
      required: true,
      default: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
    },
    refreshToken: { type: String },
  },
  { collection: "user" },
  { timestamps: true } // createdAt & updatedAt
);

/*
const salt = bcrypt.genSaltSync(
  parseFloat(process.env.SALT_ROUNDS.toNumber) || 10
); // "$2b$10$zjTwStq0X8vcx1JXAHEUMe"
*/

class SchemaClass extends BaseSchemaClass {
  // `currentUsername`becomes a virtual
  get currentUsername() {
    return this.username || capitalize(this.email.split("@")[0]);
  }

  // `toResponseJson` becomes a document method
  toResponseJson(
    properties,
    removeSensitiveData = false,
    objectOptions = { versionKey: false }
  ) {
    const user = { ...this.toObject(objectOptions), ...properties };
    if (removeSensitiveData) {
      delete user.password;
      delete user.productKey;
      delete user.refreshToken;
    }
    // add other properties
    user.hasUsername = !!user.username;
    user.username = this.currentUsername;

    return user;
  }

  // TODO `decodePassword` becomes a document method

  // `checkPassword` becomes a document method
  async checkPassword(password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      handleErrorForLog(error, "Error during the check password process");
    }
  }

  // `findByEmail` becomes a static
  static async findByEmail(email) {
    try {
      return await this.findOne({ email });
    } catch (error) {
      handleErrorForLog(error, "couldn't find user by email");
    }
  }

  // `hashPassword` becomes a static
  static async hashPassword(password) {
    try {
      return await bcrypt.hash(
        password,
        parseFloat(process.env.SALT_ROUNDS) || "$2b$10$zjTwStq0X8vcx1JXAHEUMe"
      );
    } catch (error) {
      handleErrorForLog(error, "couldn't hash the password");
    }
  }
}

// `userSchema` will now have a getter ans setter as virtuals,  methods as methods and statics as statics
userSchema.loadClass(SchemaClass);

module.exports = userSchema;
