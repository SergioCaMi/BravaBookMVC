import mongoose from "mongoose";
import path from "path";
import User from "../models/user.model.js";
import Apartment from "../models/apartment.model.js";
import Reservation from "../models/reservation.model.js";
import axios from "axios";
import { validationResult } from 'express-validator';

// --- Gestión de Usuario ---

// Registro de un nuevo usuario
export const register = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      req.flash("error", errorMessages.join(', '));
      return res.redirect("/register");
    }

    const { name, email, password, role } = req.body;

    // Verifica si el correo ya está en uso
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error_msg", "El correo electrónico ya está en uso.");
      return res.redirect("/register");
    }

    // Asignar rol directamente y verificar si es el primer admin
    const finalRole = role || 'user';
    
    // Verificar si ya existe un super administrador
    const existingSuperAdmin = await User.findOne({ isSuperAdmin: true });
    const isFirstAdmin = finalRole === 'admin' && !existingSuperAdmin;

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: finalRole,
      isSuperAdmin: isFirstAdmin,
    });

    await user.save();
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

// Inicio de sesión
export const login = async (req, res) => {
  // Verificar errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    req.flash("error", errorMessages.join(', '));
    return res.redirect("/login");
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !(await user.comparePassword(password))) {
    req.flash("error_msg", "Credenciales incorrectas.");
    return res.redirect("/login");
  }

  req.session.userId = user._id;
  res.redirect("/dashboard");
};

// Cierre de sesión
export const logout = (req, res) => {
  req.session.destroy(() => res.redirect("/"));
};

// Dashboard de usuario
export const dashboard = async (req, res) => {
  const user = await User.findById(req.session.userId);
  
  let reservations;
  if (user.role === 'admin') {
    // Para admins: mostrar sus reservas + reservas recibidas en sus apartamentos
    const userApartments = await Apartment.find({
      createdBy: req.session.userId,
    }).select('_id');
    
    const apartmentIds = userApartments.map(apt => apt._id);
    
    reservations = await Reservation.find({
      $or: [
        { user: req.session.userId }, // Reservas hechas por el admin
        { apartment: { $in: apartmentIds } } // Reservas recibidas en apartamentos del admin
      ]
    })
      .populate("apartment")
      .populate("user")
      .limit(20);
  } else {
    // Para usuarios normales: solo sus reservas
    reservations = await Reservation.find({
      user: req.session.userId,
    })
      .populate("apartment")
      .limit(10);
  }
  
  const apartments = await Apartment.find({
    createdBy: req.session.userId,
  }).limit(50);

  res.render("dashboard", { 
    title: "home", 
    user, 
    reservations, 
    apartments,
    currentUser: user,
    isSuperAdmin: user.isSuperAdmin || false
  });
};

// Obtener página de Contacto
export const getContactUs = async (req, res) => {
  res.render("contactUs", { title: "contact" });
};

// Obtener página "Acerca de nosotros"
export const getAboutUs = async (req, res) => {
  res.render("aboutUs", { title: "about" });
};

// Mostrar formulario de edición de perfil
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

// Actualizar perfil de usuario
export const postUpdateProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;

    if (!name || !email) {
      req.flash(
        "error_msg",
        "Nombre de usuario y correo electrónico son obligatorios"
      );
      return res.redirect("/profile/edit");
    }

    const updates = { name, email, bio };

    if (req.file) { // Si hay un archivo (avatar) subido
      const userEmail = email;
      const userBaseName = userEmail.split("@")[0];
      const avatarPath = path.join("usuarios", userBaseName, "avatar.jpg"); // Ruta para guardar el avatar
      updates.avatar = avatarPath;
    }

    await User.findByIdAndUpdate(req.session.userId, updates); // Actualiza el usuario

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    res.status(500).render("editProfile", {
      title: "admin",
      user: req.user, // Asume que req.user está disponible (desde `res.locals.currentUser` quizás)
      error: "Hubo un error al guardar los cambios.",
    });
  }
};

// --- Gestión de Apartamentos ---

