const { ProductKey } = require("../models");
const { handleMessageForResponse } = require("../utils/main");

checkDuplicateProductKey = (req, res, next) => {
  try {
    const { isKeyInvalid, isStored, storedProductKey, errorMsg } =
      ProductKey.checkIfStored(req.body.productKey);

    if (isKeyInvalid) {
      return handleMessageForResponse(
        "INVALID_FORMAT_FOR_PRODUCT_KEY",
        res,
        500
      );
    }

    if (errorMsg) {
      return handleMessageForResponse(errorMsg, res, 500);
    }

    if (isStored) {
      return handleMessageForResponse(
        `Failed! Product key has already been added and activated since ${storedProductKey.activationDate}.`,
        res,
        400
      );
    }
    return next();
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

module.exports = {
  checkDuplicateProductKey,
};
