const { Schema } = require("mongoose");
const { BaseSchemaClass } = require("../utils");

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

class SchemaClass extends BaseSchemaClass {
  // `defaultRole` becomes a virtual
  set defaultRole(role) {
    if (role instanceof String) {
      this._defaultRoleName = role;
      this._defaultRole = null;
    } else if (role instanceof this) {
      this._defaultRoleName = role.name;
      this._defaultRole = role;
    } else {
      throw new Error("Invalid format");
    }
  }

  // `defaultRoleName` becomes a virtual
  get defaultRoleName() {
    if (!!this._defaultRoleName === false) {
      throw new Error("no role set up yet");
    }
    return this._defaultRoleName;
  }

  // `defaultRole` becomes a virtual
  get defaultRole() {
    if (!!this._defaultRole === false) {
      console.log("We need to retrieve the role as a document first");
      this.findOne({ name: this._defaultRoleName }, (err, role) => {
        if (err) console.log(err);
        this.defaultRole = role;
      });
    }
    return this._defaultRole;
  }

  // `findByName` becomes a static
  static findByName = async (name) => await this.findOne({ name });

  // `allRoles` becomes a static
  static allRoles = () =>
    this.find({}, { _id: 1, name: 1 }, (err, result) => {
      if (err) console.log(err);
    });

  // for now it's a virtual
  get dumpFilename() {
    return `roles-${this.formatDate(new Date())}.json`;
  }
}

// `roleSchema` will now have a getter ans setter as virtuals,  methods as methods and statics as statics
roleSchema.loadClass(SchemaClass);

module.exports = roleSchema;
