const express = require("express");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

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
    ); // TODO: still necessary ?
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

  router.get("/access", controller.getAllAccess);

  router.get(
    "/",
    [authJwt.authentificateToken, authJwt.hasAtLeastLevel(1)],
    controller.getUserStats
  );

  router.delete(
    "/",
    [authJwt.authentificateToken, authJwt.hasRole("moderator")],
    controller.deleteUser
  );

  router.post(
    "/",
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
