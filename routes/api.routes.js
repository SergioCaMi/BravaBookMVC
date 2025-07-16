import express from 'express';
import * as apiController from '../controllers/api.controller.js';

const router = express.Router();


// endpoint para obtener todos los apartamentos en formato JSON
router.get('/', apiController.getApi);
// endpoint para obtener todos los apartamentos en formato JSON
router.get('/apartments', apiController.getApiApartments);
// endpoint para obtener apartamentos en formato JSON con preciosa maximos:
router.get('/apartments/search', apiController.getApartmentsSearchPrice);

// endpoint para obtener apartamentos en formato JSON por :id
router.get('/apartments/:id', apiController.getApartmentById);
// endpoint para obtener servicios de apartamentos en formato JSON por :id
router.get('/apartments/services/:id', apiController.getServicesApartmentById);


export default router;