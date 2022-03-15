import { Request, Response, NextFunction } from 'express';
import db from 'models';
import { IRoleDocument } from 'schemas/role/role.types';
import { HTTPError } from 'utils/error/http-error';
import { HTTP_STATUS_CODE } from 'utils/main';
import { asyncHelper } from 'utils/express';

const { Role } = db;

function hasRole(roleName: string | string[], shouldInclude: boolean = true) {
  return async function middleware(req: Request, res: Response, next: NextFunction) {
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
      .map(({ _id }): string => _id.toString());
    if (!roles.length) {
      return next(
        new HTTPError(
          'UNFOUND_ROLE',
          `The following mandatory roles asked doesn't exist: ${names}`,
          HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
          {}
        )
      );
    }
    const { roleId } = req.checks;

    if (roles.includes(roleId)) {
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

function hasAtLeastLevel(level: number) {
  return async function middleware(req: Request, res: Response, next: NextFunction) {
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
  hasRole: (roleName: string | string[], shouldInclude: boolean = true) =>
    asyncHelper(hasRole(roleName, shouldInclude)),
  hasAtLeastLevel: (level: number) => asyncHelper(hasAtLeastLevel(level)),
};
