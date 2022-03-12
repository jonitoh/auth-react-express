import { Request, Response, NextFunction } from "express";

type AsyncMiddleware<T = void> = (req: Request, res: Response, next: NextFunction) => Promise<T>; 

function asyncHelper<T>(fn: AsyncMiddleware<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
}

export {
  asyncHelper,
}