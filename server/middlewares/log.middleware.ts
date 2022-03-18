import { Request, Response, NextFunction } from 'express';
import { fileLogger } from '../utils/log';
import { HTTPError } from '../utils/error/http-error';
import { isMinimalError } from '../utils/error/main';

function logHandler(req: Request, res: Response, next: NextFunction): void {
  const message = `${req.method}\t${req.headers.origin || 'unknown'}\t${req.url}`;
  fileLogger(message, 'reqLog.txt');
  console.info(`METHOD=${req.method} SERVICE=${req.path}`);
  next();
}

function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction): void {
  let message = '';
  if (error instanceof HTTPError) {
    message = `${error.name}: ${error.fullMessage}`;
  } else if (error instanceof Error) {
    message = `${error.name}: ${error.message}`;
  } else if (isMinimalError(error)) {
    message = `${error.name}: ${error.message}`;
  } else {
    message = `error: Error`;
  }
  fileLogger(message, 'errLog.txt');
  next(error);
}

export default { logHandler, errorHandler };
