import express from 'express';
import * as apiController from '../controllers/api.controller.js';

const router = express.Router();

// endpoint para obtener todos los apartamentos en formato JSON
router.get('/apartments', apiController.getApiApartments);

export default router;