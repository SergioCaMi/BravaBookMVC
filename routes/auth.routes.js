
import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import {upload} from '../middlewares/uploadMiddleware.js';

const router = Router();

// ********** USSER  ********** 

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

// Home
router.get('/', authController.getHome);

// ContactUs
router.get('/contact', authController.getContactUs);

// AboutUs
router.get('/about', authController.getAboutUs);

// Editar profile
router.get('/profile/edit', requireAuth, authController.getEditProfile);
router.post('/profile/update', upload.single('avatar'),  requireAuth,  authController.postUpdateProfile);


export default router;

