import { ObjectId } from 'mongoose';
import { Request, Response } from 'express';
import db from '../models';
import { IProductKey } from '../schemas/product-key/product-key.types';
import { HTTP_STATUS_CODE, TypeLikeMutator } from '../utils/main';
import { asyncControllerHelper } from '../utils/express';
import { HTTPError } from '../utils/error/http-error';

const {
  User,
  ProductKey,
  helpers: { checkProductKey },
} = db;

async function deleteProductKey(req: Request, res: Response): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { productKey }: { productKey: string } = req.body;
  // --- Check for the product key
  const { isKeyInvalid, isStored, storedProductKey, isLinkedToUser, linkedUser, error } =
    await checkProductKey(productKey);

  if (isKeyInvalid) {
    throw new HTTPError(
      'INVALID_FORMAT_FOR_PRODUCT_KEY',
      `Your product key has an invalid format.`,
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}
    );
  }

  // send potential errors
  if (error) {
    throw new HTTPError(
      'ERROR_WHEN_CHECK_PRODUCT_KEY',
      error,
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}
    );
  }

  // product key not registered
  if (!isStored || !storedProductKey) {
    throw new HTTPError(
      'UNFOUND_PRODUCT_KEY',
      `The given product key is unfound.`,
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}
    );
  }

  // if linked to user, remove the key from that user
  if (linkedUser) {
    linkedUser.productKey = null;
    linkedUser.activated = false;
    await linkedUser.save();
  }

  // delete the Product Key
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  await ProductKey.deleteOne({ _id: storedProductKey._id });
  res.status(HTTP_STATUS_CODE.OK).send({
    message:
      isLinkedToUser && linkedUser?._id
        ? `SUCCESSFUL_DELETION_OF_PRODUCT_KEY_LINKED_TO_USER_${linkedUser?._id.toString()}`
        : 'SUCCESSFUL_DELETION_OF_PRODUCT_KEY',
  });
}

async function addProductKeyToUser(req: Request, res: Response): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { userId, productKey }: Record<'userId' | 'productKey', string> = req.body;
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
    throw new HTTPError(
      'INVALID_FORMAT_FOR_PRODUCT_KEY',
      `Your product key has an invalid format.`,
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}
    );
  }

  // send potential errors
  if (error) {
    throw new HTTPError(
      'ERROR_WHEN_CHECK_PRODUCT_KEY',
      error,
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}
    );
  }

  // product key not registered
  if (!isStored || !storedProductKey) {
    throw new HTTPError(
      'UNFOUND_PRODUCT_KEY',
      `The given product key is unfound.`,
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}
    );
  }

  // product key not usable
  if (!isInUse) {
    throw new HTTPError(
      'PRODUCT_KEY_NOT_LINKED',
      isInUseMsg || 'This product key is linked to no user',
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}
    );
  }

  // check if the key is not alreday linked to a user
  if (isLinkedToUser && linkedUser) {
    if (linkedUser._id?.toString() !== userId) {
      throw new HTTPError(
        'PRODUCT_KEY_ALREADY_LINKED_TO_ANOTHER_USER',
        'This product key is linked to another user',
        HTTP_STATUS_CODE.NOT_IMPLEMENTED,
        {}
      );
    }
    console.info('product key linked to the given user');
  }

  // retrieve the wanted user
  const user = await User.findById(userId);

  if (!user) {
    throw new HTTPError(
      'UNFOUND_USER',
      `We couldn't find the user to update.`,
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const formerProductKeyId: ObjectId | undefined = user.productKey;

  // if former Product Key, deactivate that key
  if (formerProductKeyId) {
    const formerProductKey = await ProductKey.findById(formerProductKeyId);
    if (formerProductKey) {
      formerProductKey.deactivate();
      await formerProductKey.save();
    }
  }

  // attach key to user
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  user.productKey = storedProductKey._id;
  await user.save();

  // send response
  res.status(HTTP_STATUS_CODE.OK).send({
    message: formerProductKeyId ? 'FORMER_PRODUCT_KEY_DEACTIVATED' : 'PRODUCT_KEY_ADDED_TO_USER',
  });
}
// seems complicated but it's for maintaining coherency in types
type InfoFromBody = TypeLikeMutator<
  { productKey: string } & Pick<IProductKey, 'validityPeriod' | 'activated' | 'activationDate'>
>;

async function updateProductKey(req: Request, res: Response): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { productKey, validityPeriod, activated, activationDate }: InfoFromBody = req.body;
  const { isKeyInvalid, isStored, storedProductKey, errorMsg } = await ProductKey.checkIfStored(
    productKey
  );

  if (isKeyInvalid) {
    throw new HTTPError(
      'INVALID_FORMAT_FOR_PRODUCT_KEY',
      `Your product key has an invalid format.`,
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}
    );
  }

  if (errorMsg) {
    throw new HTTPError(
      'ERROR_WHEN_CHECK_IF_PRODUCT_KEY_STORED',
      errorMsg,
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}
    );
  }

  if (!isStored || !storedProductKey) {
    throw new HTTPError(
      'UNFOUND_PRODUCT_KEY',
      `The given product key is unfound.`,
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}
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

  res.status(HTTP_STATUS_CODE.OK).send({
    message: 'UPDATED_PRODUCT_KEY',
  });
}

async function registerProductKey(req: Request, res: Response): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { productKey, validityPeriod, activated, activationDate }: InfoFromBody = req.body;
  // --- Check for the product key
  const hasKey = !!productKey;

  const { isStored, storedProductKey, errorMsg } = await ProductKey.checkIfStored(productKey);

  if (errorMsg) {
    throw new HTTPError(
      'ERROR_WHEN_CHECK_IF_PRODUCT_KEY_STORED',
      errorMsg,
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}
    );
  }

  if (isStored && storedProductKey) {
    throw new HTTPError(
      'EXISTING_PRODUCT_KEY',
      `REGISTERED_PRODUCT_KEY_ACTIVATED_SINCE_${storedProductKey.activationDate.toDateString()}`,
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}
    );
  }

  // new key to add
  const newProductKey = new ProductKey({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    key: productKey,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    activationDate,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    activated,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    validityPeriod,
  });
  await newProductKey.save();

  res.status(HTTP_STATUS_CODE.OK).send({
    message: 'REGISTERED_PRODUCT_KEY',
    productKey: hasKey ? undefined : newProductKey.key,
  });
}

async function getInfo(req: Request, res: Response): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { productKey: retrievedProductKey }: { productKey: string } = req.body;
  const productKey = await ProductKey.findByKey(retrievedProductKey);
  if (!productKey) {
    throw new HTTPError(
      'UNFOUND_PRODUCT_KEY',
      "We couldn't retrieve information for the product key",
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}
    );
  }
  res.status(HTTP_STATUS_CODE.OK).send({ productKey });
}

async function getAllInfo(req: Request, res: Response): Promise<void> {
  const productKeys = await ProductKey.find({});
  if (!productKeys) {
    throw new HTTPError(
      'UNFOUND_PRODUCT_KEYS',
      "We couldn't retrieve information for any product keys",
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}
    );
  }
  console.info(`${productKeys.length} product keys info found`);
  res.status(HTTP_STATUS_CODE.OK).send({ productKeys });
}

export default {
  deleteProductKey: asyncControllerHelper(deleteProductKey),
  addProductKeyToUser: asyncControllerHelper(addProductKeyToUser),
  updateProductKey: asyncControllerHelper(updateProductKey),
  registerProductKey: asyncControllerHelper(registerProductKey),
  getInfo: asyncControllerHelper(getInfo),
  getAllInfo: asyncControllerHelper(getAllInfo),
};
