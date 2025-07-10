
import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import {upload} from '../middlewares/uploadMiddleware.js';

const router = Router();

// ********** USER  ********** 

// Register
router.get('/register', (req, res) => res.render('register', {title: "home"}));
router.post('/register', authController.register);

// LogIn
router.get('/login', (req, res) => res.render('login', {title: "home"}));
router.post('/login', authController.login);

// LogOut
router.get('/logout', authController.logout);

// Dashboard
router.get('/dashboard', requireAuth, authController.dashboard);

// ContactUs
router.get('/contact', authController.getContactUs);

// AboutUs
router.get('/about', authController.getAboutUs);

// Editar profile
router.get('/profile/edit', requireAuth, authController.getEditProfile);
router.post('/profile/update', upload.single('avatar'), requireAuth, authController.postUpdateProfile);


//  ******************** APARTAMENTOS ******************** 

// GET All Apartments
router.get('/', authController.getAllApartments);

// GET Apartment Search
router.get('/apartments/search', authController.getApartmentSearch);


// GET see Apartments
router.get('/seeApartments', authController.getSeeApartments);

//  ******************** RESERVAS ******************** 
// POST New Reservation
router.post("/reservations/new-reservation", authController.postNewReservation);



//  ******************** PARAMS ******************** 
// GET Apartment By Id=> :id => Siempre al final
router.get('/apartments/:id', authController.getApartmentById);

// GET Reservation By Id=> :id => Siempre al final
router.get('/reservation/:id', requireAuth, authController.getReservationsById);


export default router;

