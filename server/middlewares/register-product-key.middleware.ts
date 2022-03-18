import { Request, Response, NextFunction } from 'express';
import db from '../models';
import { HTTPError } from '../utils/error/http-error';
import { asyncMiddlewareHelper } from '../utils/express';
import { HTTP_STATUS_CODE } from '../utils/main';

const { ProductKey } = db;

async function checkDuplicateProductKey(req: Request, res: Response, next: NextFunction) {
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
        'ERROR_WHEN_CHECK_DUPLICATE_PRODUCT_KEY',
        errorMsg,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }

  if (isStored && storedProductKey) {
    return next(
      new HTTPError(
        'ERROR_WHEN_CHECK_DUPLICATE_PRODUCT_KEY',
        `Failed! Product key has already been added and activated since ${storedProductKey.activationDate.toDateString()}.`,
        HTTP_STATUS_CODE.UNAUTHORIZED,
        {}
      )
    );
  }
  return next();
}

export default {
  checkDuplicateProductKey: asyncMiddlewareHelper(checkDuplicateProductKey),
};
