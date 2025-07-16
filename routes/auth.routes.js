import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import {upload} from '../middlewares/uploadMiddleware.js';

const router = Router();

// --- Rutas de Usuario ---

// Registro de usuario (GET formulario, POST envío)
router.get('/register', (req, res) => res.render('register', {title: "home"}));
router.post('/register', authController.register);

// Inicio de sesión (GET formulario, POST envío)
router.get('/login', (req, res) => res.render('login', {title: "home"}));
router.post('/login', authController.login);

// Cierre de sesión
router.get('/logout', authController.logout);

// Dashboard de usuario
router.get('/dashboard', requireAuth, authController.dashboard);

// Página de contacto
router.get('/contact', authController.getContactUs);

// Página "Acerca de nosotros"
router.get('/about', authController.getAboutUs);

// Editar perfil de usuario (GET formulario, POST actualización con subida de avatar)
router.get('/profile/edit', requireAuth, authController.getEditProfile);
router.post('/profile/update', upload.single('avatar'), requireAuth, authController.postUpdateProfile);


// --- Rutas de Apartamentos ---

// Obtener todos los apartamentos
router.get('/', authController.getAllApartments);

// Buscar apartamentos
router.get('/apartments/search', authController.getApartmentSearch);

// Ver apartamentos (lista general)
router.get('/seeApartments', authController.getSeeApartments);

// Mapa de apartamentos
router.get('/map', authController.getMap);

// Búsqueda de apartamentos (posiblemente por IA de Gemini)
router.post("/apartments/search", authController.searchApartments);


// --- Rutas de Reservas ---

// Crear nueva reserva
router.post("/reservations/new-reservation", authController.postNewReservation);


// --- Rutas con Parámetros de ID ---

// Obtener apartamento por ID
router.get('/apartments/:id', authController.getApartmentById);

// Obtener reserva por ID (requiere autenticación)
router.get('/reservation/:id', requireAuth, authController.getReservationsById);

export default router;