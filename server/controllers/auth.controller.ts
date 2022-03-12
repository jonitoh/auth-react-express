import { Request, Response, NextFunction } from "express";
import db from "models";
import { HTTPError } from "utils/error";
import { HTTP_STATUS_CODE } from "utils/main";
import {
  generateAccessToken,
  generateRefreshToken,
  calculateCookieExpiration,
  verifyRefreshToken,
  DecodedPayload,
} from "config/jwt.config";
import { asyncHelper } from "utils/express";

const {
  User,
  Role,
  helpers: { checkProductKey },
} = db;


async function refreshToken(req: Request, res: Response, next: NextFunction) {
  const refreshToken: string|undefined = req.signedCookies?.refreshToken;
  if (!refreshToken) {
    return next(new HTTPError(
      "NO_TOKEN_PROVIDED",
      `The following token has not been found: refreshToken.`,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}))
  }

  const user = await User.findOne({ refreshToken });
  if (!user) {
    return next(new HTTPError(
      "NO_USER_LINKED_TO_TOKEN",
      `The provided token (refreshToken) is not linked to any user.`,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}))
  }

  try {
    const decoded: DecodedPayload = verifyRefreshToken(refreshToken);

    if (user._id?.toString() !== decoded.id) {
      return next(new HTTPError(
        "USER_AND_TOKEN_DIFFERENTS",
        `It seems like the token is not aligned with the user credentials.`,
        HTTP_STATUS_CODE.UNAUTHORIZED,
        {}))
    }

    delete decoded.iat;
    delete decoded.exp;
    const newAccessToken = generateAccessToken(decoded);

    res.status(HTTP_STATUS_CODE.OK).send({ isTokenResfreshed: true, accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

/*
  this signup controller is quite short since
  important verifications are made in
  previous called middlewares.
*/
async function register(req: Request, res: Response, next: NextFunction) {
  const { username, email, password } = req.body;
  /*
  registerUser.checkDuplicateUsernameOrEmail: check if the user is NOT already registered.
  registerUser.checkDuplicateProductKey: check if the pk is stored -> req.checks.productKeyDoc
  registerUser.checkRoleExisted: check if the role exists -> req.checks.roleDoc
  */
  const { productKeyDoc, roleDoc } = req.checks;
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
  res
    .status(HTTP_STATUS_CODE.OK)
    .cookie("refreshToken", refreshToken, {
      expires: calculateCookieExpiration(),
      httpOnly: true,
      signed: true,
    })
    .send({
      isRegistered: true,
      user: user.toResponseJson({ roleName: roleDoc.name }, true, {}),
      accessToken,
    });
};

async function signInWithEmail(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);

  if (!user) {
    return next(new HTTPError(
      "USER_NOT_FOUND",
      `You're not registered as a user based on the email.`,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}))
  }
  // check password
  const isValidPassword = await user.checkPassword(password);
  if (!isValidPassword) {
    return next(new HTTPError(
      "INVALID_PASSWORD",
      `You're not registered as a user based on the password.`,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}))
  }
  // retrieve token
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // save refreshToken into user
  user.refreshToken = refreshToken;
  await user.save();

  const roleDoc = await Role.findById(user.role);

  if (!roleDoc) {
    return next(new HTTPError(
      "ROLE_NOT_FOUND",
      `It seems like the role linked to your credentials is incorrect.`,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}))
  }

  res
    .status(HTTP_STATUS_CODE.OK)
    .cookie("refreshToken", refreshToken, {
      expires: calculateCookieExpiration(),
      httpOnly: true,
      signed: true,
    })
    .send({
      isSignedIn: true,
      user: user.toResponseJson({ roleName: roleDoc.name }, true, {}),
      accessToken,
    });
};

async function signInWithProductKey(req: Request, res: Response, next: NextFunction) {
  const {
    isKeyInvalid,
    isStored,
    isInUse,
    isInUseMsg,
    isLinkedToUser,
    linkedUser,
    error,
  } = await checkProductKey(req.body.productKey);

  if (isKeyInvalid) {
    return next(new HTTPError(
      "INVALID_FORMAT_FOR_PRODUCT_KEY",
      `Your product key has an invalid format.`,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}))
  }

  if (error) {
    return next(new HTTPError(
      "ERROR_WHEN_CHECK_PRODUCT_KEY",
      error,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}))
  }

  if (!isStored) {
    return next(new HTTPError(
      "UNFOUND_PRODUCT_KEY",
      `The given product key is unfound.`,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}))
  }

  if (!isInUse) {
    return next(new HTTPError(
      "PRODUCT_KEY_NOT_LINKED",
      isInUseMsg? isInUseMsg: "This product key is linked to no user",
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}))
  }

  if (!isLinkedToUser || !linkedUser) {
    return next(new HTTPError(
      "UNFOUND_USER_LINKED_TO_PRODUCT_KEY",
      "This product key is linked to no user",
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}))
  }

  // --- Check for the role and if it's okay add it to the response
  const accessToken = generateAccessToken(linkedUser);
  const refreshToken = generateRefreshToken(linkedUser);

  // save refreshToken into user
  linkedUser.refreshToken = refreshToken;
  await linkedUser.save();

  const roleDoc = await Role.findById(linkedUser.role).lean();

  if (!roleDoc) {
    return next(new HTTPError(
      "INVALID_ROLE_FROM_USER",
      `You're not registered as a user with a valid role.`,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}))
  }

  return res
    .status(HTTP_STATUS_CODE.OK)
    .cookie("refreshToken", refreshToken, {
      expires: calculateCookieExpiration(),
      httpOnly: true,
      signed: true,
    })
    .send({
      isSignedIn: true,
      user: linkedUser.toResponseJson({ roleName: roleDoc.name }, true, {}),
      accessToken,
    });

};
/*
signInWithExistingCookie: no useful since we have in middelware authentificateToken
*/

async function signOut(req: Request, res: Response, next: NextFunction) {
  //
  const refreshToken = req.signedCookies?.refreshToken;

  if (!refreshToken) {
    return next(new HTTPError(
      "MISSING_TOKEN",
      `The following token is necessary to sign out: refreshToken.`,
      HTTP_STATUS_CODE.NOT_IMPLEMENTED,
      {}))
  }

  const user = await User.findOne({ refreshToken });
  if (user) {
    // delete refreshToken in database
    user.refreshToken = "";
    await user.save();
  }

  // send response
  return res
    .status(HTTP_STATUS_CODE.OK)
    .clearCookie("refreshToken", {
      httpOnly: true,
      signed: true,
    })
    .send({
      isSignedOut: true,
      message: "SIGN_OUT",
    });
};

export default {
  refreshToken: asyncHelper(refreshToken),
  register: asyncHelper(register),
  signInWithEmail: asyncHelper(signInWithEmail),
  signInWithProductKey: asyncHelper(signInWithProductKey),
  signOut: asyncHelper(signOut),
};
