const allowedOrigins = require("../config/allowed-origins.config");

const checkHeader = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", true);
  }
  // TODO: still necessary ?
  res.header("Content-Type", "application/json;charset=UTF-8");
  res.header(
    "Access-Control-Allow-Headers",
    "authorization, Origin, Content-Type, Accept"
  );
  next();
};

module.exports = { checkHeader };
