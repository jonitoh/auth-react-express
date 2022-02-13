const { ProductKey, User } = require("../models");

const deleteProductKey = (req, res) => {
  ProductKey.findOneAndDelete({ key: req.body.productKey }, (err) => {
    // check errors
    if (err) res.status(500).send({ message: err });
    User.find({ productKey: req.body.productKey }, (err, user) => {
      //
      if (!user) {
        console.log("Successful deletion of a product key");
        res.status(200);
      } else {
        user.productKey = null;
        user.activated = false;
        res.status(200).send({
          message: `Successful deletion of the product key which deactivate the user ${user._id}`,
        });
      }
    });
  });
};

const addProductKeyToUser = (res, req) => {
  const { userId, productKey } = req.body;

  // check if productKey exists
  const { isDuplicated, duplicateProductKey, errors } =
    ProductKey.checkDuplicate(productKey);

  // show potential errors
  if (errors) {
    res.status(500).send({ message: errors });
    return;
  }

  // check if the key is already stored
  if (!isDuplicated) {
    res.status(500).send({
      message: "UNFOUND_PRODUCT_KEY",
    });
    return;
  }

  // find user
  User.findById(userId, (err, user) => {
    if (err) console.log(err);
    if (!user) {
      res.status(500).send({ message: "UNFOUND_USER" });
      return;
    }
    const formerProductKey = user.productKey;
    user.productKey = duplicateProductKey._id;
    if (!formerProductKey) {
      res.status(200);
      return;
    } else {
      ProductKey.findById(formerProductKey, (err, pk) => {
        pk.deactivate();
        res.status(200).send({ message: "FORMER_KEY_DEACTIVATED" });
        return;
      });
    }
  });
};

const modifyProductKey = (req, res) => {
  ProductKey.findOneAndUpdate(
    { key: req.body.productKey },
    { validityPeriod: req.body.validityPeriod },
    null,
    (err, updatedProductKey) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      //console.log("Successful update of a product key");
      if (!!req.body.activated) {
        if (req.body.activated) {
          updatedProductKey.activate(req.body.activationDate);
        } else {
          updatedProductKey.deactivate();
        }
      }
      res.status(200);
    }
  );
};

const registerProductKey = (req, res) => {
  const { key, activationDate, activated, validityPeriod } = req.body;
  const hasKey = !!key;
  if (hasKey) {
    // check if the key is already here
    const { isDuplicated, duplicateProductKey, errors } =
      ProductKey.checkDuplicate(key);

    // show potential errors
    if (errors) {
      res.status(500).send({ message: errors });
      return;
    }

    // check if the key is already stored
    if (isDuplicated) {
      res.status(500).send({
        message: `Super admin product key has already been added and activated since ${duplicateProductKey.activationDate}.`,
      });
      return;
    }
  }

  // new key to add
  const productKey = new ProductKey({
    key,
    activationDate,
    activated,
    validityPeriod,
  });

  productKey.save((err, pk) => {
    // show potential errors
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    res.status(200).send({
      productKey: hasKey ? undefined : pk.key,
      message: "Product Key was created and registered successfully!",
    });
    return;
  });
};

const getInfo = async (req, res) => {
  const productKey = await ProductKey.findByKey(req.body.productKey);
  res.status(200).send({
    productKey: productKey,
  });
};

const getAllInfo = (req, res) => {
  const productKeys = ProductKey.find({}, (err, pkeys) => {
    if (err) console.log(err);
    if (!pkeys) {
      res.status(400).send({ message: "UNFOUND_PRODUCT_KEY" });
    }
    console.log(`${pkeys.length} product keys info found`);
  });
  res.status(200).send({
    productKeys: productKeys,
  });
};

module.exports = {
  deleteProductKey,
  addProductKeyToUser,
  modifyProductKey,
  registerProductKey,
  getInfo,
  getAllInfo,
};
