import mongoose from "mongoose";
import path from "path";
import User from "../models/user.model.js";
import Apartment from "../models/apartment.model.js";
import Reservation from "../models/reservation.model.js";

// ******************** USER ********************
// Registro
export const register = async (req, res) => {
  try {
    console.log("Register");
    const { name, email, password } = req.body;

    // Ya existe?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error_msg", "El correo electrónico ya está en uso.");
      return res.redirect("/register");
    }

    // El primer usuario será admin
    const firstUser = await User.countDocuments();
    const user = new User({
      name,
      email,
      password,
      role: firstUser === 0 ? "admin" : "user",
    });

    await user.save();
    console.log("Usuario guardado:", user);
    req.session.userId = user._id;
    req.flash("success_msg", "Nuevo usuario añadido con éxito.");
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("register", {
      title: "home",
      error: "Error al registrar usuario",
    });
  }
};

// LogIn
export const login = async (req, res) => {
  console.log("Login");

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    req.flash("error_msg", "Credenciales incorrectas.");
    return res.redirect("/login");
  }

  req.session.userId = user._id;
  console.log(user.name);
  res.redirect("/dashboard");
};

// LogOut
export const logout = (req, res) => {
  console.log("LogOut");
  req.session.destroy(() => res.redirect("/"));
};

// DashBoard
export const dashboard = async (req, res) => {
  console.log("Dashboard");
  const user = await User.findById(req.session.userId);
  const reservations = await Reservation.find({
    user: req.session.userId,
  })
    .populate("apartment")
    .limit(10);
  const apartments = await Apartment.find({
    createdBy: req.session.userId,
  }).limit(50);

  res.render("dashboard", { title: "home", user, reservations, apartments });
};

// ContactUs
export const getContactUs = async (req, res) => {
  res.render("contactUs", { title: "contact" });
};
// AboutUs
export const getAboutUs = async (req, res) => {
  res.render("aboutUs", { title: "about" });
};

// GET Editar profile
export const getEditProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect("/login");
    }
    res.status(200).render("editProfile.ejs", { title: "home", user });
  } catch (err) {
    req.flash("error_msg", "Error interno del servidor.");
    return res.redirect("/");
  }
};

// POST Editar profile
export const postUpdateProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;

    if (!name || !email) {
      req.flash(
        "error_msg",
        "Nombre de usuario y correo electrónico son oobligatorios"
      );
      return res.redirect("/profile/edit");
    }

    const updates = { name, email, bio };

    if (req.file) {
      const userEmail = email;
      const userBaseName = userEmail.split("@")[0];
      const avatarPath = path.join("usuarios", userBaseName, "avatar.jpg");

      updates.avatar = avatarPath;
    }

    await User.findByIdAndUpdate(req.session.userId, updates);

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    res.status(500).render("editProfile", {
      title: "Editar perfil",
      user: req.user,
      error: "Hubo un error al guardar los cambios.",
    });
  }
};

