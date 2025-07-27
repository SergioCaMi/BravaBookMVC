import { Router } from 'express';
import { requireAuth, requireAdmin, requireSuperAdmin } from '../middlewares/auth.js';
import * as adminController from '../controllers/admin.controller.js';
import { uploadApartmentImages } from '../middlewares/uploadApartments.js'; 
import { uploadNewApartmentTempImages  } from '../middlewares/uploadApartments.js'; 
import {
  validateApartment,
  validateReservation,
  validateUserUpdate,
  validateMongoId,
  handleValidationErrors
} from '../middlewares/validation.js';

const router = Router();

//  Rutas de Usuarios 

// Dashboard del administrador
router.get('/dashboard', requireAuth, requireAdmin, adminController.dashboard);

// Panel de control principal del administrador
router.get('/', requireAuth, requireAdmin, adminController.getAdminPanel);

// Editar perfil de usuario (GET)
router.get('/profile/edit', requireAuth, requireAdmin, adminController.getEditProfile);
// Editar perfil de usuario (POST)
router.post('/profile/update', validateUserUpdate, handleValidationErrors, requireAuth, requireAdmin, adminController.postUpdateProfile);

// Ver todos los usuarios (SUPER ADMIN)
router.get('/users', requireAuth, requireAdmin, requireSuperAdmin, adminController.getUsers);

// Eliminar usuario (SUPER ADMIN)
router.post('/user/delete/:id', validateMongoId('id'), handleValidationErrors, requireAuth, requireAdmin, requireSuperAdmin, adminController.postDeleteUser);

// Alternar rol de usuario (SUPER ADMIN)
router.post('/user/toggle-role/:id', validateMongoId('id'), handleValidationErrors, requireAuth, requireAdmin, requireSuperAdmin, adminController.postToggleUserRole);

//  Rutas de Reservas 

// Ver todas las reservas
router.get('/reservations', requireAuth, requireAdmin, adminController.getReservations);

//  Rutas de Apartamentos 

// Formulario para crear nuevo apartamento
router.get("/apartment/new", requireAuth, requireAdmin, adminController.getNewApartment);

// Enviar formulario de nuevo apartamento (con subida temporal de fotos)
router.post("/apartment/new", uploadNewApartmentTempImages.any(), validateApartment, handleValidationErrors, adminController.postNewApartment);

//  Rutas Dinámicas

// Formulario para editar un apartamento existente
router.get("/apartments/edit/:id", validateMongoId('id'), handleValidationErrors, requireAuth, requireAdmin, adminController.getApartmentEdit);

// Enviar formulario de edición de apartamento 
router.post("/apartment/edit/:id/save", validateMongoId('id'), requireAuth, requireAdmin, uploadApartmentImages.fields([{ name: 'apartmentPhotos'},]), validateApartment, handleValidationErrors, adminController.putApartmentEdit);

// Cancelar una reserva
router.post("/reservations/delete/:id", validateMongoId('id'), handleValidationErrors, requireAuth, requireAdmin, adminController.postCancelReservation);

// Confirmar una reserva
router.post("/reservations/confirm/:id", validateMongoId('id'), handleValidationErrors, requireAuth, requireAdmin, adminController.postConfirmReservation);

// Marcar una reserva como pagada
router.post("/reservations/mark-paid/:id", validateMongoId('id'), handleValidationErrors, requireAuth, requireAdmin, adminController.postMarkPaidReservation);

// Formulario para editar una reserva
router.get("/reservation/edit/:id", validateMongoId('id'), handleValidationErrors, requireAuth, requireAdmin, adminController.getReservationEdit);

// Enviar formulario de edición de reserva
router.post("/reservation/edit/:id", validateMongoId('id'), validateReservation, handleValidationErrors, requireAuth, requireAdmin, adminController.putReservationEdit);

// Borrar un apartamento
router.post("/apartments/delete/:id", validateMongoId('id'), handleValidationErrors, requireAuth, requireAdmin, adminController.postDeleteApartment);

// Activar/desactivar un apartamento
router.post("/apartments/active/:id", validateMongoId('id'), handleValidationErrors, requireAuth, requireAdmin, adminController.postActiveApartment);

// Ver todos los apartamentos (administrador)
router.get("/apartments", requireAuth, requireAdmin, adminController.getAllApartments);

export default router;