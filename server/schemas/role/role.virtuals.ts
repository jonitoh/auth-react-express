import { IRoleDocument, isLike, ObjectOfFunctions } from './role.types';

function setDefaultRole(this: IRoleDocument, role: unknown) {
  if (isLike(role)) {
    this._defaultRole = role;
    return;
  }
  throw new Error('Invalid format given to defaultRole.');
}

function getDefaultRole(this: IRoleDocument) {
  if (!this._defaultRole) {
    throw new Error('no role set up yet');
  }
  return this._defaultRole;
}

function setDefaultRoleName(this: IRoleDocument, role: unknown) {
  if (typeof role === 'string') {
    this._defaultRoleName = role;
    return;
  }
  if (isLike(role)) {
    this._defaultRoleName = role.name;
    return;
  }
  throw new Error('Invalid format given to defaultRoleName.');
}

function getDefaultRoleName(this: IRoleDocument) {
  if (!this._defaultRoleName) {
    throw new Error('no role name set up yet');
  }
  return this._defaultRoleName;
}

const virtuals: ObjectOfFunctions = {
  setDefaultRole,
  getDefaultRole,
  setDefaultRoleName,
  getDefaultRoleName,
};

export default virtuals;
