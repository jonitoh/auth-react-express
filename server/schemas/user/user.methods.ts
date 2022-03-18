import bcrypt from 'bcrypt';
import {
  IUserDocument,
  ToObjectReturnType,
  ObjectOfFunctions,
  UserTypeForJson,
} from './user.types';

interface MyUserInterfaceForJson extends IUserDocument {
  hasUsername: boolean;
  username: string;
}

function toResponseJson<TNewProps>(
  this: IUserDocument,
  properties: TNewProps,
  willRemoveSensitiveData = false,
  objectOptions: Partial<ToObjectReturnType> = { versionKey: false }
): UserTypeForJson<MyUserInterfaceForJson, TNewProps> {
  // eslint-disable-next-line max-len
  let user: UserTypeForJson<MyUserInterfaceForJson, TNewProps> = {
    ...this.toObject(objectOptions),
    ...properties,
  };
  if (willRemoveSensitiveData) {
    delete user.password;
    delete user.productKey;
    delete user.refreshToken;
  }
  // add other properties
  user = { ...user, hasUsername: !!user.username, username: this.currentUsername };

  return user;
}

async function checkPassword(this: IUserDocument, password: string): Promise<boolean | undefined> {
  try {
    return bcrypt.compare(password, this.password);
  } catch (error) {
    console.error('Error during the check password process');
    throw error;
  }
}

const methods: ObjectOfFunctions = {
  toResponseJson,
  checkPassword,
};

export default methods;
