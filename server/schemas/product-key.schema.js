const { Schema } = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { BaseSchemaClass } = require("../utils");

const randomProductKey = () => uuidv4();

const productKeySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: randomProductKey,
    },
    activationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    activated: {
      type: Boolean,
      required: true,
      default: false,
    },
    validityPeriod: {
      type: Number,
      required: true,
      default: 60 * 60, // in seconds
    },
  },
  { timestamps: true } // createdAt & updatedAt
);

class SchemaClass extends BaseSchemaClass {
  // `generateKey` becomes a static
  static generateKey() {
    return randomProductKey();
  }

  // `findByKey` becomes a static
  static async findByKey(key) {
    return await this.findOne({ key });
  }

  // `activate` becomes a document method
  activate(activationDate = undefined) {
    this.activationDate = activationDate || Date.now();
    this.activated = true;
  }

  // `deactivate` becomes a document method
  deactivate() {
    this.activated = false;
  }

  // `isValid` becomes a virtual
  get isValid() {
    return (
      (Date.now().getTime() - this.activationDate.getTime()) / 1000 <
      this.validityPeriod
    );
  }

  // `checkDuplicate` becomes a static
  static checkDuplicate(key) {
    let isDuplicated = false;
    let duplicated;
    let errors;

    this.findOne({ key }, (err, pk) => {
      if (err) errors = err;
      isDuplicated = !!pk;
      duplicated = pk;
    });

    return { isDuplicated, duplicated, errors };
  }
}

// `productKeySchema` will now have a getter ans setter as virtuals,  methods as methods and statics as statics
productKeySchema.loadClass(SchemaClass);

module.exports = productKeySchema;
