module.exports = {
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRATION: process.env.ACCESS_TOKEN_EXPIRATION || 3600, // 1 hour
  REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION || 86400, // 24 hours
  /* for test */
  // ACCESS_TOKEN_EXPIRATION: 60,          // 1 minute
  // REFRESH_TOKEN_EXPIRATION: 120,  // 2 minutes
  COOKIE_EXPIRATION: process.env.COOKIE_EXPIRATION || 0, // en milliseconds //  8 * 3600000: cookie will be removed after 8 hours
};
