import { Model, Document, SchemaTimestampsConfig, ObjectId } from 'mongoose';
import { BaseSchemaClass, ObjectOfFunctions as GenericObjectOfFunctions } from '../../utils/model';
// import { isLike as GenericIsLike } from "../../utils/main";

export interface ProductKeyLike {
  key: string;
  _id: ObjectId | string;
}
/*
const PRODUCT_KEYS_PROPS: Array<keyof ProductKeyLike> = ["key", "_id"];
export function isLike(pk:unknown): pk is ProductKeyLike {
  return GenericIsLike<ProductKeyLike>(pk, PRODUCT_KEYS_PROPS);
}
*/

export interface IProductKey {
  key: string;
  activationDate: Date;
  activated: boolean;
  validityPeriod: number; // in seconds
  // new virtuals added here
  isValid: boolean;
}

export type CheckIfStoredType = {
  isKeyInvalid: boolean;
  isStored: boolean;
  storedProductKey: IProductKeyDocument | null;
  errorMsg: string | null;
};

export interface IProductKeyDocument extends IProductKey, Document, SchemaTimestampsConfig {
  // new methods added here
  activate(this: IProductKeyDocument, activationDate: Date | undefined): void;
  deactivate(this: IProductKeyDocument): void;
  isInUse(this: IProductKeyDocument): [boolean, string | null];
}

export interface IProductKeyModel extends Model<IProductKeyDocument>, BaseSchemaClass {
  // new statics added here
  generateKey(this: IProductKeyModel): string;
  hasWrongFormat(key: unknown): boolean;
  findByKey(this: IProductKeyModel, key: string): Promise<IProductKeyDocument | null>;
  checkIfStored(this: IProductKeyModel, key: string | undefined): Promise<CheckIfStoredType>;
}

export type ObjectOfFunctions = GenericObjectOfFunctions<IProductKeyDocument, IProductKeyModel>;
