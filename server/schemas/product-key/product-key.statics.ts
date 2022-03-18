import { v4 as uuidv4 } from 'uuid';
import {
  IProductKeyDocument,
  IProductKeyModel,
  ObjectOfFunctions,
  CheckIfStoredType,
} from './product-key.types';

const randomProductKey = (): string => uuidv4();

function generateKey(this: IProductKeyModel): string {
  return randomProductKey();
}

function hasWrongFormat(key: unknown): boolean {
  return key === undefined || key === null;
}

async function findByKey(this: IProductKeyModel, key: string): Promise<IProductKeyDocument | null> {
  try {
    return this.findOne({ key });
  } catch (error) {
    console.error("Couldn't find product key by key");
    throw error;
  }
}

async function checkIfStored(
  this: IProductKeyModel,
  key: string | undefined
): Promise<CheckIfStoredType> {
  let errorMsg: string | null = null;
  let storedProductKey: IProductKeyDocument | null = null;
  let isStored = false;
  const isKeyInvalid: boolean = this.hasWrongFormat(key);
  if (isKeyInvalid) {
    return { isKeyInvalid, isStored, storedProductKey, errorMsg };
  }
  try {
    storedProductKey = await this.findOne({ key });
    isStored = !!storedProductKey;
  } catch (error) {
    errorMsg = error instanceof Error ? error.message : "We couldn't grab the error. Sorry.";
  }
  return { isKeyInvalid, isStored, storedProductKey, errorMsg };
}

const statics: ObjectOfFunctions = {
  generateKey,
  hasWrongFormat,
  findByKey,
  checkIfStored,
};
export default statics;
