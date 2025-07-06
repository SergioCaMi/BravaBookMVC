
import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// Sesiones de usuarios
router.get('/register', (req, res) => res.render('register', {title: "home"}));
router.post('/register', authController.register);

router.get('/login', (req, res) => res.render('login', {title: "home"}));
router.post('/login', authController.login);

router.get('/logout', authController.logout);
router.get('/dashboard', requireAuth, authController.dashboard);

// Rutas para todos
router.get('/', authController.getHome);



export default router;

