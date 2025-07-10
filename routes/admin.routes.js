
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

// router.get('/reservation', requireAuth, requireAdmin, adminController.getReservations);

//  ******************** APARTAMENTOS ******************** 
// GET new Apartment
router.get("/apartment/new", requireAuth, requireAdmin, adminController.getNewApartment);
// POST new Apartment
router.post("/apartment/new", adminController.postNewApartment);

// ******************** PARAMS ********************
//GET edit apartment
router.get("/apartments/edit/:id", requireAuth, requireAdmin, adminController.getAdminEdit);
//POST edit apartment
router.post("/apartment/edit/:id/save", requireAuth, requireAdmin, adminController.putAdminEdit);

//POST cancel Reservation
router.post("/reservations/delete/:id", requireAuth, requireAdmin, adminController.postCancelReservation);

//POST delete User
router.post("/user/delete/:id", requireAuth, requireAdmin, adminController.postDeleteUser);

//POST delete Apartment
router.post("/apartment/delete/:id", requireAuth, requireAdmin, adminController.postDeleteApartment);





export default router;

