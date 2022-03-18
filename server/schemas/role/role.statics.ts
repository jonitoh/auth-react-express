import { ObjectId } from 'mongoose';
import {
  IRoleDocument,
  IRoleModel,
  isLike,
  CheckRoleOptions,
  CheckRoleType,
  ObjectOfFunctions,
} from './role.types';

async function findByName(this: IRoleModel, name: string): Promise<IRoleDocument | null> {
  try {
    return this.findOne({ name });
  } catch (error) {
    console.error("Couldn't find role by name");
    throw error;
  }
}

async function updateDefaultValues(this: IRoleModel): Promise<void> {
  if (isLike(this.defaultRole)) {
    this.defaultRoleName = this.defaultRole.name;
    return;
  }
  if (!this.defaultRoleName) {
    throw new Error(
      `We can't update the default values with no references: name (${
        this.defaultRoleName as string
      }) and role such as { _id: ${(
        (this.defaultRole as IRoleDocument)._id as ObjectId
      ).toString()}, name: ${(this.defaultRole as IRoleDocument).name}}`
    );
  }
  const role = await this.findOne({ name: this.defaultRoleName as string });
  if (!role) {
    throw new Error(
      `We can't update the default values with no references: name (${
        this.defaultRoleName as string
      }) and a null role`
    );
  }
  this.defaultRole = role;
}

async function allRoles(this: IRoleModel): Promise<IRoleDocument[]> {
  try {
    return this.find({}, { _id: 1, name: 1 }).lean();
  } catch (error) {
    console.error('Error when retrieving all roles');
    throw error;
  }
}

// eslint-disable-next-line max-len
async function checkRole(
  this: IRoleModel,
  { id, name, forceRole = true }: CheckRoleOptions
): Promise<CheckRoleType> {
  // Check for the role and if it's okay add it to the new user
  let errorMsg = '';
  let role: IRoleDocument | undefined;

  try {
    const roles: IRoleDocument[] = await this.allRoles();
    // retrieve role doc from given id
    if (id) {
      role = roles.find((r: IRoleDocument) => (r._id as ObjectId).toString() === id.toString());
    }
    // retrieve role doc from given role name
    if (name && !role) {
      role = roles.find((r: IRoleDocument) => r.name === name);
    }
    // retrieve role from default role
    if (forceRole && !role) {
      console.info('No given role. Set to default.');
      role = roles.find((r: IRoleDocument) => r.name === this.defaultRole);
    }
  } catch (error: unknown) {
    errorMsg =
      error instanceof Error
        ? error.message
        : 'An unknown error has been caught when checking a potential role!!!';
  }
  return { isRoleFound: !!role, role, errorMsg };
}

const statics: ObjectOfFunctions = {
  findByName,
  updateDefaultValues,
  allRoles,
  checkRole,
};
export default statics;
