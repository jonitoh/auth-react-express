const { Schema } = require("mongoose");
const { BaseSchemaClass } = require("../utils");

const productKeySchema = new Schema(
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
  // `findByKey` becomes a static
  static findByKey = async (key) => await this.findOne({ key });

  // `activate` becomes a document method
  activate = (activationDate = undefined) => {
    this.activationDate = activationDate || new Date();
    this.activated = true;
  };

  // `deactivate` becomes a document method
  deactivate = () => (this.activated = false);

  // `isValid` becomes a virtual
  get isValid() {
    return (
      (new Date().getTime() - this.activationDate.getTime()) / 1000 <
      this.validityPeriod
    );
  }

  // `checkDuplicate` becomes a static
  static checkDuplicate = (key) => {
    let isDuplicated = false;
    let duplicated;
    let errors;

    this.findOne({ key }, (err, pk) => {
      if (err) errors = err;
      isDuplicated = !!pk;
      duplicated = pk;
    });

    return { isDuplicated, duplicated, errors };
  };

  // for now it's a virtual
  get dumpFilename() {
    return `product-keys-${this.formatDate(new Date())}.json`;
  }
}

// `productKeySchema` will now have a getter ans setter as virtuals,  methods as methods and statics as statics
productKeySchema.loadClass(SchemaClass);

module.exports = productKeySchema;
