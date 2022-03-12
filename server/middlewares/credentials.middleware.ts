import { Request, Response, NextFunction } from "express";
import allowedOrigins from "config/allowed-origins.config";


const checkHeader = (req: Request, res: Response, next: NextFunction) => {
  const origin: string|undefined = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", "true");
  }
  // TODO: still necessary ?
  res.header("Content-Type", "application/json;charset=UTF-8");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, Origin, Content-Type, Accept"
  );
  next();
};

export default { checkHeader };
