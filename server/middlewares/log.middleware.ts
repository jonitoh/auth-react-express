import { Request, Response, NextFunction } from "express";
import { fileLogger } from "utils/log";
import { HTTPError, isMinimalError } from "utils/error";

function logHandler(req: Request, res: Response, next: NextFunction) {
  const message: string = `${req.method}\t${req.headers.origin}\t${req.url}`;
  fileLogger(message, "reqLog.txt");
  console.info(`METHOD=${req.method} SERVICE=${req.path}`);
  next();
};

function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
  let message: string = "";
  //   const message = `${err.name}: ${err.message}`;  
  if (error instanceof HTTPError) {
    message = `${error.name}: ${error.fullMessage}`;
  } else if (error instanceof Error) {
    message = `${error.name}: ${error.message}`;
  } else if (isMinimalError(error)) {
    message = `${error.name}: ${error.message}`;
  } else {
    message = `error: Error`;
  }
  fileLogger(message, "errLog.txt");
  next(error);
};

export default { logHandler, errorHandler };
