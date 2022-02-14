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
  },
  { collection: "user" },
  { timestamps: true } // createdAt & updatedAt
);

class SchemaClass extends BaseSchemaClass {
  // `salt` becomes a virtual
  get salt() {
    return (async function () {
      if (!this._salt) {
        try {
          this._salt = await bcrypt.genSalt(process.env.SALT_ROUNDS || 10);
        } catch (error) {
          handleErrorForLog(
            error,
            "Error in setting salt paramater for password hashing process in User"
          );
        }
      }
      return this._salt;
    })();
  }

  // `currentUsername`becomes a virtual
  get currentUsername() {
    return this.username || capitalize(this.email.split("@")[0]);
  }

  // `toResponseJson` becomes a document method
  toResponseJson(
    properties,
    keepPassword = false,
    objectOptions = { versionKey: false }
  ) {
    const user = { ...this.toObject(objectOptions), ...properties };
    if (keepPassword) {
      delete user.password;
    }
    // add other properties
    user.hasUsername = !!user.username;
    user.username = this.currentUsername;

    return user;
  }

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
      return await bcrypt.hash(password, this.salt);
    } catch (error) {
      handleErrorForLog(error, "couldn't hash the password");
    }
  }
}

// `userSchema` will now have a getter ans setter as virtuals,  methods as methods and statics as statics
userSchema.loadClass(SchemaClass);

module.exports = userSchema;
