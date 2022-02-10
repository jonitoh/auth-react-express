const { ProductKey } = require("../models");

const deleteProductKey = (req, res) => {
  ProductKey.findOneAndDelete({ key: req.body.productKey }, (err) => {
    if (err) res.status(500).send({ message: err });
    console.log("Successful deletion of a product key");
    res.status(200);
  });
};

const getInfo = (req, res) => {
  const productKey = ProductKey.findByKey(req.body.productKey);
  res.status(200).send({
    productKey: productKey,
  });
};

const getAllInfo = (req, res) => {
  const productKeys = ProductKey.find({}, (err, pkeys) => {
    if (err) console.log(err);
    console.log(`${pkeys.length} product keys info found`);
  });
  res.status(200).send({
    productKeys: productKeys,
  });
};

const modifyProductKey = (req, res) => {
  const update = { validityPeriod: req.body.validityPeriod };
  ProductKey.findOneAndUpdate(
    { key: req.body.productKey },
    update,
    null,
    (err, updatedProductKey) => {
      if (err) res.status(500).send({ message: err });
      //console.log("Successful update of a product key");
      if (activated) {
        if (activated === true) {
          updatedProductKey.activate(req.body.activationDate);
        }
        if (activated === false) {
          updatedProductKey.deactivate();
        }
      }
      res.status(200);
    }
  );
};

const generateProductKey = (req, res) => {
  const { key, activationDate, activated, validityPeriod } = req.body;

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

  // new key to add
  const productKey = new ProductKey({
    key,
    activationDate,
    activated,
    validityPeriod,
  });

  productKey.save((err, _) => {
    // show potential errors
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    res.status(200).send({
      productKey: productKey.key,
      message: "Product Key was created and registered successfully!",
    });
    return;
  });
};

module.exports = {
  deleteProductKey,
  getInfo,
  getAllInfo,
  modifyProductKey,
  generateProductKey,
};
