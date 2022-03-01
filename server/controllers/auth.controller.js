const {
  generateAccessToken,
  generateRefreshToken,
  calculateCookieExpiration,
  verifyRefreshToken,
} = require("../config/jwt.config");
const {
  User,
  Role,
  helpers: { checkProductKey },
} = require("../models");
const { handleMessageForResponse } = require("../utils");

const refreshToken = async (req, res) => {
  const refreshToken = req.signedCookies?.refreshToken;
  if (!refreshToken) {
    return handleMessageForResponse("NO_TOKEN_PROVIDED", res, 401);
  }

  const user = await User.findOne({ refreshToken });
  if (!user) {
    return handleMessageForResponse(
      "NO_USER_LINKED_TO_TOKEN_PROVIDED",
      res,
      401
    );
  }

  verifyRefreshToken(refreshToken, (err, decoded) => {
    if (err || user._id !== decoded.id) {
      return handleMessageForResponse("UNAUTHORIZED", res, 401);
    }
    // check user exists and his rights
    delete decoded.iat;
    delete decoded.exp;
    const newAccessToken = generateAccessToken(decoded);

    res.send({ isTokenResfreshed: true, accessToken: newAccessToken });
  });
};

/*
  this signup controller is quite short since
  important verifications are made in
  previous called middlewares.
*/
const register = async (req, res) => {
  const { username, email, password } = req.body;
  /*
  registerUser.checkDuplicateUsernameOrEmail: check if the user is NOT already registered.
  registerUser.checkDuplicateProductKey: check if the pk is stored -> req.checks.productKeyDoc
  registerUser.checkRoleExisted: check if the role exists -> req.checks.roleDoc
  */
  const { productKeyDoc, roleDoc } = req.checks;
  try {
    const user = new User({
      username,
      email,
      password: await User.hashPassword(password),
      role: roleDoc._id,
      productKey: productKeyDoc._id,
    });

    // retrieve token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // save refreshToken with current user
    user.refreshToken = refreshToken;

    // save the user to the database
    await user.save();

    // send response
    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        expires: calculateCookieExpiration(),
        httpOnly: true,
        signed: true,
      })
      .send({
        isRegistered: true,
        user: user.toResponseJson({ roleName: roleDoc.name }, true),
        accessToken,
      });
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

const signInWithEmail = async (req, res) => {
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
        message: "INVALID_PASSWORD",
      });
    }
    // retrieve token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // save refreshToken into user
    user.refreshToken = refreshToken;
    await user.save();

    const roleDoc = await Role.findById(user.role);
    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        expires: calculateCookieExpiration(),
        httpOnly: true,
        signed: true,
      })
      .send({
        isSignedIn: true,
        user: user.toResponseJson({ roleName: roleDoc.name }, true),
        accessToken,
      });
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

const signInWithProductKey = async (req, res) => {
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

    // save refreshToken into user
    linkedUser.refreshToken = refreshToken;
    await linkedUser.save();

    const { role: roleName } = await Role.findById(linkedUser.role).lean();

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        expires: calculateCookieExpiration(),
        httpOnly: true,
        signed: true,
      })
      .send({
        isSignedIn: true,
        user: linkedUser.toResponseJson({ roleName }, true),
        accessToken,
      });
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};
/*
signInWithExistingCookie: no useful since we have in middelware authentificateToken
*/

const signOut = async (req, res) => {
  //
  const refreshToken = req.signedCookies?.refreshToken;

  if (!refreshToken) {
    return handleMessageForResponse("NO_REFRESH_TOKEN", res, 204);
  }

  const user = await User.findOne({ refreshToken });
  if (user) {
    // delete refreshToken in database
    user.refreshToken = "";
    await user.save();
  }

  // send response
  return res
    .status(200)
    .clearCookie("refreshToken", {
      httpOnly: true,
      signed: true,
    })
    .send({
      isSignedOut: true,
      message: "SIGN_OUT",
    });
};

module.exports = {
  refreshToken,
  register,
  signInWithEmail,
  signInWithProductKey,
  signOut,
};
