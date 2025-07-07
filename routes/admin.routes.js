
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';
import * as adminController from '../controllers/admin.controller.js';
import {upload} from '../middlewares/uploadMiddleware.js';
const router = Router();

//  ******************** USERS ******************** 

// Dashboard
router.get('/dashboard', requireAuth, requireAdmin, adminController.dashboard);


// Panel de control de Admin
router.get('/', requireAuth, requireAdmin, (req, res) => {
  res.render('adminPanel', {title: "home"}); 
});

// Editar profile
router.get('/profile/edit', requireAuth, requireAdmin, adminController.getEditProfile);
router.post('/profile/update', requireAuth, requireAdmin, adminController.postUpdateProfile);

// Ver todos los usuarios
router.get('/users', requireAuth, requireAdmin, adminController.getUsers);


//  ******************** RESERVAS ******************** 

// Ver todas las reservas
router.get('/reservations', requireAuth, requireAdmin, adminController.getReservations);

export default router;

