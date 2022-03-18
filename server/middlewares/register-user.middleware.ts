import { Request, Response, NextFunction } from 'express';
import db from '../models';
import { HTTPError } from '../utils/error/http-error';
import { asyncMiddlewareHelper } from '../utils/express';
import { HTTP_STATUS_CODE } from '../utils/main';

const { Role, User, ProductKey } = db;

// eslint-disable-next-line max-len
async function checkDuplicateWithUsernameOrEmail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { email, username }: Record<'email' | 'username', string> = req.body;
  let isUserExists = false;

  // check email
  if (email) {
    isUserExists = !!(await User.exists({ email }));
  }

  // check username
  if (!isUserExists && username) {
    isUserExists = !!(await User.exists({ username }));
  }

  if (isUserExists) {
    return next(
      new HTTPError(
        'ERROR_WHEN_CHECK_USER',
        `The given credentials are already used.`,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }
  // go back to business
  next();
}

// eslint-disable-next-line max-len
async function checkProductKeyStored(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { productKey }: { productKey: string } = req.body;
  const { isKeyInvalid, isStored, storedProductKey, errorMsg } = await ProductKey.checkIfStored(
    productKey
  );

  if (isKeyInvalid) {
    return next(
      new HTTPError(
        'INVALID_PRODUCT_KEY',
        `The format of the product key is invalid.`,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }

  if (errorMsg) {
    return next(
      new HTTPError(
        'ERROR_WHEN_CHECK_PRODUCT_KEY_IF_STORED',
        errorMsg,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }

  if (!isStored) {
    return next(
      new HTTPError(
        'UNKNOWN_PRODUCT_KEY',
        `The given product key is unknown.`,
        HTTP_STATUS_CODE.UNAUTHORIZED,
        {}
      )
    );
  }

  if (storedProductKey) {
    req.checks = { ...req.checks, productKeyDoc: storedProductKey };
    return next();
  }
  // then (storedProductKey === null)
  next(
    new HTTPError(
      'ERROR_WHEN_CHECK_PRODUCT_KEY_IF_STORED',
      "storedProductKey is null when it's not supposed to.",
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}
    )
  );
}

type InfoFromBody = { roleName: string; roleId: string; forceRole: boolean | undefined };

async function checkRoleExists(req: Request, res: Response, next: NextFunction): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { roleName, roleId, forceRole }: InfoFromBody = req.body;
  // --- Check for the role and if it's okay add it to the new user
  const { isRoleFound, role, errorMsg } = await Role.checkRole({
    id: roleId,
    name: roleName,
    forceRole,
  });

  if (errorMsg) {
    return next(
      new HTTPError('ERROR_WHEN_CHECK_ROLE', errorMsg, HTTP_STATUS_CODE.UNAUTHORIZED, {})
    );
  }

  if (!isRoleFound) {
    return next(
      new HTTPError(
        'NO_ROLE_FOUND',
        `The given role doesn't seem to exist.`,
        HTTP_STATUS_CODE.UNAUTHORIZED,
        {}
      )
    );
  }

  if (role) {
    req.checks = { ...req.checks, roleDoc: role };
    return next();
  }

  // then (role === undefined)
  next(
    new HTTPError(
      'ERROR_WHEN_CHECK_ROLE',
      "role is undefined when it's not supposed to.",
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}
    )
  );
}

export default {
  checkDuplicateWithUsernameOrEmail: asyncMiddlewareHelper(checkDuplicateWithUsernameOrEmail),
  checkProductKeyStored: asyncMiddlewareHelper(checkProductKeyStored),
  checkRoleExists: asyncMiddlewareHelper(checkRoleExists),
};
