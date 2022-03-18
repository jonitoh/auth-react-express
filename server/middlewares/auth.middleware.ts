import { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongoose';
import db from '../models';
import { IRoleDocument } from '../schemas/role/role.types';
import { HTTP_STATUS_CODE } from '../utils/main';
import { HTTPError } from '../utils/error/http-error';
import { asyncMiddlewareHelper, AsyncMiddleware } from '../utils/express';

const { Role } = db;

function hasRole(roleName: string | string[], shouldInclude = true): AsyncMiddleware {
  return async function middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    // console.info("in hasRoles");
    let names: string[] = [];
    if (typeof roleName === 'string') {
      names = [roleName];
    }
    if (roleName instanceof Array) {
      names = roleName;
    }
    // check if the role exists
    const allRoles: IRoleDocument[] = await Role.allRoles();
    const roles: string[] = allRoles
      .filter(({ name }): boolean => (shouldInclude ? names.includes(name) : !names.includes(name)))
      .map((role: IRoleDocument): string => (role._id as ObjectId).toString());
    if (!roles.length) {
      return next(
        new HTTPError(
          'UNFOUND_ROLE',
          `The following mandatory roles asked doesn't exist: [${names.toString()}]`,
          HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
          {}
        )
      );
    }
    const { roleId } = req.checks;

    if (roleId && roles.includes(roleId)) {
      // console.info("about to next from hasRole");
      return next();
    }

    return next(
      new HTTPError(
        'UNAUTHORIZED',
        `You don't have one of the mandatory roles to access the ressource`,
        HTTP_STATUS_CODE.FORBIDDEN,
        {}
      )
    );
  };
}

function hasAtLeastLevel(level: number): AsyncMiddleware {
  return async function middleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    // console.info("in hasAtLeastLevel");

    const { roleId } = req.checks;

    const role = await Role.findById(roleId);

    if (!role) {
      return next(
        new HTTPError(
          'UNFOUND_ROLE',
          `The given role doesn't exist`,
          HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
          {}
        )
      );
    }
    if (role.level >= level) {
      // console.info("about to next from hasAtLeastLevel");
      return next();
    }
    return next(
      new HTTPError(
        'UNAUTHORIZED',
        `You don't have one of the mandatory roles to access the ressource`,
        HTTP_STATUS_CODE.FORBIDDEN,
        {}
      )
    );
  };
}

export default {
  hasRole: (roleName: string | string[], shouldInclude = true) =>
    asyncMiddlewareHelper(hasRole(roleName, shouldInclude)),
  hasAtLeastLevel: (level: number) => asyncMiddlewareHelper(hasAtLeastLevel(level)),
};
