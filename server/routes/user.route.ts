import { Router } from 'express';
import middlewares from '../middlewares';
import controller from '../controllers/user.controller';

const { verifyRoles } = middlewares;

function getRouter(): Router {
  // Initiate express router
  const router: Router = Router();

  router.get('/info/:userId', verifyRoles.hasRole('moderator'), controller.getInfo);

  router.get('/info', verifyRoles.hasRole(['moderator', 'admin']), controller.getAllInfo);

  router.get('/access', controller.getAllAccess);

  router.get('/', verifyRoles.hasAtLeastLevel(1), controller.getUserStats);

  router.delete('/:userId', verifyRoles.hasRole('moderator'), controller.deleteUser);

  router.post('/', verifyRoles.hasRole('moderator'), controller.updateUser);

  router.get('/mod', verifyRoles.hasRole('moderator'), controller.getModeratorStats);

  router.get('/admin', verifyRoles.hasRole('admin'), controller.getAdminStats);

  return router;
}

export { getRouter };
