import { Router } from "express";
import middlewares from "middlewares";

function getRoutes(): Router {
  // Initiate express router
  const router: Router = Router();

  // Implement routes
  // --> routes for authorization
  const { getRouter: getAuthRouter } = require("./auth.route");
  router.use("/auth", getAuthRouter());

  // add middleware to secure the following routes
  router.use(middlewares.verifyJwt.authentificateAccessToken);
  // --> routes for product Key management
  const { getRouter: getProductKeyRouter } = require("./product-key.route");
  router.use("/product-key", getProductKeyRouter());
  // --> routes for user management
  const { getRouter: getUserRouter } = require("./user.route");
  router.use("/user", getUserRouter());

  return router;
};

export { getRoutes };
