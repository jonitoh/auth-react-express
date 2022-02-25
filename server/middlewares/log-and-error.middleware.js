const { v4: uuid } = require("uuid");
const path = require("path");
const fs = require("fs");
const { formatDate } = require("../utils.js");

const fileLogger = (message, logName) => {
  // create directory if necessary
  const logDir = path.join(__dirname, "..", "logs");
  fs.mkdir(logDir, { recursive: true }, (err, pth) => {
    if (err) console.log("err on logDir path", err);
    //console.log(`folder already exists ? ${pth ? `true at ${pth}` : "false"}`);
  });

  const dateTime = formatDate(new Date());
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
  const filepath = path.join(logDir, logName);
  fs.appendFile(filepath, logItem, (err) => {
    if (err) console.log("err when appending new log", err);
  });
};

const logHandler = (req, res, next) => {
  const message = `${req.method}\t${req.headers.origin}\t${req.url}`;
  fileLogger(message, "reqLog.txt");
  console.log(`METHOD=${req.method} SERVICEURL=${req.path}`);
  next();
};

const errorHandler = (err, req, res, next) => {
  const message = `${err.name}: ${err.message}`;
  fileLogger(message, "errLog.txt");
  console.error(err.stack);
  res.status(500).send({ message: err.message });
};

module.exports = { fileLogger, logHandler, errorHandler };
