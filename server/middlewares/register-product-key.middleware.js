const db = require("../models");
const { productKey: ProductKey } = db;

checkDuplicateProductKey = (req, res, next) => {
  ProductKey.findOne({
    key: req.body.productKey,
  }).exec((err, productKey) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (productKey) {
      res
        .status(400)
        .send({ message: "Failed! ProductKey is already in use!" });
      return;
    }
    next();
  });
};

module.exports = {
  checkDuplicateProductKey,
};
