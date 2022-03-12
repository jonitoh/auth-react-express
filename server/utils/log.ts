import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";
import { formatDate } from "./main";

function handleErrorForLog<T>(error: T extends Error ? T : never, priorMessage: string = "", useStrictMode: boolean = false): void {
  if (priorMessage) {
    console.error(priorMessage);
  }
  console.error(`Error ${error}\n${error.stack}`);
  if (useStrictMode) {
    process.exitCode = 2;
    throw error;
  }
};

function fileLogger(message: string, logName: string): void {
  // create directory if necessary
  const logDir: string = path.join(__dirname, "..", "logs");
  fs.mkdir(logDir, { recursive: true }, (err) => {
    if (err) console.error("error on logDir path", err);
  });

  const dateTime: string = formatDate(new Date());
  const logItem: string = `${dateTime}\t${uuid()}\t${message}\n`;
  const filepath: string = path.join(logDir, logName);
  fs.appendFile(filepath, logItem, (err) => {
    if (err) console.error("err when appending new log", err);
  });
};

export { handleErrorForLog, fileLogger };
