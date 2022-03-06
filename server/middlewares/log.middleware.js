const { fileLogger } = require("../utils/log");

const logHandler = (req, res, next) => {
  const message = `${req.method}\t${req.headers.origin}\t${req.url}`;
  fileLogger(message, "reqLog.txt");
  console.log(`METHOD=${req.method} SERVICE=${req.path}`);
  next();
};

const errorHandler = (err, req, res, next) => {
  const message = `${err.name}: ${err.message}`;
  fileLogger(message, "errLog.txt");
  console.error(err.stack);
  next(err);
};

module.exports = { logHandler, errorHandler };