// Obtener todos los apartamentos para la página principal
export const getAllApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find({ active: true }).populate("createdBy");
    res.render("home", { title: "home", error: undefined, apartments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mostrar mapa con apartamentos
export const getMap = async (req, res) => {
  try {
    const apartments = await Apartment.find({ active: true }).populate("createdBy"); // Recupera apartamentos activos
    res.render("map", { title: "home", apartments }); // Renderiza la vista del mapa
  } catch (error) {
    console.error("Error al recuperar los apartamentos:", error);
    res.status(500).send("Error al cargar los datos de los apartamentos");
  }
};

// Ver lista de apartamentos (admin vs. usuario)
export const getSeeApartments = async (req, res) => {
  let apartments;
  try {
    if (res.locals.currentUser.role == "admin") {
      // Admin solo ve sus propios apartamentos
      apartments = await Apartment.find({ 
        createdBy: req.session.userId 
      }).populate("createdBy");
    } else {
      apartments = await Apartment.find({ active: true }).populate("createdBy"); // Usuario solo ve activos
    }
    res.render("seeApartments", {
      title: "home",
      apartments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Búsqueda de apartamentos (con filtros y fechas)
export const getApartmentSearch = async (req, res) => {
  req.session.lastSearch = req.query; // Guarda la última búsqueda en sesión
  const {
    sortPrice,
    minPrice,
    maxPrice,
    maxGuests,
    squareMeters,
    "rules[]": rules, // Recoge reglas como array
    "bedsPerRoom[]": bedsPerRoom, // Recoge camas por habitación como array
    "services.airConditioning": airConditioning,
    "services.heating": heating,
    "services.accessibility": accessibility,
    "services.television": television,
    "services.kitchen": kitchen,
    "services.internet": internet,
    dateRange,
  } = req.query;

  const query = { active: true }; // Siempre busca apartamentos activos
  const provinceName = req.query.province?.nm?.trim();
  const cityName = req.query.municipality?.nm?.trim();

  // Filtro por provincia
  if (provinceName) {
    query["location.province.nm"] = {
      $regex: provinceName,
      $options: "i", // Búsqueda insensible a mayúsculas/minúsculas
    };
  }
  // Filtro por ciudad/municipio
  if (cityName) {
    query["location.municipality.nm"] = {
      $regex: cityName,
      $options: "i",
    };
  }

  // Filtro por rango de precio
  if (minPrice) {
    query.price = { ...query.price };
    if (!isNaN(Number(minPrice))) query.price.$gte = Number(minPrice);
  }
  if (maxPrice) {
    query.price = { ...query.price };
    if (!isNaN(Number(maxPrice))) query.price.$lte = Number(maxPrice);
  }

  // Filtro por número máximo de huéspedes
  if (maxGuests && !isNaN(Number(maxGuests))) {
    query.maxGuests = { $lte: Number(maxGuests) };
  }

  // Filtro por metros cuadrados mínimos
  if (squareMeters && !isNaN(Number(squareMeters))) {
    query.squareMeters = { $gte: Number(squareMeters) };
  }

  // Filtro por servicios
  const services = {};
  if (airConditioning === "on") services["services.airConditioning"] = true;
  if (heating === "on") services["services.heating"] = true;
  if (accessibility === "on") services["services.accessibility"] = true;
  if (television === "on") services["services.television"] = true;
  if (kitchen === "on") services["services.kitchen"] = true;
  if (internet === "on") services["services.internet"] = true;
  Object.assign(query, services); // Añade los servicios a la consulta principal

  // Filtrar por disponibilidad de fechas
  const [start, end] = dateRange.split(" - ");
  const startDate = new Date(start);
  const endDate = new Date(end);

  startDate.setDate(startDate.getDate() + 1); // Ajuste para solapar fechas

  startDate.setHours(0, 0, 0, 0); // Normaliza a inicio del día
  endDate.setHours(0, 0, 0, 0); // Normaliza a inicio del día

  let reservedApartmentIds = [];

  if (!isNaN(startDate.getTime()) || !isNaN(endDate.getTime())) {
    const reservationsDates = await Reservation.find({
      $and: [
        { startDate: { $lt: endDate } }, // La reserva termina después de que mi búsqueda empieza
        { endDate: { $gte: startDate } }, // La reserva empieza antes de que mi búsqueda termine
        { status: "confirmed" },
      ],
    });

    reservedApartmentIds = reservationsDates.map((r) => r.apartment); // IDs de apartamentos reservados

    if (reservedApartmentIds.length > 0) {
      query._id = { $nin: reservedApartmentIds }; // Excluye los apartamentos reservados
    }
  } else {
    throw new Error("Fechas inválidas proporcionadas.");
  }

  // Ordenar resultados
  let sortvalue = 0;
  if (+sortPrice >= 0) sortvalue = 1;
  if (+sortPrice < 0) sortvalue = -1;
  try {
    const apartments = await Apartment.find(query).sort({ price: sortvalue });
    res.render("partials/seeApartments.ejs", {
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

// Buscar apartamentos usando IA (Gemini)
export const searchApartments = async (req, res) => {
  const userQuery = req.body.query;

  try {
    // 1. Envía la consulta a la API de Gemini
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Convierte esta frase en un JSON con filtros para apartamentos: "${userQuery}". 
                
                Campos disponibles: province, municipality, services, minPrice, maxPrice, rooms, bathrooms, maxGuests.
                
                Para servicios usa: wifi, parking, pool, gym, terrace, airConditioning, heating, kitchen, laundry, tv, security.
                
                Ejemplos:
                - "piso en Madrid con piscina máximo 800€" → {"province": "Madrid", "services": {"pool": true}, "maxPrice": 800}
                - "apartamento Barcelona 2 habitaciones" → {"municipality": "Barcelona", "rooms": 2}
                
                Devuelve SOLO el objeto JSON, sin texto adicional.`,
              },
            ],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // 2. Procesa la respuesta de Gemini
    let raw = geminiResponse.data.candidates[0].content.parts[0].text;
    let cleanJson = raw.trim();

    // Limpia el formato de código si existe
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/```json|```/g, "").trim();
    }

    let filters;
    try {
      filters = JSON.parse(cleanJson);
    } catch (parseError) {
      // Si no puede parsear JSON, hace búsqueda por texto
      const apartments = await Apartment.find({
        active: true,
        $or: [
          { "location.province.nm": { $regex: new RegExp(userQuery, "i") } },
          { "location.municipality.nm": { $regex: new RegExp(userQuery, "i") } },
          { name: { $regex: new RegExp(userQuery, "i") } },
          { description: { $regex: new RegExp(userQuery, "i") } }
        ]
      });
      return res.render("seeApartments.ejs", { 
        title: `Resultados para "${userQuery}"`, 
        apartments,
        searchQuery: userQuery,
        isSearchResult: true
      });
    }

    // 3. Construye la consulta MongoDB
    const query = { active: true };

    // Ubicación
    if (filters.province || filters.municipality) {
      const locationConditions = [];
      if (filters.province) {
        locationConditions.push({
          "location.province.nm": { $regex: new RegExp(filters.province, "i") }
        });
      }
      if (filters.municipality) {
        locationConditions.push({
          "location.municipality.nm": { $regex: new RegExp(filters.municipality, "i") }
        });
      }
      query.$or = locationConditions;
    }

    // Capacidad
    if (filters.maxGuests) query.maxGuests = { $gte: filters.maxGuests };
    if (filters.rooms) query.rooms = { $gte: filters.rooms };
    if (filters.bathrooms) query.bathrooms = { $gte: filters.bathrooms };

    // Precio
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    // Servicios
    if (filters.services) {
      for (const [service, required] of Object.entries(filters.services)) {
        if (required === true) {
          query[`services.${service}`] = true;
        }
      }
    }

    // 4. Ejecuta la búsqueda
    const apartments = await Apartment.find(query).sort({ price: 1 }).populate("createdBy");

    // 5. Renderiza los resultados
    res.render("seeApartments.ejs", { 
      title: `${apartments.length} resultados para "${userQuery}"`, 
      apartments,
      searchQuery: userQuery,
      appliedFilters: filters,
      isSearchResult: true
    });

  } catch (err) {
    // Manejo de errores
    console.error("Error en búsqueda IA:", err.message);
    
    if (err.response?.status === 429) {
      req.flash("error", "Límite de IA alcanzado. Inténtalo más tarde.");
    } else {
      req.flash("error", "Error en la búsqueda inteligente. Inténtalo de nuevo.");
    }
    
    res.redirect("/");
  }
};

// --- Gestión de Reservas ---

// Crear una nueva reserva
export const postNewReservation = async (req, res) => {
  const { apartmentId, guestName, guestEmail, dateRange } = req.body;
  const [start, end] = dateRange.split(" - ");
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    req.flash("error_msg", "Fechas no disponibles.");
    res.redirect("/reservations/new-reservation"); // Redirige a la misma página
  }

  const status = "confirmed";
  const paid = true;
  try {
    // Busca reservas existentes que se solapen y estén confirmadas
    const dataReservations = await Reservation.find({
      apartment: apartmentId,
      status: "confirmed",
      $and: [{ endDate: { $gt: startDate } }, { startDate: { $lt: endDate } }],
    });

    if (dataReservations.length === 0) { // Si no hay solapamientos, crea la reserva
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

      await newReservation.save();
      req.flash("success_msg", "Reserva realizada con éxito.");
      res.redirect("/"); // Redirige a la página principal
    } else {
      req.flash("error_msg", "Fechas no disponibles");
      res.redirect(`/apartments/${apartmentId}#reservation`); // Vuelve a la página del apartamento
    }
  } catch (err) {
    req.flash(
      "error_msg",
      "Fallo en la realización de la reserva. Lo comunicaremos a nuestro departamento técnico."
    );
    res.redirect(`/apartments/${apartmentId}#reservation`);
  }
};

// --- Rutas con ID (Detalles) ---

// Obtener detalles de apartamento por ID
export const getApartmentById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).render("error", {
      message: "ID inválido",
      status: 400,
    });
  }

  try {
    const apartments = await Apartment.findById(id); // Busca el apartamento
    const reservations = await Reservation.find({ apartment: apartments }); // Busca reservas para ese apartamento
    res.render("detailApartment.ejs", {
      title: "home",
      error: undefined,
      apartments,
      reservations,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener reservas de un usuario por ID (de reserva)
export const getReservationsById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) { // Valida si es un ID de MongoDB válido
    return res.status(400).render("error", {
      message: "ID inválido",
      status: 400,
    });
  }

  try {
    // Busca todas las reservas del usuario actual, no por el ID de la ruta
    const reservations = await Reservation.find({
      user: req.session.userId,
    }).populate("apartment"); // Popula los detalles del apartamento
    res.render("userReservations.ejs", {
      title: "home",
      error: undefined,
      reservations,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
