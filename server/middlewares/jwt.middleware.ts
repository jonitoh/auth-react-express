import { Request, Response, NextFunction } from "express";
import {
  DecodedPayload,
  extractTokenFromHeader,
  verifyAccessToken,
  verifyRefreshToken,
} from "config/jwt.config";
import { HTTPError } from "utils/error";
import { HTTP_STATUS_CODE } from "utils/main";


function authentificateAccessToken(req: Request, res: Response, next: NextFunction) {
  //console.info("into authentificateAccessToken");
  const authHeader: string|undefined = req.headers.authorization;// || req.headers.Authorization
  const token = extractTokenFromHeader(authHeader);
  if (!token) {
    return next(new HTTPError(
      "NO_TOKEN_PROVIDED",
      `The following token has not been found: accessToken.`,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}))
  }

  try {
    const decoded: DecodedPayload = verifyAccessToken(token);
    req.checks = {
      ...req.checks,
      userId: decoded.id,
      roleId: decoded.role,
    };
    //console.info("about to next from authentificateAccessToken");
    next();
  } catch (error) {
    // In case of expired jwt or invalid token kill the token and clear the cookie
    //res.clearCookie("refreshToken");
    next(error)
  }
};

function authentificateRefreshToken(req: Request, res: Response, next: NextFunction) {
  //console.info("into authentificateRefreshToken");
  const token = req.signedCookies?.refreshToken;
  if (!token) {
    return next(new HTTPError(
      "NO_TOKEN_PROVIDED",
      `The following token has not been found: refreshToken.`,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}))
  }
  try {
    const decoded: DecodedPayload = verifyRefreshToken(token);
    req.checks = {
      ...req.checks,
      userId: decoded.id,
      roleId: decoded.role,
    };
    //console.info("about to next from authentificateAccessToken");
    next();
  } catch (error) {
    // In case of expired jwt or invalid token kill the token and clear the cookie
    res.clearCookie("refreshToken");
    next(error)
  }
};

export default {
  authentificateAccessToken,
  authentificateRefreshToken,
};
