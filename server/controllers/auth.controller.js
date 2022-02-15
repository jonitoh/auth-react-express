const authConfig = require("../config/auth.config");
const {
  User,
  Role,
  helpers: { checkProductKey },
} = require("../models");
const jwt = require("jsonwebtoken");
const { handleMessageForResponse } = require("../utils");

const generateAccessToken = (user) => {
  const token = jwt.sign(
    { id: user.id, role: user.role }, // user.role is an id too
    authConfig.ACCESS_TOKEN_SECRET,
    {
      expiresIn: authConfig.ACCESS_TOKEN_EXPIRATION,
    }
  );
  return token;
};

const generateRefreshToken = (user) => {
  const token = jwt.sign(
    { id: user.id, role: user.role }, // user.role is an id too
    authConfig.REFRESH_TOKEN_SECRET,
    {
      expiresIn: authConfig.REFRESH_TOKEN_EXPIRATION,
    }
  );
  return token;
};

const refreshToken = (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return handleMessageForResponse("NO_TOKEN_PROVIDED", res, 403);
  }
  jwt.verify(token, authConfig.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return handleMessageForResponse("UNAUTHORIZED", res, 401);
    }
    // check user exists and his rights
    delete decoded.iat;
    delete decoded.exp;
    const refreshedToken = generateRefreshToken(decoded);
    res.send({
      accessToken: refreshedToken,
    });
  });
};

const signup = async (req, res) => {
  const { username, email, password, productKey, roleName, roleId, forceRole } =
    req.body;
  try {
    const user = new User({
      username,
      email,
      password: await User.hashPassword(password),
    });
    // --- Check for the product key and if it's okay add it to the new user
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
      return handleMessageForResponse(
        "INVALID_FORMAT_FOR_PRODUCT_KEY",
        res,
        500
      );
    }

    if (error) {
      return handleMessageForResponse(error, res, 500);
    }

    if (!isStored) {
      return handleMessageForResponse("UNKNOWN_PRODUCT_KEY", res, 500);
    }

    if (!isInUse) {
      return handleMessageForResponse(isInUseMsg, res, 500);
    }

    if (isLinkedToUser) {
      return handleMessageForResponse(
        "USED_PRODUCT_KEY",
        res,
        500,
        `Product key already linked to user ${linkedUser._id}`
      );
    }

    user.productKey = storedProductKey?._id;

    // --- Check for the role and if it's okay add it to the new user
    const {
      isRoleFound,
      id: userRoleId,
      name: userRoleName,
      error: roleError,
    } = Role.checkRole({ id: roleId, name: roleName, forceRole });

    if (roleError) {
      return handleMessageForResponse(roleError, res, 500);
    }

    if (!isRoleFound) {
      return handleMessageForResponse("NO_ROLE_FOUND", res, 500);
    }
    user.role = userRoleId;

    // save the user to the database
    await user.save();

    // retrieve token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // send response
    res.status(200).send({
      user: user.toResponseJson({ roleName: userRoleName }),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

const signinWithEmail = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);

    if (!user) {
      return handleMessageForResponse("USER_NOT_FOUND", res, 404);
    }
    // check password
    const isValidPassword = await user.checkPassword(password);
    if (!isValidPassword) {
      return res.status(401).send({
        accessToken: null,
        message: "INVALID_PASSWORD",
      });
    }
    // retrieve token
    const accessToken = generateAccessToken(user);
    const refreshedToken = generateRefreshToken(user);

    const roleDoc = await Role.findById(user.role);

    return res.status(200).send({
      user: user.toResponseJson({ roleName: roleDoc.name }),
      accessToken,
      refreshToken: refreshedToken,
    });
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

const signinWithProductKey = async (req, res) => {
  const { productKey } = req.body;
  try {
    const {
      isKeyInvalid,
      isStored,
      isInUse,
      isInUseMsg,
      isLinkedToUser,
      linkedUser,
      error,
    } = await checkProductKey(productKey);

    if (isKeyInvalid) {
      return handleMessageForResponse(
        "INVALID_FORMAT_FOR_PRODUCT_KEY",
        res,
        500
      );
    }

    if (error) {
      return handleMessageForResponse(error, res, 500);
    }

    if (!isStored) {
      return handleMessageForResponse("UNKNOWN_PRODUCT_KEY", res, 500);
    }

    if (!isInUse) {
      return handleMessageForResponse(isInUseMsg, res, 500);
    }

    if (!isLinkedToUser) {
      return handleMessageForResponse("USER_NOT_FOUND", res, 500);
    }

    // --- Check for the role and if it's okay add it to the response
    const accessToken = generateAccessToken(linkedUser);
    const refreshToken = generateRefreshToken(linkedUser);

    const { role: roleName } = await Role.findById(linkedUser.role).lean();

    return res.status(200).send({
      user: linkedUser.toResponseJson({ roleName }),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};
/////////////////////////////////////////////////////
/*
  registerUser.checkDuplicateUsernameOrEmail,
  registerUser.checkDuplicateProductKey,
  registerUser.checkRoleExisted,
*/
const lightSignup = async (req, res) => {
  const { username, email, password, productKey, roleName, roleId, forceRole } =
    req.body;
  try {
    const user = new User({
      username,
      email,
      password: await User.hashPassword(password),
    });
    // --- Check for the product key and if it's okay add it to the new user
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
      return handleMessageForResponse(
        "INVALID_FORMAT_FOR_PRODUCT_KEY",
        res,
        500
      );
    }

    if (error) {
      return handleMessageForResponse(error, res, 500);
    }

    if (!isStored) {
      return handleMessageForResponse("UNKNOWN_PRODUCT_KEY", res, 500);
    }

    if (!isInUse) {
      return handleMessageForResponse(isInUseMsg, res, 500);
    }

    if (isLinkedToUser) {
      return handleMessageForResponse(
        "USED_PRODUCT_KEY",
        res,
        500,
        `Product key already linked to user ${linkedUser._id}`
      );
    }

    user.productKey = storedProductKey?._id;

    // --- Check for the role and if it's okay add it to the new user
    const {
      isRoleFound,
      id: userRoleId,
      name: userRoleName,
      error: roleError,
    } = Role.checkRole({ id: roleId, name: roleName, forceRole });

    if (roleError) {
      return handleMessageForResponse(roleError, res, 500);
    }

    if (!isRoleFound) {
      return handleMessageForResponse("NO_ROLE_FOUND", res, 500);
    }
    user.role = userRoleId;

    // save the user to the database
    await user.save();

    // retrieve token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // send response
    res.status(200).send({
      user: user.toResponseJson({ roleName: userRoleName }),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

module.exports = {
  signup,
  signinWithEmail,
  signinWithProductKey,
  refreshToken,
};
