module.exports = {
  HOST: process.env.DB_HOST || "localhost",
  PORT: process.env.DB_PORT || 27017,
  DB: process.env.DB_NAME || "auth_db",
  URI: process.env.DB_URI || "mongodb://localhost:27017/auth_db",
};
