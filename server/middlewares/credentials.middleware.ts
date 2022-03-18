import { Request, Response, NextFunction } from 'express';
import allowedOrigins from '../config/allowed-origins.config';

function checkHeader(req: Request, res: Response, next: NextFunction): void {
  const { origin } = req.headers;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  res.header('Content-Type', 'application/json;charset=UTF-8');
  res.header('Access-Control-Allow-Headers', 'Authorization, Origin, Content-Type, Accept');
  next();
}

export default { checkHeader };
