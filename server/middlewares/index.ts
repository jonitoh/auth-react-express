import verifyJwt from './jwt.middleware';
import verifyRoles from './auth.middleware';
import registerProductKey from './register-product-key.middleware';
import registerUser from './register-user.middleware';
import verifyCredentials from './credentials.middleware';
import handleLog from './log.middleware';
import handleError from './error.middleware';

export default {
  verifyRoles,
  verifyJwt,
  registerProductKey,
  registerUser,
  verifyCredentials,
  handleLog,
  handleError,
};
