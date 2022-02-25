const express = require("express");
const { registerUser } = require("../middlewares");
const controller = require("../controllers/auth.controller");

const getRouter = () => {
  // Initiate express router
  const router = express.Router();

  // Sign Up
  router.post(
    "/register",
    [
      registerUser.checkDuplicateWithUsernameOrEmail,
      registerUser.checkProductKeyStored,
      registerUser.checkRoleExists,
    ],
    controller.register
  );

  // Sign In with Email and Password
  router.post("/sign-in/credentials", controller.signInWithEmail);

  // Sign In with Product Key
  router.post("/sign-in/product-key", controller.signInWithProductKey);

  // Refresh token
  router.get("/refresh-token", controller.refreshToken);

  // Sign Out by clearing our tokens stored in cookies
  router.get("/sign-out", controller.signOut);

  return router;
};

module.exports = { getRouter };
