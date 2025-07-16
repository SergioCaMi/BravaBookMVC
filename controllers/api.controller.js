import Apartment from "../models/apartment.model.js";
import mongoose from "mongoose";

// Home endpoint
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

// Endpoint para obtener todos los apartamentos en formato JSON
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

// Endpoint para obtener apartamentos en formato JSON por :id
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

// Endpoint para obtener servicios de apartamentos en formato JSON por :id
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

// Endpoint para obtener servicios de apartamentos en formato JSON por precio máximo
export const getApartmentsSearchPrice = async (req, res) => {
  
  const { maxPrice } = req.query;
  console.log(maxPrice);
  if (!maxPrice || isNaN(Number(maxPrice))) {
    return res.status(400).json({ error: "maxPrice must be a valid number" });
  }

  try {
    const apartments = await Apartment.find({
      price: { $lte: Number(maxPrice) },
    });
    res.json({ apartments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