// ******************** Apartments ********************
// GET All Apartments
export const getAllApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find({ active: true })
      .sort({ price: -1 })
      .limit(30);
    res.render("home", { title: "home", error: undefined, apartments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET All Apartments
export const getSeeApartments = async (req, res) => {
  let apartments;
  try {
    if (res.locals.currentUser.role == "admin") {
      apartments = await Apartment.find({});
    } else {
      apartments = await Apartment.find({ active: true });
    }
    console.log(apartments.length);
    res.render("seeApartments", {
      title: "home",
      apartments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET Apartment Search
export const getApartmentSearch = async (req, res) => {
  console.log("Query recibida:", req.query);

  const {
    sortPrice,
    minPrice,
    maxPrice,
    maxGuests,
    squareMeters,
    "rules[]": rules,
    "bedsPerRoom[]": bedsPerRoom,
    "services.airConditioning": airConditioning,
    "services.heating": heating,
    "services.accessibility": accessibility,
    "services.television": television,
    "services.kitchen": kitchen,
    "services.internet": internet,
    dateRange,
    // startDate,
    // endDate,
  } = req.query;

  const query = { active: true };
  const provinceName = req.query.province?.nm?.trim();
  const cityName = req.query.municipality?.nm?.trim();

  // *** Provincia (location.province.nm) ***
  if (provinceName) {
    query["location.province.nm"] = {
      $regex: provinceName,
      $options: "i",
    };
  }
  // *** Ciudad/Municipio (location.municipality.nm) ***
  if (cityName) {
    query["location.municipality.nm"] = {
      $regex: cityName,
      $options: "i",
    };
  }

  // *** Precio mínimo y máximo ***
  if (minPrice) {
    query.price = { ...query.price };
    if (!isNaN(Number(minPrice))) query.price.$gte = Number(minPrice);
  }
  if (maxPrice) {
    query.price = { ...query.price };
    if (!isNaN(Number(maxPrice))) query.price.$lte = Number(maxPrice);
  }

  // *** Huéspedes ***
  if (maxGuests && !isNaN(Number(maxGuests))) {
    query.maxGuests = { $lte: Number(maxGuests) };
  }

  // *** Metros cuadrados mínimos ***
  if (squareMeters && !isNaN(Number(squareMeters))) {
    query.squareMeters = { $gte: Number(squareMeters) };
  }

  // *** Servicios ***
  const services = {};
  if (airConditioning === "on") services["services.airConditioning"] = true;
  if (heating === "on") services["services.heating"] = true;
  if (accessibility === "on") services["services.accessibility"] = true;
  if (television === "on") services["services.television"] = true;
  if (kitchen === "on") services["services.kitchen"] = true;
  if (internet === "on") services["services.internet"] = true;
  Object.assign(query, services);

  // *** Fechas ***
  const [start, end] = dateRange.split(" - ");
  const startDate = new Date(start);
  const endDate = new Date(end);

  startDate.setDate(startDate.getDate() + 1); //Para solapar fechas!!
  console.log("Start Date:", startDate);
  console.log("End Date:", endDate);

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  let reservedApartmentIds = [];

  if (!isNaN(startDate.getTime()) || !isNaN(endDate.getTime())) {
    const reservationsDates = await Reservation.find({
      $and: [
        { startDate: { $lt: endDate } },
        { endDate: { $gte: startDate } },
        { status: "confirmed" },
      ],
    });

    reservedApartmentIds = reservationsDates.map((r) => r.apartment);

    if (reservedApartmentIds.length > 0) {
      query._id = { $nin: reservedApartmentIds };
    }
  } else {
    console.log("Fechas inválidas");
    throw new Error("Fechas inválidas proporcionadas.");
  }

  // console.log("Consulta MongoDB:", query);

  // Orden
  let sortvalue = 0;
  if (+sortPrice >= 0) sortvalue = 1;
  if (+sortPrice < 0) sortvalue = -1;

  try {
    const apartments = await Apartment.find(query).sort({ price: sortvalue });
    console.log(apartments._id);
    res.render("seeApartments.ejs", {
      title: "home",
      apartments,
    });
  } catch (err) {
    console.error("Error al buscar apartamentos:", err);
    res.status(500).render("error", {
      message: "Error al realizar la búsqueda de apartamentos",
      status: 500,
    });
  }
};

// GET Apartment By Id (:id => Debe ir al final)
export const getApartmentById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).render("error", {
      message: "ID inválido",
      status: 400,
    });
  }

  try {
    const apartments = await Apartment.findById(id);
    res.render("detailApartment.ejs", {
      title: "home",
      error: undefined,
      apartments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET Reservations By Id (:id => Debe ir al final)
export const getReservationsById = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).render("error", {
      message: "ID inválido",
      status: 400,
    });
  }

  try {
    const reservations = await Reservation.find({
      user: req.session.userId,
    }).populate("apartment");
    res.render("userReservations.ejs", {
      title: "home",
      error: undefined,
      reservations,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST New Reservation
export const postNewReservation = async (req, res) => {
  const { apartmentId, guestName, guestEmail, dateRange } = req.body;
  const [start, end] = dateRange.split(" - ");
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.log("fecha no disponible");
    req.flash("error_msg", "Fechas no disponibles.");
    res.redirect("/reservations/new-reservation");
  }

  const status = "confirmed";
  const paid = true;
  try {
    const dataReservations = await Reservation.find({
      apartment: apartmentId,
      status: "confirmed",
      $and: [{ endDate: { $gt: startDate } }, { startDate: { $lt: endDate } }],
    });

    console.log("dataReservations:", dataReservations);

    if (dataReservations.length === 0) {
      console.log("creamos el objeto");

      const newReservation = new Reservation({
        apartment: apartmentId,
        user: req.session.userId,
        guestName,
        guestEmail,
        startDate,
        endDate,
        status,
        paid,
      });
      console.log("objeto creado:", newReservation);

      await newReservation.save();
      console.log("Objeto guardado");
      req.flash("success_msg", "Reserva realizada con éxito.");
      res.redirect("/");
    } else {
      req.flash("error_msg", "Fechas no disponibles");
      res.redirect(`/apartments/${apartmentId}#reservation`);
    }
  } catch (err) {
    req.flash(
      "error_msg",
      "Fallo en la realización de la reserva. Lo comunicaremos a nuestro departamento técnico."
    );
    res.redirect(`/apartments/${apartmentId}#reservation`);
  }
};
