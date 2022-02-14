const express = require("express");
//const { registerUser } = require("../middlewares");
const controller = require("../controllers/auth.controller");

const getRouter = () => {
  // Initiate express router
  const router = express.Router();

  // adapt header
  router.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "authorization, Origin, Content-Type, Accept"
    );
    next();
  });

  // Sign Up
  router.post(
    "/signup",
    /*[
      registerUser.checkDuplicateUsernameOrEmail,
      registerUser.checkProductKeyStored,
      registerUser.checkRoleExisted,
    ],*/
    controller.signup
  );

  // Sign In with Email and Password
  router.post("/signin/credentials", controller.signinWithEmail);

  // Sign In with Product Key
  router.post("/signin/product-key", controller.signinWithProductKey);

  // Refresh token
  router.post("/refresh-token", controller.refreshToken);

  return router;
};

module.exports = { getRouter };
