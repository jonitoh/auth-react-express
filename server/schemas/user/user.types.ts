import { Model, Document, SchemaTimestampsConfig, Types } from "mongoose";
import { BaseSchemaClass, ObjectOfFunctions as GenericObjectOfFunctions } from "../../utils/model";
import { IProductKeyDocument } from "schemas/product-key/product-key.types";
import { IRoleDocument } from "schemas/role/role.types";
//import { isLike as GenericIsLike } from "../../utils/main";

/*
export interface RoleLike { name: string, _id: ObjectId | string };
const ROLE_PROPS: Array<keyof RoleLike> = ["name", "_id"];

export function isLike(role:unknown): role is RoleLike {
  return GenericIsLike<RoleLike>(role, ROLE_PROPS);
}
*/

export interface IUser {
  username: string;
  email: string;
  password: string;
  productKey?: IProductKeyDocument["_id"];
  activated: boolean;
  role?: IRoleDocument["_id"];
  refreshToken?: string;
  // new virtuals added here
  currentUsername?: string;
}

export type ToObjectReturnType = ReturnType<IUserDocument['toObject']>;

type UserInterfaceForJson<TInterface> = TInterface extends IUserDocument ? TInterface : never;

export type UserTypeForJson<TInterface, PropertiesType> = Partial<UserInterfaceForJson<TInterface> & PropertiesType>

// Looking into mongoose's type definitions, passing Types.ObjectId to Document should specify 
// type of _id.
export interface IUserDocument extends IUser, Document<Types.ObjectId>, SchemaTimestampsConfig {
  // new methods added here
  toResponseJson<TNewProps, INewInterface>(
    this: IUserDocument,
    properties: TNewProps,
    removeSensitiveData: boolean,
    objectOptions: Partial<ToObjectReturnType>
  ): UserTypeForJson<INewInterface , TNewProps>;
  // TODO decodePassword?
  checkPassword(this: IUserDocument, password:string): Promise<boolean|undefined>;
}
  
export interface IUserModel extends Model<IUserDocument>, BaseSchemaClass {
  // new statics added here
  findByEmail(
    this: IUserModel,
    email: string,
  ): Promise<IUserDocument|null>;
  hashPassword(this: IUserModel, password:string): Promise<string>;
}

export type ObjectOfFunctions = GenericObjectOfFunctions<IUserDocument, IUserModel>



