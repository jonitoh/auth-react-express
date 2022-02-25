const express = require("express");
const { verifyRoles } = require("../middlewares");
const controller = require("../controllers/user.controller");

const getRouter = () => {
  // Initiate express router
  const router = express.Router();

  router.get(
    "/info/:userId",
    verifyRoles.hasRole("moderator"),
    controller.getInfo
  );

  router.get(
    "/info",
    verifyRoles.hasRole(["moderator", "admin"]),
    controller.getAllInfo
  );

  router.get("/access", controller.getAllAccess);

  router.get("/", verifyRoles.hasAtLeastLevel(1), controller.getUserStats);

  router.delete(
    "/:userId",
    verifyRoles.hasRole("moderator"),
    controller.deleteUser
  );

  router.post("/", verifyRoles.hasRole("moderator"), controller.updateUser);

  router.get(
    "/mod",
    verifyRoles.hasRole("moderator"),
    controller.getModeratorStats
  );

  router.get("/admin", verifyRoles.hasRole("admin"), controller.getAdminStats);

  return router;
};

module.exports = { getRouter };
