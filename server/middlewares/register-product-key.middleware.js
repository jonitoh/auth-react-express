const { ProductKey } = require("../models");

checkDuplicateProductKey = (req, res, next) => {
  // check if the key is already here
  const { isDuplicated, duplicateProductKey, errors } =
    ProductKey.checkDuplicate(req.body.productKey);

  // show potential errors
  if (errors) {
    res.status(500).send({ message: errors });
    return;
  }

  // check if the key is already stored
  if (isDuplicated) {
    res.status(400).send({
      message: `Failed! Product key has already been added and activated since ${duplicateProductKey.activationDate}.`,
    });
    return;
  }

  // else go back to business
  next();
};

module.exports = {
  checkDuplicateProductKey,
};
