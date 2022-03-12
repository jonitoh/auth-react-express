import { Router } from "express";
import middlewares from "middlewares";
import controller from  "controllers/auth.controller";


const { registerUser } = middlewares;

function getRouter(): Router {
  // Initiate express router
  const router: Router = Router();

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

export { getRouter };
