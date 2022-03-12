import { IUserDocument, ToObjectReturnType, ObjectOfFunctions, UserTypeForJson } from "./user.types";
import bcrypt from "bcrypt";

interface MyUserInterfaceForJson extends IUserDocument {
  hasUsername: boolean;
  username: string;
}

function toResponseJson<TNewProps>(
  this: IUserDocument,
  properties: TNewProps,
  removeSensitiveData: boolean = false,
  objectOptions: Partial<ToObjectReturnType> = { versionKey: false }
): UserTypeForJson<MyUserInterfaceForJson , TNewProps> {
  let user: UserTypeForJson<MyUserInterfaceForJson , TNewProps> = { ...this.toObject(objectOptions), ...properties };
  if (removeSensitiveData) {
    delete user.password;
    delete user.productKey;
    delete user.refreshToken;
  }
  // add other properties
  user = { ...user, hasUsername: !!user.username, username: this.currentUsername};

  return user;
}

// TODO decodePassword?

async function checkPassword(this: IUserDocument, password:string): Promise<boolean|undefined> {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error("Error during the check password process")
    throw error;
  }
}


const methods: ObjectOfFunctions = {
  toResponseJson,
  //decodePassword,
  checkPassword,
}

export default methods
