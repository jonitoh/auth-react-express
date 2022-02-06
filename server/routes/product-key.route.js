const express = require("express");

const getRouter = () => {
  // Initiate express router
  const router = express.Router();

  return router;
};

module.exports = { getRouter };
