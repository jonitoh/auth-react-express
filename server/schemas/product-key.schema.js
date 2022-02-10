const { Schema } = require("mongoose");
const { insertFromData, dumpData } = require("../utils");

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

class SchemaClass {
  // `findByKey` becomes a static
  static findByKey = (key) => this.findOne({ key });

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

  // `insertFromData` becomes a static
  static insertFromData = (data, cb = undefined) =>
    insertFromData(data, this, cb);

  // `dumpData` becomes a static
  static dumpData = (outputDir, filename, cb = undefined) => {
    const filename = `product-keys-${new Date()}.json`;
    dumpData(this, outputDir, filename);
  };
}

// `productKeySchema` will now have a getter ans setter as virtuals,  methods as methods and statics as statics
productKeySchema.loadClass(SchemaClass);

module.exports = productKeySchema;
