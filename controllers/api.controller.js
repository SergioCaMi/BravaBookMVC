import Apartment from "../models/apartment.model.js";
import Reservation from "../models/reservation.model.js";


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
