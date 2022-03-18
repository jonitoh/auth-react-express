import 'express';
import { IProductKeyDocument } from '../../schemas/product-key/product-key.types';
import { IRoleDocument } from '../../schemas/role/role.types';

declare global {
  namespace Express {
    export interface Request {
      checks: {
        userId?: string;
        roleId?: string;
        productKeyDoc?: IProductKeyDocument;
        roleDoc?: IRoleDocument;
      };
    }
  }
}
