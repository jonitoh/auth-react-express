const { Schema } = require("mongoose");
const { BaseSchemaClass } = require("../utils");
const bcrypt = require("bcrypt");

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
  { timestamps: true } // createdAt & updatedAt
);

class SchemaClass extends BaseSchemaClass {
  // `salt` becomes a virtual
  get salt() {
    if (!this._salt) {
      bcrypt.genSalt(process.env.SALT_ROUNDS || 10, function (err, salt) {
        if (err) throw new Error(`error during genSalt:\n${err}`);
        this._salt = salt;
      });
    }
    return this._salt;
  }

  // `checkPassword` becomes a document method
  async checkPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // `findByEmail` becomes a static
  static async findByEmail(email) {
    return await this.findOne({ email });
  }

  // `hashPassword` becomes a static
  static async hashPassword(password) {
    return await bcrypt.hash(password, this.salt);
  }
}

// `userSchema` will now have a getter ans setter as virtuals,  methods as methods and statics as statics
userSchema.loadClass(SchemaClass);

module.exports = userSchema;
