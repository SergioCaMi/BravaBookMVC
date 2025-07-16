import Apartment from "../models/apartment.model.js";
import mongoose from "mongoose";

// endpoint para obtener todos los apartamentos en formato JSON
export const getApiApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find({ active: true })
      .sort({ price: -1 })
      .limit(30);
    res.send( { apartments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// endpoint para obtener apartamentos en formato JSON por :id
export const getApartmentById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("error", {
      message: "ID inválido",
      status: 400,
    });
  }

  try {
    const apartments = await Apartment.findById(id);
        res.status(200).json({ apartments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// endpoint para obtener servicios de apartamentos en formato JSON por :id
export const getServicesApartmentById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("error", {
      message: "ID inválido",
      status: 400,
    });
  }

  try {
    const apartments = await Apartment.findById(id);
    const services =  apartments.services;
        res.status(200).json({ services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
