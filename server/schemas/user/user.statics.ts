import bcrypt from 'bcrypt';
import authConfig from '../../config/auth.config';
import { IUserDocument, IUserModel, ObjectOfFunctions } from './user.types';

async function findByEmail(this: IUserModel, email: string): Promise<IUserDocument | null> {
  try {
    return this.findOne({ email });
  } catch (error) {
    console.error("Couldn't find user by email");
    throw error;
  }
}

async function hashPassword(this: IUserModel, password: string): Promise<string> {
  try {
    return bcrypt.hash(password, authConfig.SALT_ROUNDS);
  } catch (error) {
    console.error("couldn't hash the password");
    throw error;
  }
}

const statics: ObjectOfFunctions = {
  findByEmail,
  hashPassword,
};
export default statics;
