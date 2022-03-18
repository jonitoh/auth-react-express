import { Request, Response, NextFunction } from 'express';
import {
  DecodedPayload,
  extractTokenFromHeader,
  verifyAccessToken,
  verifyRefreshToken,
} from '../config/jwt.config';
import { HTTPError } from '../utils/error/http-error';
import { HTTP_STATUS_CODE, TypeLike } from '../utils/main';

function authentificateAccessToken(req: Request, res: Response, next: NextFunction): void {
  // console.info("into authentificateAccessToken");
  const authHeader: string | undefined = req.headers.authorization;
  const token: string | undefined = extractTokenFromHeader(authHeader);
  if (!token) {
    return next(
      new HTTPError(
        'NO_TOKEN_PROVIDED',
        `The following token has not been found: accessToken.`,
        HTTP_STATUS_CODE.UNAUTHORIZED,
        {}
      )
    );
  }

  try {
    const decoded: DecodedPayload = verifyAccessToken(token);
    req.checks = {
      ...req.checks,
      userId: decoded.id,
      roleId: decoded.role,
    };
    // console.info("about to next from authentificateAccessToken");
    return next();
  } catch (error) {
    // In case of expired jwt or invalid token kill the token and clear the cookie
    // res.clearCookie("refreshToken");
    return next(error);
  }
}

function authentificateRefreshToken(req: Request, res: Response, next: NextFunction): void {
  // console.info("into authentificateRefreshToken");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { refreshToken }: { refreshToken: TypeLike } = req.signedCookies;
  if (!refreshToken) {
    return next(
      new HTTPError(
        'NO_TOKEN_PROVIDED',
        `The following token has not been found: refreshToken.`,
        HTTP_STATUS_CODE.UNAUTHORIZED,
        {}
      )
    );
  }
  try {
    const decoded: DecodedPayload = verifyRefreshToken(refreshToken);
    req.checks = {
      ...req.checks,
      userId: decoded.id,
      roleId: decoded.role,
    };
    // console.info("about to next from authentificateAccessToken");
    return next();
  } catch (error) {
    // In case of expired jwt or invalid token kill the token and clear the cookie
    res.clearCookie('refreshToken');
    return next(error);
  }
}

export default {
  authentificateAccessToken,
  authentificateRefreshToken,
};
