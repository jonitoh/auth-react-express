const express = require("express");
const router = express.Router();

const authRouter = require("./auth.route");
const productKeyRouter = require("./product-key.route");
const userRouter = require("./user.route");

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/product-key", productKeyRouter);

module.exports = router;
