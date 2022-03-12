declare global {
  // augment the `express-serve-static-core` module
  declare module "express-serve-static-core" {
    export interface Request {
      checks : {
        userId: string;
        roleId: string;
        productKeyDoc: import("schemas/product-key/product-key.types").IProductKeyDocument;
        roleDoc: import("schemas/role/role.types").IRoleDocument;
      };
    }
    export interface Application {
      db: import("models/types").DatabaseConnectionType;
    }
  }
}