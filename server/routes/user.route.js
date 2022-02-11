const express = require("express");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

const getRouter = () => {
  // Initiate express router
  const router = express.Router();

  // adapt header
  router.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.get(
    "/info/:userId",
    [authJwt.verifyToken, authJwt.hasRole("moderator")],
    controller.getInfo
  );

  router.get(
    "/info",
    [authJwt.verifyToken, authJwt.hasRole("moderator")],
    controller.getAllInfo
  );

  router.get("/", controller.getAllAccess);

  router.get(
    "/user",
    [authJwt.verifyToken, authJwt.hasRole("user")],
    controller.getUserStats
  );

  router.delete(
    "/user",
    [authJwt.verifyToken, authJwt.hasRole("moderator")],
    controller.deleteUser
  );

  router.post(
    "/user",
    [authJwt.verifyToken, authJwt.hasRole("moderator")],
    controller.modifyUser
  );

  router.get(
    "/mod",
    [authJwt.verifyToken, authJwt.hasRole("moderator")],
    controller.getModeratorStats
  );

  router.get(
    "/admin",
    [authJwt.verifyToken, authJwt.hasRole("admin")],
    controller.getAdminStats
  );

  return router;
};

module.exports = { getRouter };
