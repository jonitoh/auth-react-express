const express = require("express");

const getRoutes = () => {
  // Initiate express router
  const router = express.Router();

  // Implement routes
  // --> routes for authorisation
  const { getRouter: getAuthRouter } = require("./auth.route");
  router.use("/auth", getAuthRouter());
  // --> routes for product Key management
  const { getRouter: getProductKeyRouter } = require("./product-key.route");
  router.use("/product-key", getProductKeyRouter());
  // --> routes for user management
  const { getRouter: getUserRouter } = require("./user.route");
  router.use("/user", getUserRouter());

  return router;
};

module.exports = { getRoutes };
