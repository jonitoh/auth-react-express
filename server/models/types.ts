import { Connection, ObjectId } from 'mongoose';
import { DbConfig } from 'config/db.config';
import { IRole, IRoleModel } from 'schemas/role/role.types';
import { IUser, IUserDocument, IUserModel } from 'schemas/user/user.types';
import {
  IProductKey,
  IProductKeyDocument,
  IProductKeyModel,
} from 'schemas/product-key/product-key.types';

type AnyObject = Record<string, unknown>;
// ---- helpers ----
export type CheckProductKeyType = {
  isKeyInvalid: boolean;
  isStored: boolean;
  storedProductKey: IProductKeyDocument | null;
  isInUse: boolean;
  isInUseMsg: null | string;
  isLinkedToUser: boolean;
  linkedUser: IUserDocument | null;
  error: string;
};
export type IDatabaseConnectionHelper = {
  checkProductKey(productKey: string): Promise<CheckProductKeyType>;
};

// ---- initDatabase ----
// ** With Raw Method
export type InitDatabaseWithRawMethodOptions = {
  roleInput: string | Array<AnyObject> | AnyObject;
  productKeyInput: string | Array<AnyObject> | AnyObject;
  userInput: string | Array<AnyObject> | AnyObject;
};
export type RawMethodResolvedData = {
  roles: Array<IRole>;
  productKeys: Array<IProductKey>;
  users: Array<IUser>;
};
// type RawMethodData

// ** With Json Method (json has no ref nor _id)
// resolved data
export type RoleAsJson = {
  isDefault?: boolean | undefined;
  name: string;
};
export type UserAsJson = {
  productKey: string;
  role: string;
  password: string;
};
export type ProductKeyAsJson = Partial<IProductKey>;
export type JsonMethodResolvedData = {
  roles: Array<RoleAsJson>;
  productKeys: Array<ProductKeyAsJson>;
  users: Array<UserAsJson>;
};
// formatted data
export type RequiredRoleAsJson = Required<RoleAsJson>;
export type RequiredUserAsJson = {
  productKey: ObjectId | undefined;
  role: ObjectId | undefined;
  password: string;
};
export type RequiredProductKeyAsJson = ProductKeyAsJson;
export type JsonMethodData = {
  roles: Array<RequiredRoleAsJson>;
  productKeys: Array<RequiredProductKeyAsJson>;
  users: Array<UserAsJson>;
};
// overall
export type InitDatabaseWithJsonMethodOptions = {
  roleInput: string | Array<AnyObject> | AnyObject;
  productKeyInput: string | Array<AnyObject> | AnyObject;
  userInput: string | Array<AnyObject> | AnyObject;
  mustCoerceRole: boolean;
};

// ** With Random Method
// resolved data
export type RoleAsRandom = {
  name: string;
  level: number;
};
export type FormatRolesFromRandomOptions = {
  roles: Array<RoleAsRandom>;
  defaultRoleName: string;
};
export type FormatProductKeysFromRandomOptions = {
  productKeys?: Array<string>;
  numberOfProductKeys?: number;
};
export type FormatUsersFromRandomOptions = {
  numberOfKeysUnused?: number;
};
export type RandomMethodResolvedData = {
  roles: FormatRolesFromRandomOptions;
  productKeys: FormatProductKeysFromRandomOptions;
  users: FormatUsersFromRandomOptions;
};
// formatted data
export type RequiredRoleAsRandom = {
  name: string;
  level: number;
  isDefault: boolean;
};
export type RequiredProductKeyAsRandom = {
  key: string;
  activationDate: Date;
  activated: boolean;
  validityPeriod: number;
};
export type RequiredUserAsRandom = {
  username: string;
  email: string;
  password: string;
  productKey: string;
  role: string;
};
export type RandomMethodData = {
  roles: Array<RequiredRoleAsRandom>;
  productKeys: Array<RequiredProductKeyAsRandom>;
  users: Array<RequiredUserAsRandom>;
};
// overall
export type InitDatabaseWithRandomMethodOptions = InitDatabaseWithJsonMethodOptions;

// ** overall
// eslint-disable-next-line max-len
export type InitDatabaseOptions =
  | InitDatabaseWithRawMethodOptions
  | InitDatabaseWithJsonMethodOptions
  | InitDatabaseWithRandomMethodOptions;

// ---- dumpDatabase ----
export type DumpDatabaseOptions = {
  parentDir: string;
  outputDirName?: string | undefined;
  ignoreModels?: Array<string>;
  keepModels?: Array<string>;
};

// ---- addSuperAdminUser ----
export type AddSuperAdminUserOptions = {
  username: string | undefined;
  email: string;
  password: string;
  productKey: string | undefined;
  activationDate: Date | undefined;
  activated: boolean;
  validityPeriod: number; // in seconds
};

// ---- main export ----
export type DatabaseConnectionType = {
  initDatabase(method: string, options: InitDatabaseOptions): Promise<void>;
  dumpDatabase(options: DumpDatabaseOptions): Promise<void>;
  addSuperAdminUser(options: AddSuperAdminUserOptions): Promise<void>;
  config: DbConfig;
  conn: Connection;
  User: IUserModel;
  ProductKey: IProductKeyModel;
  Role: IRoleModel;
  helpers: IDatabaseConnectionHelper;
};
