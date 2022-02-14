const {
  ProductKey,
  User,
  helpers: { checkProductKey },
} = require("../models");
const { handleMessageForResponse } = require("../utils");

const deleteProductKey = async (req, res) => {
  const { productKey } = req.body;
  try {
    // --- Check for the product key
    /*
    if (!productKey) {
      return handleMessageForResponse("MISSING_PRODUCT_KEY", res, 500);
    }
    */

    const { isStored, storedProductKey, isLinkedToUser, linkedUser, error } =
      await checkProductKey(productKey);

    // send potential errors
    if (error) {
      return handleMessageForResponse(error, res, 500);
    }

    // product key not registered
    if (!isStored) {
      return handleMessageForResponse("UNKNOWN_PRODUCT_KEY", res, 500);
    }

    // if linked to user, remove the key from that user
    if (linkedUser) {
      linkedUser.productKey = null;
      linkedUser.activated = false;
      await linkedUser.save();
    }

    // delete the Product Key
    await ProductKey.deleteOne({ _id: storedProductKey._id });
    return handleMessageForResponse(
      isLinkedToUser
        ? `SUCCESSFUL_DELETION_OF_PRODUCT_KEY_LINKED_TO_USER_${linkedUser?._id}`
        : "SUCCESSFUL_DELETION_OF_PRODUCT_KEY",
      res,
      200
    );
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

const addProductKeyToUser = async (res, req) => {
  const { userId, productKey } = req.body;

  try {
    // --- Check for the product key
    /*
    if (!productKey) {
      return handleMessageForResponse("MISSING_PRODUCT_KEY", res, 500);
    }
    */

    const {
      isStored,
      storedProductKey,
      isInUse,
      isInUseMsg,
      isLinkedToUser,
      linkedUser,
      error,
    } = await checkProductKey(productKey);

    // send potential errors
    if (error) {
      return handleMessageForResponse(error, res, 500);
    }

    // product key not registered
    if (!isStored) {
      return handleMessageForResponse("UNKNOWN_PRODUCT_KEY", res, 500);
    }

    // product key not usable
    if (!isInUse) {
      return handleMessageForResponse(isInUseMsg, res, 500);
    }

    // check if the key is not alreday linked to a user
    if (isLinkedToUser) {
      if (linkedUser._id === userId) {
        return handleMessageForResponse(
          "PRODUCT_KEY_ALREADY_LINKED_TO_THE_USER",
          res,
          200
        );
      }
      return handleMessageForResponse(
        "PRODUCT_KEY_LINKED_TO_ANOTHER_USER",
        res,
        500
      );
    }

    // retrieve the wanted user
    const user = await User.findById(userId);

    if (!user) {
      return handleMessageForResponse("UNFOUND_USER", res, 500);
    }

    const formerProductKeyId = user.productKey;

    // if former Product Key, deactivate that key
    if (formerProductKeyId) {
      const formerProductKey = await ProductKey.findById(formerProductKeyId);
      formerProductKey.deactivate();
      await formerProductKey.save();
    }

    // attach key to user
    user.productKey = storedProductKey._id;
    await user.save();

    // send response
    return handleMessageForResponse(
      formerProductKeyId
        ? "FORMER_PRODUCT_KEY_DEACTIVATED"
        : "PRODUCT_KEY_ADDED_TO_USER",
      res,
      200
    );
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

const updateProductKey = async (req, res) => {
  const { productKey, validityPeriod, activated, activationDate } = req.body;
  try {
    // --- Check for the product key
    /*
    if (!productKey) {
      return handleMessageForResponse("MISSING_PRODUCT_KEY", res, 500);
    }
    */

    const { isStored, storedProductKey, errorMsg } =
      ProductKey.checkIfStored(productKey);

    if (errorMsg) {
      return handleMessageForResponse(errorMsg, res, 500);
    }

    if (!isStored) {
      return handleMessageForResponse("UNFOUND_PRODUCT_KEY", res, 500);
    }

    if (validityPeriod) {
      storedProductKey.validityPeriod = validityPeriod;
    }

    if (activated === true) {
      storedProductKey.activate(activationDate);
    }

    if (activated === false) {
      storedProductKey.deactivate();
    }

    if (validityPeriod || !!activated) {
      await storedProductKey.save();
    }
    return handleMessageForResponse("UPDATED_PRODUCT_KEY", res, 200);
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

const registerProductKey = async (req, res) => {
  const { productKey, validityPeriod, activated, activationDate } = req.body;
  try {
    // --- Check for the product key
    const hasKey = !!productKey;

    const { isStored, storedProductKey, errorMsg } =
      ProductKey.checkIfStored(productKey);

    if (errorMsg) {
      return handleMessageForResponse(errorMsg, res, 500);
    }

    if (isStored) {
      return handleMessageForResponse(
        `REGISTERED_PRODUCT_KEY_ACTIVATED_SINCE_${storedProductKey.activationDate}`,
        res,
        500
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

    return res.status(200).send({
      message: "REGISTERED_PRODUCT_KEY",
      productKey: hasKey ? undefined : newProductKey.key,
    });
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

const getInfo = async (req, res) => {
  try {
    const productKey = await ProductKey.findByKey(req.body.productKey);
    if (!productKey) {
      return handleMessageForResponse("UNFOUND_PRODUCT_KEY", res, 500);
    }
    return res.status(200).send({ productKey });
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

const getAllInfo = async (req, res) => {
  try {
    const productKeys = await ProductKey.find({});
    if (!productKeys) {
      return handleMessageForResponse("UNFOUND_PRODUCT_KEY", res, 500);
    }
    console.log(`${productKeys.length} product keys info found`);
    return res.status(200).send({ productKeys });
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

module.exports = {
  deleteProductKey,
  addProductKeyToUser,
  updateProductKey,
  registerProductKey,
  getInfo,
  getAllInfo,
};
