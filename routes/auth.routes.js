import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { validateUserRegistration, validateUserLogin, validateUserUpdate, handleValidationErrors } from "../middlewares/validation.js";

const router = Router();

// ********** Rutas de Usuario **********

// Registro de usuario (GET)
router.get("/register", (req, res) => res.render("register", { title: "home" }));
// Registro de usuario (POST)
router.post("/register", validateUserRegistration, handleValidationErrors, authController.register);

// Inicio de sesión (GET)
router.get("/login", (req, res) => res.render("login", { title: "home" }));
// Inicio de sesión (POST)
router.post("/login", validateUserLogin, handleValidationErrors, authController.login);

// Cierre de sesión
router.get("/logout", authController.logout);

// Dashboard de usuario
router.get("/dashboard", requireAuth, authController.dashboard);

// Página de contacto
router.get("/contact", authController.getContactUs);

// Página "Acerca de nosotros"
router.get("/about", authController.getAboutUs);

// Editar perfil de usuario (GET)
router.get("/profile/edit", requireAuth, authController.getEditProfile);
// Editar perfil de usuario (POST)
router.post("/profile/update", upload.single("avatar"), validateUserUpdate, handleValidationErrors, requireAuth, authController.postUpdateProfile);

// ********** Rutas de Apartamentos **********

// Obtener todos los apartamentos
router.get("/", authController.getAllApartments);

// Buscar apartamentos
router.get("/apartments/search", authController.getApartmentSearch);

// Ver apartamentos
router.get("/seeApartments", authController.getSeeApartments);

// Mapa de apartamentos
router.get("/map", authController.getMap);

// Búsqueda de apartamentos
router.post("/apartments/search", authController.searchApartments);

// ********** Rutas de Reservas **********

// Crear nueva reserva
router.post("/reservations/new-reservation", authController.postNewReservation);

// ********** Rutas con dinámicas **********

// Obtener apartamento por ID
router.get("/apartments/:id", authController.getApartmentById);

// Obtener reserva por ID
router.get("/reservation/:id", requireAuth, authController.getReservationsById);

export default router;
