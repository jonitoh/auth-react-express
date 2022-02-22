const { Role, User, ProductKey } = require("../models");
const { handleMessageForResponse } = require("../utils");

checkDuplicateWithUsernameOrEmail = async (req, res, next) => {
  const { email, username } = req.body;
  try {
    let isUserExists = false;

    // check email
    if (email) {
      isUserExists = await User.exists({ email });
    }

    // check username
    if (!isUserExists && username) {
      isUserExists = await User.exists({ username });
    }

    if (isUserExists) {
      return handleMessageForResponse("USED_CREDENTIALS", res, 400);
    }
    // go back to business
    return next();
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

checkProductKeyStored = async (req, res, next) => {
  const { productKey } = req.body;
  try {
    const { isKeyInvalid, isStored, storedProductKey, errorMsg } =
      ProductKey.checkIfStored(productKey);

    if (isKeyInvalid) {
      return handleMessageForResponse(
        "INVALID_FORMAT_FOR_PRODUCT_KEY",
        res,
        500
      );
    }

    if (errorMsg) {
      return handleMessageForResponse(errorMsg, res, 500);
    }

    if (!isStored) {
      return handleMessageForResponse("UNKNOWN_PRODUCT_KEY", res, 500);
    }

    req.checks = { ...req.checks, productKeyDoc: storedProductKey };
    return next();
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

checkRoleExists = async (req, res, next) => {
  const { roleName, roleId, forceRole } = req.body;
  try {
    // --- Check for the role and if it's okay add it to the new user
    const { isRoleFound, role, error } = await Role.checkRole({
      id: roleId,
      name: roleName,
      forceRole,
    });

    if (error) {
      return handleMessageForResponse(error, res, 500);
    }

    if (!isRoleFound) {
      return handleMessageForResponse("NO_ROLE_FOUND", res, 500);
    }

    req.checks = { ...req.checks, roleDoc: role };
    return next();
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

module.exports = {
  checkDuplicateWithUsernameOrEmail,
  checkProductKeyStored,
  checkRoleExists,
};
