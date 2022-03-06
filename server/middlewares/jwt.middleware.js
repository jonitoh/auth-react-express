const jwt = require("jsonwebtoken");
const { TokenExpiredError } = jwt;
const {
  extractTokenFromHeader,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../config/jwt.config");
const { handleMessageForResponse } = require("../utils/main.js");

const handleTokenErrorForResponse = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return handleMessageForResponse("EXPIRED_ACCESS_TOKEN", res, 401);
  }
  return handleMessageForResponse("UNAUTHORIZED", res, 401);
};

const authentificateAccessToken = (req, res, next) => {
  console.log("into authentificateAccessToken");
  const authHeader = req.headers.Authorization || req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);
  if (!token) {
    console.log("no freaking token");
    return handleMessageForResponse("NO_TOKEN_PROVIDED", res, 401);
  }
  verifyAccessToken(token, (err, decoded) => {
    if (err) {
      // In case of expired jwt or invalid token kill the token and clear the cookie
      //res.clearCookie("refreshToken");
      return handleTokenErrorForResponse(err, res);
    }
    req.checks = {
      ...req.checks,
      userId: decoded.id,
      roleId: decoded.role,
    };
    console.log("about to next from authentificateAccessToken");
    next();
  });
};

const authentificateRefreshToken = (req, res, next) => {
  const token = req.signedCookies?.refreshToken;
  if (!token) {
    return handleMessageForResponse("NO_TOKEN_PROVIDED", res, 401);
  }
  verifyRefreshToken(token, (err, decoded) => {
    if (err) {
      // In case of expired jwt or invalid token kill the token and clear the cookie
      res.clearCookie("refreshToken");
      return handleTokenErrorForResponse(err, res);
    }
    req.checks = {
      ...req.checks,
      userId: decoded.id,
      roleId: decoded.role,
    };
    console.log("about to next from authentificateRefreshToken");
    next();
  });
};

module.exports = {
  authentificateAccessToken,
  authentificateRefreshToken,
};
