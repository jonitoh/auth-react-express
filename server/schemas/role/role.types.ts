import { Model, Document, SchemaTimestampsConfig, ObjectId } from 'mongoose';
import { BaseSchemaClass, ObjectOfFunctions as GenericObjectOfFunctions } from '../../utils/model';
import { isLike as GenericIsLike } from '../../utils/main';

export interface RoleLike {
  name: string;
  _id: ObjectId | string;
}
const ROLE_PROPS: Array<keyof RoleLike> = ['name', '_id'];

export function isLike(role: unknown): role is RoleLike {
  return GenericIsLike<RoleLike>(role, ROLE_PROPS);
}

export interface IRole {
  name: string;
  isDefault: boolean;
  readOwn: boolean;
  readOther: boolean;
  modifyOwn: boolean;
  modifyOther: boolean;
  deleteOwn: boolean;
  deleteOther: boolean;
  level: number;
  // new virtuals added here
  _defaultRole?: RoleLike | IRoleDocument;
  _defaultRoleName?: string;
  defaultRole?: RoleLike | IRoleDocument;
  defaultRoleName?: string;
}

export type CheckRoleOptions = {
  id: string | ObjectId;
  name: string;
  forceRole?: boolean;
};

export type CheckRoleType = {
  isRoleFound: boolean;
  role: IRoleDocument | undefined;
  errorMsg: string;
};

export interface IRoleDocument extends IRole, Document, SchemaTimestampsConfig {
  // new methods added here
  higherThan(this: IRoleDocument, number: number): boolean;
}

export interface IRoleModel extends Model<IRoleDocument>, BaseSchemaClass {
  // new statics added here
  findByName(this: IRoleModel, name: string): Promise<IRoleDocument | null>;
  updateDefaultValues(this: IRoleModel): Promise<void>;
  allRoles(this: IRoleModel): Promise<IRoleDocument[]>;
  checkRole(this: IRoleModel, options: CheckRoleOptions): Promise<CheckRoleType>;
}

export type ObjectOfFunctions = GenericObjectOfFunctions<IRoleDocument, IRoleModel>;
