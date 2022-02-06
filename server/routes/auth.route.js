const express = require("express");
const router = express.Router();

const { registerUser } = require("../middlewares");
const controller = require("../controllers/auth.controller");

// adapt header
router.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// Sign Up
router.post(
  "/signup",
  [
    registerUser.checkDuplicateUsernameOrEmail,
    registerUser.checkDuplicateProductKey,
    registerUser.checkRolesExisted,
  ],
  controller.signup
);

// Sign In with Email and Password
router.post("/signin/credentials", controller.signinWithEmail);

// Sign In with Product Key
router.post("/signin/product-key", controller.signinWithProductKey);

module.exports = router;
