import { Request, Response, NextFunction } from 'express';

type AsyncMiddleware<T = void> = (req: Request, res: Response, next: NextFunction) => Promise<T>;
type AsyncController<T = void> = (req: Request, res: Response) => Promise<T>;

function asyncMiddlewareHelper<T = void>(fn: AsyncMiddleware<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the appropriate error middleware handler.
    fn(req, res, next).catch(next);
  };
}
function asyncControllerHelper<T = void>(fn: AsyncController<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res).catch(next);
  };
}

export { asyncControllerHelper, asyncMiddlewareHelper, AsyncController, AsyncMiddleware };
