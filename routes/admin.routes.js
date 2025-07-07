
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';
import * as adminController from '../controllers/admin.controller.js';
import {upload} from '../middlewares/uploadMiddleware.js';
const router = Router();

//  ********** ADMIN ********** 

// Dashboard
router.get('/dashboard', requireAuth, requireAdmin, adminController.dashboard);


// Panel de control de Admin
router.get('/', requireAuth, requireAdmin, (req, res) => {
  res.render('adminPanel', {title: "home"}); 
});

// Editar profile
router.get('/profile/edit', requireAuth, requireAdmin, adminController.getEditProfile);
router.post('/profile/update', requireAuth, requireAdmin, adminController.postUpdateProfile);

export default router;
