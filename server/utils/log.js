const { v4: uuid } = require("uuid");
const path = require("path");
const fs = require("fs");
const { formatDate } = require("./main.js");

const handleErrorForLog = (error, priorMessage = "", strictMode = false) => {
  if (priorMessage) {
    console.log(priorMessage);
  }
  console.error(`Error ${error}\n${error.stack}`);
  if (strictMode) {
    process.exitCode = 2;
    throw error;
  }
};

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

module.exports = { handleErrorForLog, fileLogger };
