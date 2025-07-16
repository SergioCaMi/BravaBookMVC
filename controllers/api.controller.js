import Apartment from "../models/apartment.model.js";
import mongoose from "mongoose";

// --- API Principal ---
// Muestra una lista de endpoints disponibles de la API.
export const getApi = async (req, res) => {
  const options = [
    {
      name: "Obtener todos los apartamentos",
      description: "Obtiene una lista de todos los apartamentos disponibles.",
      endpoint: "/apartments",
      method: "GET",
    },
    {
      name: "Buscar apartamentos por id",
      description: "Obtiene un apartamento especificado por su id.",
      endpoint: "/apartments/:id",
      method: "GET",
    },
    {
      name: "Buscar servicios de un apartamento por id",
      description:
        "Buscar los servicios que tiene un apartamentos en concreto especificado por su id.",
      endpoint: "/apartments/services/:id",
      method: "GET",
    },
    {
      name: "Buscar apartamentos por precio máximo",
      description:
        "Obtiene una lista de apartamentos con un precio máximo especificado.",
      endpoint: "/apartments/search?maxPrice={maxPrice}",
      method: "GET",
    },
  ];
  res.json(options);
};

// --- Obtener Todos los Apartamentos ---
// Devuelve todos los apartamentos activos, ordenados por precio descendente.
export const getApiApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find({ active: true }).sort({
      price: -1,
    });
    res.json({ apartments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Obtener Apartamento por ID ---
// Devuelve un apartamento específico dado su ID.
export const getApartmentById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "ID inválido",
      status: 400,
    });
  }
  try {
    const apartment = await Apartment.findById(id);
    if (!apartment) {
      return res.status(404).json({ error: "Apartment not found" });
    }
    res.json({ apartment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Obtener Servicios de Apartamento por ID ---
// Devuelve los servicios de un apartamento específico dado su ID.
export const getServicesApartmentById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "ID inválido",
      status: 400,
    });
  }
  try {
    const apartment = await Apartment.findById(id);
    if (!apartment) {
      return res.status(404).json({ error: "Apartment not found" });
    }
    const services = apartment.services;
    res.json({ services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Buscar Apartamentos por Precio Máximo ---
// Devuelve apartamentos con un precio igual o inferior al `maxPrice` especificado.
export const getApartmentsSearchPrice = async (req, res) => {
  
  const { maxPrice } = req.query;
  console.log(maxPrice); // Log para depuración
  if (!maxPrice || isNaN(Number(maxPrice))) {
    return res.status(400).json({ error: "maxPrice must be a valid number" });
  }

  try {
    const apartments = await Apartment.find({
      price: { $lte: Number(maxPrice) }, // $lte: less than or equal to
    });
    res.json({ apartments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};