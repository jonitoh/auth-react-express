const { Schema } = require("mongoose");
const { insertFromData, dumpData } = require("../utils");

const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  isDefault: {
    type: Boolean,
    required: true,
    default: false,
  },
});

class SchemaClass {
  // `defaultRole` becomes a virtual
  set defaultRole(role) {
    if (role instanceof String) {
      this._defaultRole = role;
    } else if (role instanceof this) {
      this._defaultRole = role.name;
    } else {
      throw new Error("Invalid format");
    }
  }

  // `defaultRole` becomes a virtual
  get defaultRole() {
    const role = this.findByName(this._defaultRole);
    return role;
  }

  // `findByName` becomes a static
  static findByName = (name) => this.findOne({ name });

  // `allRoles` becomes a static
  static allRoles = () =>
    this.find({}, { _id: 1, name: 1 }, (err, result) => {
      if (err) console.log(err);
    });

  // `insertFromData` becomes a static
  static insertFromData = (data, cb = undefined) =>
    insertFromData(data, this, cb);

  // `dumpData` becomes a static
  static dumpData = (outputDir, filename, cb = undefined) => {
    const filename = `roles-${new Date()}.json`;
    dumpData(this, outputDir, filename);
  };
}

// `roleSchema` will now have a getter ans setter as virtuals,  methods as methods and statics as statics
roleSchema.loadClass(SchemaClass);

module.exports = roleSchema;
