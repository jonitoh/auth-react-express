import { Request, Response, NextFunction } from "express";
import db from "models";
import { HTTPError } from "utils/error";
import { HTTP_STATUS_CODE } from "utils/main";
import { asyncHelper } from "utils/express";

const { User, helpers: { checkProductKey } } = db;


async function deleteUser(req: Request, res: Response, next: NextFunction) {
  const { userId } = req.params;
  const deleted = await User.deleteOne({ _id: userId });
  if (!deleted) {
    return next(new HTTPError(
      "ERROR_WHEN_DELETING_USER",
      `Something happened when deleting a user.`,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}))
  }
  return res
  .status(HTTP_STATUS_CODE.NO_CONTENT)
  .send({
    message: "SUCCESSFUL_DELETION",
  });
};

async function getInfo(req: Request, res: Response, next: NextFunction) {
  const { userId } = req.params;
  const user = await User.findById(userId).lean();
  if (!user) {
    return next(new HTTPError(
      "UNFOUND_USER",
      "We couldn't retrieve information for that user",
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}))
  }
  return res.status(HTTP_STATUS_CODE.OK).send({ user });
};

async function getAllInfo(req: Request, res: Response, next: NextFunction) {
  const users = await User.find({});
  if (!users) {
    return next(new HTTPError(
      "UNFOUND_USERS",
      "We couldn't retrieve information for any users",
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}))
  }
  console.info(`${users.length} user info found`);
  return res.status(HTTP_STATUS_CODE.OK).send({ users });
};

async function updateUser(req: Request, res: Response, next: NextFunction) {
  const { id, username, email, password, productKey, role } = req.body;
  const user = await User.findOneAndUpdate(
    { _id: id },
    { username, email, role },
    null
  );

  if (!user) {
    return next(new HTTPError(
      "UNFOUND_USER",
      `We couldn't find the user to update.`,
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      {}))
  }

  // update password
  if (password) {
    const isSamePassword = await user.checkPassword(password);
    if (isSamePassword) {
      console.info("it's the same password");
    } else {
      user.password = await User.hashPassword(password);
    }
  }

  // update product key
  if (productKey) {
    const {
      isKeyInvalid,
      isStored,
      storedProductKey,
      isInUse,
      isInUseMsg,
      isLinkedToUser,
      linkedUser,
      error,
    } = await checkProductKey(productKey);

    if (isKeyInvalid) {
      return next(new HTTPError(
        "INVALID_FORMAT_FOR_PRODUCT_KEY",
        `Your product key has an invalid format.`,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}))
    }
    // send potential errors
    if (error) {
      return next(new HTTPError(
        "ERROR_WHEN_CHECK_PRODUCT_KEY",
        error,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}))
    }

    // product key not registered
    if (!isStored || !storedProductKey) {
      return next(new HTTPError(
        "UNFOUND_PRODUCT_KEY",
        `The given product key is unfound.`,
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}))
    }

    // product key not usable
    if (!isInUse) {
      return next(new HTTPError(
        "PRODUCT_KEY_NOT_LINKED",
        isInUseMsg? isInUseMsg: "This product key is linked to no user",
        HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        {}))
    }

    // check if the key is not alreday linked to another user
    if (isLinkedToUser && linkedUser) {
      if (linkedUser._id !== user._id) {
        return next(new HTTPError(
          "PRODUCT_KEY_ALREADY_LINKED_TO_ANOTHER_USER",
          "This product key is linked to another user",
          HTTP_STATUS_CODE.NOT_IMPLEMENTED,
          {}))
      }
      console.info("product key already linked to the given user");
    }
    user.productKey = storedProductKey._id;
  }

  await user.save();
  return res
  .status(HTTP_STATUS_CODE.OK)
  .send({
    message: "UPDATED_USER",
  });
};

/* --- Fake stuff --- */
function getAllAccess(req: Request, res: Response, next: NextFunction) {
  res.status(HTTP_STATUS_CODE.OK).send("Public Content.");
};

function getUserStats(req: Request, res: Response, next: NextFunction) {
  res.status(HTTP_STATUS_CODE.OK).send("User Content.");
};

function getAdminStats(req: Request, res: Response, next: NextFunction) {
  res.status(HTTP_STATUS_CODE.OK).send("Admin Content.");
};

function getModeratorStats(req: Request, res: Response, next: NextFunction) {
  res.status(HTTP_STATUS_CODE.OK).send("Moderator Content.");
};

export default {
  deleteUser: asyncHelper(deleteUser),
  getInfo: asyncHelper(getInfo),
  getAllInfo: asyncHelper(getAllInfo),
  updateUser: asyncHelper(updateUser),
  getAllAccess,
  getUserStats,
  getAdminStats,
  getModeratorStats,
};
