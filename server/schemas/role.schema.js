const { Schema } = require("mongoose");
const { BaseSchemaClass, handleErrorForLog } = require("../utils");

const roleSchema = new Schema(
  {
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
    readOwn: {
      type: Boolean,
      default: false,
    },
    readOther: {
      type: Boolean,
      required: true,
      default: false,
    },
    modifyOwn: {
      type: Boolean,
      default: false,
    },
    modifyOther: {
      type: Boolean,
      required: true,
      default: false,
    },
    deleteOwn: {
      type: Boolean,
      default: false,
    },
    deleteOther: {
      type: Boolean,
      required: true,
      default: false,
    },
    level: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { collection: "role" }
);

class SchemaClass extends BaseSchemaClass {
  // `defaultRole` becomes a virtual
  set defaultRole(role) {
    if (role instanceof String) {
      this._defaultRoleName = role;
      this._defaultRole = null;
      return;
    }

    if (role instanceof this) {
      this._defaultRoleName = role.name;
      this._defaultRole = role;
      return;
    }

    throw new Error("Invalid format given to set defaultRole.");
  }

  // `defaultRoleName` becomes a virtual
  get defaultRoleName() {
    if (!!this._defaultRoleName === false) {
      throw new Error("no role set up yet");
    }
    return this._defaultRoleName;
  }

  // `defaultRole` becomes a virtual -- async getter: cf. https://medium.com/trabe/async-getters-and-setters-is-it-possible-c18759b6f7e4
  get defaultRole() {
    return (async function () {
      if (!!this._defaultRole === false) {
        try {
          console.log("We need to retrieve the role as a document first");
          this._defaultRole = await this.findOne({
            name: this._defaultRoleName,
          }).lean();
        } catch (error) {
          handleErrorForLog(
            error,
            "Error in setting defaultRole attribute from Role"
          );
        }
      }
      return this._defaultRole;
    })();
  }

  // `findByName` becomes a static
  static async findByName(name) {
    try {
      return await this.findOne({ name });
    } catch (error) {
      handleErrorForLog(error, "couldn't find role by name");
    }
  }

  // `allRoles` becomes a static
  static async allRoles() {
    try {
      return await this.find({}, { _id: 1, name: 1 }).lean();
    } catch (error) {
      handleErrorForLog(error, "Error when retrieving all roles");
    }
  }

  //
  static async checkRole({ id, name, forceRole = true }) {
    // --- Check for the role and if it's okay add it to the new user
    let roleId;
    let roleName;
    let error;
    let role;

    try {
      const allRoles = await this.allRoles();

      // retrieve role doc from given id
      if (id) {
        role = allRoles.find(({ _id }) => _id === id);
      }

      // retrieve role doc from given role name
      if (name && !role) {
        role = allRoles.find((r) => r.name === name);
      }

      // retrieve role from default role
      if (forceRole && !role) {
        console.log("No given role. Set to default.");
        role = allRoles.find(({ name }) => name === this.defaultRole);
      }

      // retrieve info from role
      if (role) {
        roleId = role._id;
        roleName = role.name;
      }
    } catch (err) {
      error = err.message;
    }

    return { isRoleFound: !!role, id: roleId, name: roleName, error };
  }

  // `higherThan` becomes a method
  higherThan(number) {
    return this.level >= number;
  }
}

// `roleSchema` will now have a getter ans setter as virtuals,  methods as methods and statics as statics
roleSchema.loadClass(SchemaClass);

module.exports = roleSchema;
