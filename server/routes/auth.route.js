const express = require("express");
const { registerUser } = require("../middlewares");
const controller = require("../controllers/auth.controller");

const getRouter = () => {
  // Initiate express router
  const router = express.Router();

  // adapt header
  router.use((req, res, next) => {
    res.header("Content-Type", "application/json;charset=UTF-8");
    res.header("Access-Control-Allow-Credentials", true);
    res.header(
      "Access-Control-Allow-Headers",
      "authorization, Origin, Content-Type, Accept"
    ); // TODO: still necessary
    next();
  });

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
