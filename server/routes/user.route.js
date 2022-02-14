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
      "authorization, Origin, Content-Type, Accept"
    );
    next();
  });

  router.get(
    "/info/:userId",
    [authJwt.authentificateToken, authJwt.hasRole("moderator")],
    controller.getInfo
  );

  router.get(
    "/info",
    [authJwt.authentificateToken, authJwt.hasRole("moderator")],
    controller.getAllInfo
  );

  router.get("/", controller.getAllAccess);

  router.get(
    "/user",
    [authJwt.authentificateToken, authJwt.hasAtLeastLevel(1)],
    controller.getUserStats
  );

  router.delete(
    "/user",
    [authJwt.authentificateToken, authJwt.hasRole("moderator")],
    controller.deleteUser
  );

  router.post(
    "/user",
    [authJwt.authentificateToken, authJwt.hasRole("moderator")],
    controller.updateUser
  );

  router.get(
    "/mod",
    [authJwt.authentificateToken, authJwt.hasRole("moderator")],
    controller.getModeratorStats
  );

  router.get(
    "/admin",
    [authJwt.authentificateToken, authJwt.hasRole("admin")],
    controller.getAdminStats
  );

  return router;
};

module.exports = { getRouter };
