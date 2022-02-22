const authConfig = require("../config/auth.config");
const {
  User,
  Role,
  helpers: { checkProductKey },
} = require("../models");
const jwt = require("jsonwebtoken");
const { handleMessageForResponse } = require("../utils");

const generateAccessToken = (user) => {
  const { _id: id, role } = user; // role here is an ID
  const token = jwt.sign({ id, role }, authConfig.ACCESS_TOKEN_SECRET, {
    expiresIn: authConfig.ACCESS_TOKEN_EXPIRATION,
  });
  return token;
};

const generateRefreshToken = (user) => {
  const { _id: id, role } = user; // role here is an ID
  const token = jwt.sign({ id, role }, authConfig.REFRESH_TOKEN_SECRET, {
    expiresIn: authConfig.REFRESH_TOKEN_EXPIRATION,
  });
  return token;
};

const calculateCookieExpiration = (value) =>
  !value || value == 0 ? 0 : new Date(Date.now() + value);

const generateCookieValue = (token) => `Bearer ${token}`;

const refreshToken = (req, res) => {
  const refreshCookie = req.cookies?.refreshToken;
  const token = refreshCookie?.split(" ")[1];
  if (!token) {
    return handleMessageForResponse("NO_TOKEN_PROVIDED", res, 401);
  }
  jwt.verify(token, authConfig.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return handleMessageForResponse("UNAUTHORIZED", res, 401);
    }
    // check user exists and his rights
    delete decoded.iat;
    delete decoded.exp;
    const refreshedToken = generateAccessToken(decoded);

    res
      .cookie("accessToken", generateCookieValue(refreshedToken), {
        expires: calculateCookieExpiration(authConfig.COOKIE_EXPIRATION),
        httpOnly: true,
        signed: true,
      })
      .send({ isTokenResfreshed: true });
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

    // save the user to the database
    await user.save();

    // retrieve token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // send response
    return res
      .status(200)
      .cookie("accessToken", generateCookieValue(accessToken), {
        expires: calculateCookieExpiration(authConfig.COOKIE_EXPIRATION),
        httpOnly: true,
        signed: true,
      })
      .cookie("refreshToken", generateCookieValue(refreshToken), {
        expires: calculateCookieExpiration(authConfig.COOKIE_EXPIRATION),
        httpOnly: true,
        signed: true,
      })
      .send({
        isSignedIn: true,
        user: user.toResponseJson({ roleName: roleDoc.name }, true),
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

    const roleDoc = await Role.findById(user.role);
    return res
      .status(200)
      .cookie("accessToken", generateCookieValue(accessToken), {
        expires: calculateCookieExpiration(authConfig.COOKIE_EXPIRATION),
        httpOnly: true,
        signed: true,
      })
      .cookie("refreshToken", generateCookieValue(refreshToken), {
        expires: calculateCookieExpiration(authConfig.COOKIE_EXPIRATION),
        httpOnly: true,
        signed: true,
      })
      .send({
        isSignedIn: true,
        user: user.toResponseJson({ roleName: roleDoc.name }, true),
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

    const { role: roleName } = await Role.findById(linkedUser.role).lean();

    return res
      .status(200)
      .cookie("accessToken", generateCookieValue(accessToken), {
        expires: calculateCookieExpiration(authConfig.COOKIE_EXPIRATION),
        httpOnly: true,
        signed: true,
      })
      .cookie("refreshToken", generateCookieValue(refreshToken), {
        expires: calculateCookieExpiration(authConfig.COOKIE_EXPIRATION),
        httpOnly: true,
        signed: true,
      })
      .send({
        isSignedIn: true,
        user: linkedUser.toResponseJson({ roleName }, true),
      });
  } catch (error) {
    return handleMessageForResponse(error, res, 500);
  }
};

const signOut = async (req, res) => {
  // send response
  return res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      signed: true,
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      signed: true,
    })
    .send({
      isSignedOut: true,
      message: "SIGNOUT",
    });
};

module.exports = {
  refreshToken,
  register,
  signInWithEmail,
  signInWithProductKey,
  signOut,
};
