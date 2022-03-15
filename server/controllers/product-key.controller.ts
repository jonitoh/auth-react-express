import { Request, Response, NextFunction } from 'express';
import db from 'models';
import { HTTPError } from 'utils/error/http-error';
import { asyncHelper } from 'utils/express';
import { HTTP_STATUS_CODE } from 'utils/main';

const {
  User,
  ProductKey,
  helpers: { checkProductKey },
} = db;

async function deleteProductKey(req: Request, res: Response, next: NextFunction) {
  const { productKey } = req.body;
  // --- Check for the product key
  const { isKeyInvalid, isStored, storedProductKey, isLinkedToUser, linkedUser, error } =
    await checkProductKey(productKey);

  if (isKeyInvalid) {
    return next(
      new HTTPError(
        'INVALID_FORMAT_FOR_PRODUCT_KEY',
        `Your product key has an invalid format.`,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }

  // send potential errors
  if (error) {
    return next(
      new HTTPError(
        'ERROR_WHEN_CHECK_PRODUCT_KEY',
        error,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }

  // product key not registered
  if (!isStored || !storedProductKey) {
    return next(
      new HTTPError(
        'UNFOUND_PRODUCT_KEY',
        `The given product key is unfound.`,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }

  // if linked to user, remove the key from that user
  if (linkedUser) {
    linkedUser.productKey = null;
    linkedUser.activated = false;
    await linkedUser.save();
  }

  // delete the Product Key
  await ProductKey.deleteOne({ _id: storedProductKey._id });
  return res.status(HTTP_STATUS_CODE.OK).send({
    message: isLinkedToUser
      ? `SUCCESSFUL_DELETION_OF_PRODUCT_KEY_LINKED_TO_USER_${linkedUser?._id}`
      : 'SUCCESSFUL_DELETION_OF_PRODUCT_KEY',
  });
}

async function addProductKeyToUser(req: Request, res: Response, next: NextFunction) {
  const { userId, productKey } = req.body;
  const {
    isKeyInvalid,
    isStored,
    storedProductKey,
    isInUse,
    isInUseMsg,
    isLinkedToUser,
    linkedUser,
    error,
  } = await checkProductKey(productKey);

  if (isKeyInvalid) {
    return next(
      new HTTPError(
        'INVALID_FORMAT_FOR_PRODUCT_KEY',
        `Your product key has an invalid format.`,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }

  // send potential errors
  if (error) {
    return next(
      new HTTPError(
        'ERROR_WHEN_CHECK_PRODUCT_KEY',
        error,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }

  // product key not registered
  if (!isStored || !storedProductKey) {
    return next(
      new HTTPError(
        'UNFOUND_PRODUCT_KEY',
        `The given product key is unfound.`,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }

  // product key not usable
  if (!isInUse) {
    return next(
      new HTTPError(
        'PRODUCT_KEY_NOT_LINKED',
        isInUseMsg || 'This product key is linked to no user',
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }

  // check if the key is not alreday linked to a user
  if (isLinkedToUser && linkedUser) {
    if (linkedUser._id !== userId) {
      return next(
        new HTTPError(
          'PRODUCT_KEY_ALREADY_LINKED_TO_ANOTHER_USER',
          'This product key is linked to another user',
          HTTP_STATUS_CODE.NOT_IMPLEMENTED,
          {}
        )
      );
    }
    console.info('product key linked to the given user');
  }

  // retrieve the wanted user
  const user = await User.findById(userId);

  if (!user) {
    return next(
      new HTTPError(
        'UNFOUND_USER',
        `We couldn't find the user to update.`,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }

  const formerProductKeyId = user.productKey;

  // if former Product Key, deactivate that key
  if (formerProductKeyId) {
    const formerProductKey = await ProductKey.findById(formerProductKeyId);
    if (formerProductKey) {
      formerProductKey.deactivate();
      await formerProductKey.save();
    }
  }

  // attach key to user
  user.productKey = storedProductKey._id;
  await user.save();

  // send response
  return res.status(HTTP_STATUS_CODE.OK).send({
    message: formerProductKeyId ? 'FORMER_PRODUCT_KEY_DEACTIVATED' : 'PRODUCT_KEY_ADDED_TO_USER',
  });
}

async function updateProductKey(req: Request, res: Response, next: NextFunction) {
  const { productKey, validityPeriod, activated, activationDate } = req.body;
  const { isKeyInvalid, isStored, storedProductKey, errorMsg } = await ProductKey.checkIfStored(
    productKey
  );

  if (isKeyInvalid) {
    return next(
      new HTTPError(
        'INVALID_FORMAT_FOR_PRODUCT_KEY',
        `Your product key has an invalid format.`,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }

  if (errorMsg) {
    return next(
      new HTTPError(
        'ERROR_WHEN_CHECK_IF_PRODUCT_KEY_STORED',
        errorMsg,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }

  if (!isStored || !storedProductKey) {
    return next(
      new HTTPError(
        'UNFOUND_PRODUCT_KEY',
        `The given product key is unfound.`,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }

  if (validityPeriod) {
    storedProductKey.validityPeriod = validityPeriod;
  }

  if (activated) {
    storedProductKey.activate(activationDate);
  }

  if (!activated) {
    storedProductKey.deactivate();
  }

  if (validityPeriod || !!activated) {
    await storedProductKey.save();
  }

  return res.status(HTTP_STATUS_CODE.OK).send({
    message: 'UPDATED_PRODUCT_KEY',
  });
}

async function registerProductKey(req: Request, res: Response, next: NextFunction) {
  const { productKey, validityPeriod, activated, activationDate } = req.body;
  // --- Check for the product key
  const hasKey = !!productKey;

  const { isStored, storedProductKey, errorMsg } = await ProductKey.checkIfStored(productKey);

  if (errorMsg) {
    return next(
      new HTTPError(
        'ERROR_WHEN_CHECK_IF_PRODUCT_KEY_STORED',
        errorMsg,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }

  if (isStored && storedProductKey) {
    return next(
      new HTTPError(
        'EXISTING_PRODUCT_KEY',
        `REGISTERED_PRODUCT_KEY_ACTIVATED_SINCE_${storedProductKey.activationDate}`,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }

  // new key to add
  const newProductKey = new ProductKey({
    key: productKey,
    activationDate,
    activated,
    validityPeriod,
  });
  await newProductKey.save();

  return res.status(HTTP_STATUS_CODE.OK).send({
    message: 'REGISTERED_PRODUCT_KEY',
    productKey: hasKey ? undefined : newProductKey.key,
  });
}

async function getInfo(req: Request, res: Response, next: NextFunction) {
  const productKey = await ProductKey.findByKey(req.body.productKey);
  if (!productKey) {
    return next(
      new HTTPError(
        'UNFOUND_PRODUCT_KEY',
        "We couldn't retrieve information for the product key",
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }
  return res.status(HTTP_STATUS_CODE.OK).send({ productKey });
}

async function getAllInfo(req: Request, res: Response, next: NextFunction) {
  const productKeys = await ProductKey.find({});
  if (!productKeys) {
    return next(
      new HTTPError(
        'UNFOUND_PRODUCT_KEYS',
        "We couldn't retrieve information for any product keys",
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}
      )
    );
  }
  console.info(`${productKeys.length} product keys info found`);
  return res.status(HTTP_STATUS_CODE.OK).send({ productKeys });
}

export default {
  deleteProductKey: asyncHelper(deleteProductKey),
  addProductKeyToUser: asyncHelper(addProductKeyToUser),
  updateProductKey: asyncHelper(updateProductKey),
  registerProductKey: asyncHelper(registerProductKey),
  getInfo: asyncHelper(getInfo),
  getAllInfo: asyncHelper(getAllInfo),
};
