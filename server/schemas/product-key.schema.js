const { Schema } = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { BaseSchemaClass, handleErrorForLog } = require("../utils/main");

const randomProductKey = () => uuidv4();

const productKeySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        this.generateKey();
      }, //randomProductKey,
      immutable: true,
    },
    activationDate: {
      type: Date,
      required: true,
      default: Date.now,
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
  { collection: "productkey" },
  { timestamps: true } // createdAt & updatedAt
);

class SchemaClass extends BaseSchemaClass {
  // `generateKey` becomes a static
  static generateKey() {
    return randomProductKey();
  }

  // `hasWrongFormat` becomes a static
  static hasWrongFormat(key) {
    return key === null || key === undefined;
  }

  // `findByKey` becomes a static
  static async findByKey(key) {
    try {
      return await this.findOne({ key });
    } catch (error) {
      handleErrorForLog(error, "couldn't find product key by key");
    }
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

  // `isInUse` becomes a document method
  isInUse() {
    const isActivated = this.activated;
    const isValid = this.isValid;
    const isInUse = isActivated && isValid;
    let message;
    if (!isActivated) {
      message = "DEACTIVATED_PRODUCT_KEY";
    }
    if (!isValid) {
      message = "NON_VALID_PRODUCT_KEY";
    }

    if (!isActivated && !isValid) {
      message = "DEACTIVATED_PRODUCT_KEY || NON_VALID_PRODUCT_KEY";
    }

    return [isInUse, message];
  }

  // `isValid` becomes a virtual
  get isValid() {
    return (
      (new Date().getTime() - this.activationDate.getTime()) / 1000 <
      this.validityPeriod
    );
  }

  // `checkIfStored` becomes a static
  static async checkIfStored(key) {
    let errorMsg = null;
    let storedProductKey = null;
    let isStored = false;
    const isKeyInvalid = this.hasWrongFormat(key);

    if (isKeyInvalid) {
      return { isKeyInvalid, isStored, storedProductKey, errorMsg };
    }

    try {
      storedProductKey = await this.findOne({ key });
      isStored = !!storedProductKey;
    } catch (error) {
      errorMsg = error.message;
    }
    return { isKeyInvalid, isStored, storedProductKey, errorMsg };
  }
}

// `productKeySchema` will now have a getter ans setter as virtuals,  methods as methods and statics as statics
productKeySchema.loadClass(SchemaClass);

module.exports = productKeySchema;
