const jwt = require("jsonwebtoken");
const authConfig = require("./auth.config");

const generateAccessToken = (user) => {
  const role = user.role; // role here is an ID
  const id = user._id || user.id;
  const token = jwt.sign({ id, role }, authConfig.ACCESS_TOKEN_SECRET, {
    expiresIn: authConfig.ACCESS_TOKEN_EXPIRATION,
  });
  return token;
};

const generateRefreshToken = (user) => {
  const role = user.role; // role here is an ID
  const id = user._id || user.id;
  const token = jwt.sign({ id, role }, authConfig.REFRESH_TOKEN_SECRET, {
    expiresIn: authConfig.REFRESH_TOKEN_EXPIRATION,
  });
  return token;
};

const _calculateCookieExpiration = (value) =>
  !value || value == 0 ? 0 : new Date(Date.now() + value);

const calculateCookieExpiration = () =>
  _calculateCookieExpiration(authConfig.COOKIE_EXPIRATION);

const generateHeaderFromToken = (token) => `Bearer ${token}`;

const extractTokenFromHeader = (header) =>
  header?.startsWith("Bearer ") ? header?.split(" ")[1] : undefined;

const verifyAccessToken = (token, callback) => {
  jwt.verify(token, authConfig.ACCESS_TOKEN_SECRET, callback);
};

const verifyRefreshToken = (token, callback) => {
  jwt.verify(token, authConfig.REFRESH_TOKEN_SECRET, callback);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  calculateCookieExpiration,
  generateHeaderFromToken,
  extractTokenFromHeader,
  verifyAccessToken,
  verifyRefreshToken,
};
