import express from 'express';
import * as apiController from '../controllers/api.controller.js';

const router = express.Router();

// --- Rutas de la API ---

// Endpoint raíz de la API (para obtener todos los apartamentos en formato JSON)
router.get('/', apiController.getApi);

// Endpoint específico para obtener todos los apartamentos en formato JSON
router.get('/apartments', apiController.getApiApartments);

// Endpoint para buscar apartamentos con precios máximos en formato JSON
router.get('/apartments/search', apiController.getApartmentsSearchPrice);

// Endpoint para obtener un apartamento específico por ID en formato JSON
router.get('/apartments/:id', apiController.getApartmentById);

// Endpoint para obtener los servicios de un apartamento específico por ID en formato JSON
router.get('/apartments/services/:id', apiController.getServicesApartmentById);

export default router;