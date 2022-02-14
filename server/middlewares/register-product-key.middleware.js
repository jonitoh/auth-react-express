const { ProductKey } = require("../models");
const { handleMessageForResponse } = require("../utils");

checkDuplicateProductKey = (req, res, next) => {
  try {
    const { isStored, storedProductKey, errorMsg } = ProductKey.checkIfStored(
      req.body.productKey
    );

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
