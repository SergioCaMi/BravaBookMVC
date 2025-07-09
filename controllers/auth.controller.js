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
      return res.render("register", {
        title: "home",
        error: "El correo electrónico ya está en uso.",
      });
    }

    // El primer usuario será admin
    const firstUser = await User.countDocuments();
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: firstUser === 0 ? "admin" : "user",
    });

    await user.save();
    console.log("Usuario guardado:", user);
    req.session.userId = user._id;
    res.redirect("/dashboard");

    // res.render("home", { title: "home", error: undefined, user});
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
    // return res.render("login", {
    //   title: "home",
    //   error: "Credenciales incorrectas",
    // });
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
  }).limit(10);
  const apartments = await Apartment.find({
    createdBy: req.session.userId,
  }).limit(50);

  res.render("dashboard", { title: "home", user, reservations, apartments });
};

// ContactUs
export const getContactUs = async (req, res) => {
  res.render("contactUs", { title: "contact", error: undefined });
};
// AboutUs
export const getAboutUs = async (req, res) => {
  res.render("aboutUs", { title: "about", error: undefined });
};

// GET Editar profile
export const getEditProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect("/login");
    }
    res
      .status(200)
      .render("editProfile.ejs", { title: "home", user, error: undefined });
  } catch (err) {
    res.status(500).render("error.ejs", {
      message: "Error interno del servidor",
      status: 404,
    });
  }
};

// POST Editar profile
export const postUpdateProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;

    if (!name || !email) {
      return res.status(400).render("editProfile", {
        title: "Editar perfil",
        user: req.user,
        error: "Nombre y correo son obligatorios.",
      });
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
  try {
    const apartments = await Apartment.find({ active: true });
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
  console.log(req.query);
  const {
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
    rol,
  } = req.query;

  const province = req.query["location[province]"];
  const city = req.query["location[city]"];

  console.log("Provincia recibida:", province);

  const query = {};
  query.active = true;

  // *** Ciudad ***
  if (city) {
    query["location.city"] = {
      $exists: true,
      $ne: "",
      $regex: city.trim(),
      $options: "i",
    };
  }
  // *** Provincia ***
  if (province) {
    query["location.province"] = {
      $exists: true,
      $ne: "",
      $regex: province.trim(),
      $options: "i",
    };
  }
  // *** Precio ***
  // Desestructuramos para no sobreescribir otra consulta anterior (min o max) sobre el mismo campo
  if (minPrice) {
    const numMinPrice = Number(minPrice);
    if (!isNaN(numMinPrice)) {
      query.price = { ...query.price, $gte: numMinPrice };
    }
  }
  if (maxPrice) {
    const numMaxPrice = Number(maxPrice);
    if (!isNaN(numMaxPrice)) {
      query.price = { ...query.price, $lte: numMaxPrice };
    }
  }
  // *** Huéspedes ***
  if (maxGuests) {
    const numGuests = Number(maxGuests);
    if (!isNaN(numGuests)) {
      query.maxGuests = { $lte: numGuests };
    }
  }
  // *** Metros cuadrados ***
  if (squareMeters) {
    const parsedSquareMeters = Number(squareMeters);
    if (!isNaN(parsedSquareMeters)) {
      query.squareMeters = { $gte: parsedSquareMeters };
    }
  }
  const servicesConditions = {};
  if (airConditioning === "on") servicesConditions.airConditioning = true;
  if (heating === "on") servicesConditions.heating = true;
  if (accessibility === "on") servicesConditions.accessibility = true;
  if (television === "on") servicesConditions.television = true;
  if (kitchen === "on") servicesConditions.kitchen = true;
  if (internet === "on") servicesConditions.internet = true;
  console.log(internet); // "on"
  if (Object.keys(servicesConditions).length > 0) {
    Object.entries(servicesConditions).forEach(([key, value]) => {
      query[`services.${key}`] = value;
    });
  }
  // *** Fechas ***
  let reservedApartmentIds = [];

  if (req.query.startDate && req.query.endDate) {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    const normalizedStart = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    const normalizedEnd = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );
    const ocupados = await Reservation.find({
      apartmentId: { $exists: true },
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    });

    reservedApartmentIds = ocupados.map((r) => r.apartmentId);
  }

  if (req.query.startDate && req.query.endDate) {
    query._id = { $nin: reservedApartmentIds };
  }

  try {
    console.log("Query final:", query);
    // Paginación correcta con filtros
    const queryObj = { ...req.query };
    delete queryObj.page;
    const pagination = await getPaginatedData(Apartment, query, req, 6);
    const renderData = getRenderObject(
      "",
      pagination.dataApartments,
      [],
      req,
      null,
      undefined,
      pagination.currentPage,
      rol
    );
    renderData.totalPages = pagination.totalPages;
    renderData.query = queryObj;
    res.status(200).render("home.ejs", renderData);
  } catch (error) {
    console.error("Error al buscar apartamentos:", error);
    res.status(500).render("error.ejs", {
      message: "Error interno del servidor",
      status: 404,
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
    const reservations = await Reservation.find({ user: req.session.userId });
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
  const { apartmentId, guestName, guestEmail } = req.body;
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.log("fecha no disponible");
    req.flash("error_msg", "Fechas no disponibles.");
    res.redirect("/reservations/new-reservation");
  }

  const status = "confirmed";
  const paid = true;
  try {
    const dataReservations = await Reservation.find({
      apartmentId: apartmentId,
      $and: [{ endDate: { $gt: startDate } }, { startDate: { $lt: endDate } }],
    });
  console.log("dataReservations:", dataReservations.length);

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
            console.log("objeto creado:", newReservation );

      await newReservation.save();
      console.log("Objeto guardado");
      req.flash("success_msg", "Reserva realizada con éxito.");
      res.redirect("/");
    } else {
      req.flash(
        "error_msg",
        "Fallo en la realización de la reserva. Pongase en contacto por telefono con nuestro equipo."
      );
      res.redirect("/");
    }
  } catch (err) {
    req.flash(
      "error_msg",
      "Fallo en la realización de la reserva. Pongase en contacto por telefono con nuestro equipo."
    );
    res.redirect("/");
  }
};
