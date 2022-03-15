import { ObjectId } from 'mongoose';
import jwt, { TokenExpiredError, JwtPayload } from 'jsonwebtoken';
import { HTTPError } from 'utils/error/http-error';
import { HTTP_STATUS_CODE, isLike } from 'utils/main';
import authConfig from './auth.config';

type PotentialUser = { role: ObjectId | string; _id: ObjectId | string };
type AnotherPotentialUser = { role: ObjectId | string; id: ObjectId | string };
type ToBeSignedPayload = { role: string; id: string };
interface DecodedPayload extends JwtPayload, ToBeSignedPayload {}

function generatePayload(user: unknown): ToBeSignedPayload {
  if (isLike<PotentialUser>(user, ['role', '_id'])) {
    return { role: user.role.toString(), id: user._id.toString() };
  }
  if (isLike<AnotherPotentialUser>(user, ['role', 'id'])) {
    return { role: user.role.toString(), id: user.id.toString() };
  }
  throw new HTTPError(
    'INVALID_FORMAT_TO_GENERATE_PAYLOAD',
    `The attributes (id, role) or (_id, role) are necessary to generate a valid payload.`,
    HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
    {}
  );
}

function generateAccessToken(user: unknown): string {
  const payload: ToBeSignedPayload = generatePayload(user);
  const token = jwt.sign(payload, authConfig.ACCESS_TOKEN_SECRET, {
    expiresIn: authConfig.ACCESS_TOKEN_EXPIRATION,
  });
  return token;
}

function generateRefreshToken(user: unknown): string {
  const payload: ToBeSignedPayload = generatePayload(user);
  const token = jwt.sign(payload, authConfig.REFRESH_TOKEN_SECRET, {
    expiresIn: authConfig.REFRESH_TOKEN_EXPIRATION,
  });
  return token;
}

const calculateCookieExpiration = (value: number = authConfig.COOKIE_EXPIRATION): Date =>
  new Date(Date.now() + value);

const generateHeaderFromToken = (token: string): string => `Bearer ${token}`;

const extractTokenFromHeader = (header: string | undefined): string | undefined =>
  header?.startsWith('Bearer ') ? header.split(' ')[1] : undefined;

function verifyAccessToken(token: string): DecodedPayload {
  try {
    return jwt.verify(token, authConfig.ACCESS_TOKEN_SECRET) as DecodedPayload;
  } catch (error) {
    console.error(error);
    if (error instanceof TokenExpiredError) {
      throw new HTTPError(
        'EXPIRED_TOKEN',
        `The following token has been expired: accessToken.`,
        HTTP_STATUS_CODE.UNAUTHORIZED,
        {}
      );
    }
    throw new HTTPError(
      'DENIED_TOKEN',
      `The following token has been denied: accessToken.`,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}
    );
  }
}

function verifyRefreshToken(token: string): DecodedPayload {
  try {
    return jwt.verify(token, authConfig.REFRESH_TOKEN_SECRET) as DecodedPayload;
  } catch (error) {
    console.error(error);
    if (error instanceof TokenExpiredError) {
      throw new HTTPError(
        'EXPIRED_TOKEN',
        `The following token has been expired: refreshToken.`,
        HTTP_STATUS_CODE.UNAUTHORIZED,
        {}
      );
    }
    throw new HTTPError(
      'DENIED_TOKEN',
      `The following token has been denied: refreshToken.`,
      HTTP_STATUS_CODE.UNAUTHORIZED,
      {}
    );
  }
}

export {
  DecodedPayload,
  generateAccessToken,
  generateRefreshToken,
  calculateCookieExpiration,
  generateHeaderFromToken,
  extractTokenFromHeader,
  verifyAccessToken,
  verifyRefreshToken,
};
