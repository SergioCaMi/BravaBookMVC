import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth.js';
import * as adminController from '../controllers/admin.controller.js';
import { uploadApartmentImages } from '../middlewares/uploadApartments.js'; 
import { uploadNewApartmentTempImages  } from '../middlewares/uploadApartments.js'; 
const router = Router();

//  Rutas de Usuarios 

// Dashboard del administrador
router.get('/dashboard', requireAuth, requireAdmin, adminController.dashboard);

// Panel de control principal del administrador
router.get('/', requireAuth, requireAdmin, adminController.getAdminPanel);

// Editar perfil de usuario (GET)
router.get('/profile/edit', requireAuth, requireAdmin, adminController.getEditProfile);
// Editar perfil de usuario (POST)
router.post('/profile/update', requireAuth, requireAdmin, adminController.postUpdateProfile);

// Ver todos los usuarios
router.get('/users', requireAuth, requireAdmin, adminController.getUsers);

//  Rutas de Reservas 

// Ver todas las reservas
router.get('/reservations', requireAuth, requireAdmin, adminController.getReservations);

//  Rutas de Apartamentos 

// Formulario para crear nuevo apartamento
router.get("/apartment/new", requireAuth, requireAdmin, adminController.getNewApartment);

// Enviar formulario de nuevo apartamento (con subida temporal de fotos)
router.post("/apartment/new", uploadNewApartmentTempImages.any(), adminController.postNewApartment);

//  Rutas Dinámicas (con Parámetros :id) 

// Formulario para editar un apartamento existente
router.get("/apartments/edit/:id", requireAuth, requireAdmin, adminController.getApartmentEdit);

// Enviar formulario de edición de apartamento (con subida de fotos y otros campos)
// router.post("/apartment/edit/:id/save", requireAuth, requireAdmin, adminController.putApartmentEdit); 
router.post("/apartment/edit/:id/save", requireAuth, requireAdmin, uploadApartmentImages.fields([{ name: 'apartmentPhotos'},]), adminController.putApartmentEdit);

// Cancelar una reserva
router.post("/reservations/delete/:id", requireAuth, requireAdmin, adminController.postCancelReservation);

// Confirmar una reserva
router.post("/reservations/confirm/:id", requireAuth, requireAdmin, adminController.postConfirmReservation);

// Eliminar un usuario
router.post("/user/delete/:id", requireAuth, requireAdmin, adminController.postDeleteUser);

// Eliminar un apartamento
router.post("/apartments/delete/:id", requireAuth, requireAdmin, adminController.postDeleteApartment);

// Activar/desactivar un apartamento
router.post("/apartments/active/:id", requireAuth, requireAdmin, adminController.postActiveApartment);

// Formulario para editar una reserva
router.get("/reservations/edit/:id", requireAuth, requireAdmin, adminController.getReservationEdit);

// Enviar formulario de edición de reserva
router.post("/reservations/edit/:id", requireAuth, requireAdmin, adminController.putReservationEdit);

export default router;