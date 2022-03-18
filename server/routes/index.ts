import { Router } from 'express';
import middlewares from '../middlewares';
import { getRouter as getAuthRouter } from './auth.route';
import { getRouter as getProductKeyRouter } from './product-key.route';
import { getRouter as getUserRouter } from './user.route';

function getRoutes(): Router {
  // Initiate express router
  const router: Router = Router();

  // Implement routes
  // --> routes for authorization
  router.use('/auth', getAuthRouter());
  // add middleware to secure the following routes
  router.use(middlewares.verifyJwt.authentificateAccessToken);
  // --> routes for product Key management
  router.use('/product-key', getProductKeyRouter());
  // --> routes for user management
  router.use('/user', getUserRouter());

  return router;
}

export { getRoutes };
