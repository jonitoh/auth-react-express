const { User, ProductKey } = require("../models");
const { handleMessageForResponse } = require("../utils");

const deleteUser = (req, res) => {
  const { id: userId } = req.params;
  try {
    const deleted = await User.deleteOne({ _id: userId });
    if (!deleted) {
      return handleMessageForResponse("ERROR_WHEN_DELETING_USER", res, 500);
    }
    return handleMessageForResponse("SUCCESSFUL_DELETION", res, 200);
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

const getInfo = (req, res) => {
  const { id: userId } = req.params;
  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      return handleMessageForResponse("UNFOUND_USER", res, 500);
    }
    return res.status(200).send({ user });
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

const getAllInfo = (req, res) => {
  try {
    const users = await User.find({});
    if (!users) {
      return handleMessageForResponse("UNFOUND_USERS", res, 500);
    }
    console.log(`${users.length} user info found`);
    return res.status(200).send({ users });
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

const updateUser = async (req, res) => {
  const { id, username, email, password, productKey, role } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { _id: id },
      { username, email, role },
      null
    );

    if (!user) {
      return handleMessageForResponse("UNFOUND_USER", res, 500);
    }

    // update password
    if (password) {
      const isSamePassword = await user.checkPassword(password);
      if (isSamePassword) {
        console.log("it's the same password");
      } else {
        user.password = await User.hashPassword(password);
      }
    }

    // update product key
    if (productKey) {
      const {
        isStored,
        storedProductKey,
        isInUse,
        isInUseMsg,
        isLinkedToUser,
        linkedUser,
        error,
      } = await checkProductKey(productKey);

      // send potential errors
      if (error) {
        return handleMessageForResponse(error, res, 500);
      }

      // product key not registered
      if (!isStored) {
        return handleMessageForResponse("UNKNOWN_PRODUCT_KEY", res, 500);
      }

      // product key not usable
      if (!isInUse) {
        return handleMessageForResponse(isInUseMsg, res, 500);
      }

      // check if the key is not alreday linked to another user
      if (isLinkedToUser) {
        if (linkedUser._id !== user._id) {
          return handleMessageForResponse(
            "PRODUCT_KEY_ALREADY_LINKED_TO_ANOTHER_USER",
            res,
            200
          );
        }
        console.log("product key already linked to the user");
      }
      user.productKey = storedProductKey._id;
    }

    await user.save();
    return handleMessageForResponse("UPDATED_USER", res, 200);
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

/* --- Fake stuff --- */
const getAllAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

const getUserStats = (req, res) => {
  res.status(200).send("User Content.");
};

const getAdminStats = (req, res) => {
  res.status(200).send("Admin Content.");
};

const getModeratorStats = (req, res) => {
  res.status(200).send("Moderator Content.");
};

module.exports = {
  deleteUser,
  getInfo,
  getAllInfo,
  updateUser,
  getAllAccess,
  getUserStats,
  getAdminStats,
  getModeratorStats,
};
