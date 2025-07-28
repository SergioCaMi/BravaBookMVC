import mongoose from "mongoose";
import path from "path";
import User from "../models/user.model.js";
import Apartment from "../models/apartment.model.js";
import Reservation from "../models/reservation.model.js";
import axios from "axios";
import { validationResult } from 'express-validator';

// ********** Gestión de Usuario **********

/**
Registra un nuevo usuario en el sistema con validación de datos y verificación de roles.
@param {object} req - Objeto de solicitud de Express.
@param {object} res - Objeto de respuesta de Express.
*/
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

/**
Autentica a un usuario en el sistema verificando sus credenciales y estableciendo la sesión.
@param {object} req - Objeto de solicitud de Express.
@param {object} res - Objeto de respuesta de Express.
*/
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

/**
Cierra la sesión del usuario actual y redirige a la página principal.
@param {object} req - Objeto de solicitud de Express.
@param {object} res - Objeto de respuesta de Express.
*/
export const logout = (req, res) => {
  req.session.destroy(() => res.redirect("/"));
};


/**
Renderiza el dashboard del usuario con información personal, reservas y apartamentos según su rol.
@param {object} req - Objeto de solicitud de Express.
@param {object} res - Objeto de respuesta de Express.
*/
export const dashboard = async (req, res) => {
  const user = await User.findById(req.session.userId);
  
  let reservations;
  if (user.role === 'admin') {
    // Para admins mostramos sus reservas y reservas recibidas en sus apartamentos
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
    // Para usuarios normales solo sus reservas
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

/**
Renderiza la página de contacto del sistema.
@param {object} req - Objeto de solicitud de Express.
@param {object} res - Objeto de respuesta de Express.
*/
export const getContactUs = async (req, res) => {
  res.render("contactUs", { title: "contact" });
};


/**
Renderiza la página de Acerca de... del sistema.
@param {object} req - Objeto de solicitud de Express.
@param {object} res - Objeto de respuesta de Express.
*/
export const getAboutUs = async (req, res) => {
  res.render("aboutUs", { title: "about" });
};

/**
Renderiza la página de edición de perfil del usuario actual.
@param {object} req - Objeto de solicitud de Express.
@param {object} res - Objeto de respuesta de Express.
*/
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

/**
Actualiza la información del perfil del usuario actual incluyendo nombre, email, bio y avatar.
@param {object} req - Objeto de solicitud de Express.
@param {object} res - Objeto de respuesta de Express.
*/
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
      const avatarPath = path.join("usuarios", userBaseName, "avatar.jpg"); 
      updates.avatar = avatarPath;
    }

    await User.findByIdAndUpdate(req.session.userId, updates); 
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    res.status(500).render("editProfile", {
      title: "admin",
      user: req.user, 
      error: "Hubo un error al guardar los cambios.",
    });
  }
};

// ********** Gestión de Apartamentos **********

/**
Obtiene y renderiza todos los apartamentos activos del sistema.
@param {object} req - Objeto de solicitud de Express.
@param {object} res - Objeto de respuesta de Express.
*/
export const getAllApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find({ active: true }).populate("createdBy");
    res.render("home", { title: "home", error: undefined, apartments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
Renderiza el mapa con la ubicación de todos los apartamentos activos del sistema.
@param {object} req - Objeto de solicitud de Express.
@param {object} res - Objeto de respuesta de Express.
*/
export const getMap = async (req, res) => {
  try {
    const apartments = await Apartment.find({ active: true }).populate("createdBy"); 
    res.render("map", { title: "home", apartments }); 
  } catch (error) {
    console.error("Error al recuperar los apartamentos:", error);
    res.status(500).send("Error al cargar los datos de los apartamentos");
  }
};

/**
Renderiza la lista de apartamentos según el rol del usuario (propios para admin, activos para usuarios).
@param {object} req - Objeto de solicitud de Express.
@param {object} res - Objeto de respuesta de Express.
*/
export const getSeeApartments = async (req, res) => {
  let apartments;
  try {
    if (res.locals.currentUser.role == "admin") {
      // Admin solo ve sus propios apartamentos
      apartments = await Apartment.find({ 
        createdBy: req.session.userId 
      }).populate("createdBy");
    } else {
      apartments = await Apartment.find({ active: true }).populate("createdBy"); 
      // Usuario solo ve activos
    }
    res.render("seeApartments", {
      title: "home",
      apartments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
Busca y filtra apartamentos según múltiples criterios incluyendo ubicación, precios, servicios y disponibilidad.
@param {object} req - Objeto de solicitud de Express.
@param {object} res - Objeto de respuesta de Express.
*/
export const getApartmentSearch = async (req, res) => {
  req.session.lastSearch = req.query; // Guarda la última búsqueda en sesión
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
  } = req.query;

  const query = { active: true }; 
  const provinceName = req.query.province?.nm?.trim();
  const cityName = req.query.municipality?.nm?.trim();

  // Filtro por provincia
  if (provinceName) {
    query["location.province.nm"] = {
      $regex: provinceName,
      $options: "i", 
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
  if (airConditioning === "on") {
    query["services.airConditioning"] = true;
  }
  if (heating === "on") {
    query["services.heating"] = true;
  }
  if (accessibility === "on") {
    query["services.accessibility"] = true;
  }
  if (television === "on") {
    query["services.television"] = true;
  }
  if (kitchen === "on") {
    query["services.kitchen"] = true;
  }
  if (internet === "on") {
    query["services.internet"] = true;
  }
  
  // Filtrar por disponibilidad de fechas
  const [start, end] = dateRange.split(" - ");
  const startDate = new Date(start);
  const endDate = new Date(end);

  startDate.setDate(startDate.getDate() + 1); // Ajuste para solapar fechas

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

/**
Busca apartamentos utilizando inteligencia artificial GEMINI para interpretar consultas naturales del usuario.
@param {object} req - Objeto de solicitud de Express.
@param {object} res - Objeto de respuesta de Express.
*/
export const searchApartments = async (req, res) => {
  const userQuery = req.body.query || "";
  const escapedQuery = userQuery.replace(/["\\]/g, "\\$&");

  try {

    // 1. Envía la consulta mejorada a la API de Gemini
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Convierte esta frase del usuario en un JSON de filtros para buscar apartamentos.

Campos posibles:
- location (string): Busca tanto en provincia como municipio
- minPrice (number)
- maxPrice (number) 
- services (array de strings): ["airConditioning", "heating", "accessibility", "television", "kitchen", "internet"]
- rooms (number)
- bathrooms (number)
- maxGuests (number)
- squareMeters (object con $gte o $lte)
- keywords (array): para buscar servicios adicionales en descripción
- size (string): "grande", "pequeño", "lujoso"

Traducciones y sinónimos:
- "Barcelona", "Madrid", etc → location: "Barcelona" (busca en provincia Y municipio)
- "grande", "amplio" → squareMeters: {"$gte": 120}
- "pequeño", "acogedor" → squareMeters: {"$lte": 50}
- "lujoso", "luxury" → services: ["airConditioning", "heating", "television", "kitchen", "internet"], size: "lujoso"
- "barato" → maxPrice: 50
- "tele", "tv", "televisión" → services: ["television"]
- "wifi", "internet" → services: ["internet"]
- "aire", "ac", "climatizado" → services: ["airConditioning"]
- "cocina", "kitchen" → services: ["kitchen"]
- "calefacción", "heating" → services: ["heating"]
- "piscina", "pool", "gimnasio", "gym", "parking", "garaje" → keywords: ["piscina", "gimnasio", "parking"]

Ejemplos:
"apartamento lujoso en Barcelona" → {"location": "Barcelona", "services": ["airConditioning", "heating", "television", "kitchen", "internet"], "size": "lujoso"}
"piso grande con piscina en Madrid máximo 800€" → {"location": "Madrid", "squareMeters": {"$gte": 120}, "maxPrice": 800, "keywords": ["piscina"]}
"apartamento pequeño con wifi" → {"squareMeters": {"$lte": 50}, "services": ["internet"]}

Devuelve SOLO el objeto JSON válido, sin texto adicional.

Frase: "${escapedQuery}"`,
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
    let raw = geminiResponse.data.candidates[0].content.parts[0].text.trim();
    
    // Limpiamos el formato de código si existe
    if (raw.startsWith("```")) {
      raw = raw.replace(/```json|```/g, "").trim();
    }
    
    // Limpiamos comas extra y caracteres problemáticos
    raw = raw
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .trim();


    let filters;
    try {
      filters = JSON.parse(raw);
    } catch (parseError) {
      const keywordRegex = new RegExp(userQuery.split(' ').join('|'), "i");
      const apartments = await Apartment.find({
        active: true,
        $or: [
          { "location.province.nm": { $regex: keywordRegex } },
          { "location.municipality.nm": { $regex: keywordRegex } },
          { title: { $regex: keywordRegex } },
          { description: { $regex: keywordRegex } }
        ]
      }).populate("createdBy");
      
      return res.render("seeApartments.ejs", { 
        title: `${apartments.length} resultados para "${userQuery}"`, 
        apartments,
        searchQuery: userQuery,
        isSearchResult: true
      });
    }

    // 3. Construye la consulta MongoDB mejorada
    const mongoQuery = { active: true };

    // Ubicación mejorada - busca en provincia Y municipio
    if (filters.location) {
      mongoQuery.$or = [
        { "location.province.nm": { $regex: new RegExp(filters.location, "i") } },
        { "location.municipality.nm": { $regex: new RegExp(filters.location, "i") } }
      ];
    }

    // Capacidad y características
    if (filters.maxGuests) {
      mongoQuery.maxGuests = { $gte: filters.maxGuests };
    }
    if (filters.rooms) {
      mongoQuery.rooms = { $gte: filters.rooms };
    }
    if (filters.bathrooms) {
      mongoQuery.bathrooms = { $gte: filters.bathrooms };
    }

    // Metros cuadrados mejorados
    if (filters.squareMeters) {
      mongoQuery.squareMeters = filters.squareMeters;
    }

    // Precio
    if (filters.minPrice || filters.maxPrice) {
      mongoQuery.price = {};
      if (filters.minPrice) mongoQuery.price.$gte = filters.minPrice;
      if (filters.maxPrice) mongoQuery.price.$lte = filters.maxPrice;
    }

    // Servicios del modelo
    if (filters.services && Array.isArray(filters.services)) {
      for (const service of filters.services) {
        mongoQuery[`services.${service}`] = true;
      }
    }

    // Keywords para búsqueda en descripción (servicios adicionales)
    let descriptionConditions = [];
    
    if (filters.keywords && Array.isArray(filters.keywords)) {
      for (const keyword of filters.keywords) {
        descriptionConditions.push(
          { description: { $regex: new RegExp(keyword, "i") } },
          { title: { $regex: new RegExp(keyword, "i") } }
        );
      }
    }

    // Filtros especiales para "lujoso"
    if (filters.size === "lujoso") {
      descriptionConditions.push(
        { description: { $regex: /lujoso|luxury|premium|exclusivo|high-end/i } },
        { title: { $regex: /lujoso|luxury|premium|exclusivo|high-end/i } }
      );
    }

    // Búsqueda por nombre/título del apartamento
    // Limpiar consulta eliminando comillas y símbolos
    const titleSearchWords = userQuery
      .replace(/[^\w\s]/g, "") // elimina comillas y símbolos
      .split(/\s+/)
      .filter(word => word.length > 2 && !["con", "en", "de", "del", "la", "el", "una", "un", "y", "o", "busco", "buscar", "quiero", "necesito", "apartamento", "piso", "casa"].includes(word.toLowerCase()));
    
    // Detectar si está buscando un apartamento específico (con números o nombres propios)
    const hasNumbers = /\d+/.test(userQuery);
    const hasSpecificWords = titleSearchWords.some(word => 
      /^[A-Z]/.test(word) || // Palabra que empieza con mayúscula
      /\d+/.test(word) ||    // Contiene números
      word.toLowerCase().includes('apartment') ||
      word.toLowerCase().includes('villa') ||
      word.toLowerCase().includes('estudio')
    );
    
    if (titleSearchWords.length > 0 && (hasNumbers || hasSpecificWords)) {
      // Búsqueda exacta para apartamentos específicos
      const exactTitleRegex = new RegExp(titleSearchWords.join('.*'), "i");
      descriptionConditions.push(
        { title: { $regex: exactTitleRegex } }
      );
      
      // Si parece una búsqueda muy específica, solo buscar en título
      if (titleSearchWords.length >= 2 && hasNumbers) {
        
        const exactTitleRegex = new RegExp(`\\b${titleSearchWords.join('.*')}\\b`, "i");
        
        const specificResults = await Apartment.find({
          active: true,
          title: { $regex: exactTitleRegex }
        }).populate("createdBy");
        
        if (specificResults.length > 0) {
          return res.render("seeApartments.ejs", {
            title: `${specificResults.length} resultado${specificResults.length !== 1 ? "s" : ""} para "${userQuery}"`,
            apartments: specificResults,
            searchQuery: userQuery,
            isSearchResult: true
          });
        } else {
          return res.render("seeApartments.ejs", {
            title: `0 resultados para "${userQuery}"`,
            apartments: [],
            searchQuery: userQuery,
            isSearchResult: true
          });
        }
      }
    } else if (titleSearchWords.length > 0) {
      // Búsqueda general en título
      const titleRegex = new RegExp(titleSearchWords.join('|'), "i");
      descriptionConditions.push(
        { title: { $regex: titleRegex } }
      );
    }

    // Combina condiciones de descripción con ubicación si ambas existen
    if (descriptionConditions.length > 0) {
      if (mongoQuery.$or) {
        // Si ya hay condiciones de ubicación, las combinamos
        mongoQuery.$and = [
          { $or: mongoQuery.$or }, // Condiciones de ubicación
          { $or: descriptionConditions } // Condiciones de descripción
        ];
        delete mongoQuery.$or;
      } else {
        // Si no hay condiciones de ubicación, solo descripción
        mongoQuery.$or = descriptionConditions;
      }
    }


    // 4. Ejecuta la búsqueda
    const apartments = await Apartment.find(mongoQuery).sort({ price: 1 }).populate("createdBy");
    
    
    // 5. Renderiza los resultados
    res.render("seeApartments.ejs", { 
      title: `${apartments.length} resultados para "${userQuery}"`, 
      apartments,
      searchQuery: userQuery,
      appliedFilters: filters,
      isSearchResult: true
    });

  } catch (err) {
    
    if (err.response?.status === 429) {
      req.flash("error", "Límite de IA alcanzado. Inténtalo más tarde.");
    } else {
      req.flash("error", "Error en la búsqueda inteligente. Inténtalo de nuevo.");
    }
    
    res.redirect("/");
  }
};


// ********** Gestión de Reservas **********

/**
Crea una nueva reserva para un apartamento verificando disponibilidad de fechas y confirmando el pago.
@param {object} req - Objeto de solicitud de Express.
@param {object} res - Objeto de respuesta de Express.
*/
export const postNewReservation = async (req, res) => {
  const { apartmentId, guestName, guestEmail, dateRange } = req.body;
  const [start, end] = dateRange.split(" - ");
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    req.flash("error_msg", "Fechas no disponibles.");
    res.redirect("/reservations/new-reservation"); 
  }

  const status = "confirmed";
  const paid = true;
  try {
    const dataReservations = await Reservation.find({
      apartment: apartmentId,
      $and: [{ endDate: { $gt: startDate } }, { startDate: { $lt: endDate } }],
    });

    if (dataReservations.length === 0) { 
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

// ********** Rutas con ID (Detalles) **********

/**
Obtiene y renderiza los detalles de un apartamento específico por su ID junto con sus reservas.
@param {object} req - Objeto de solicitud de Express.
@param {object} res - Objeto de respuesta de Express.
*/
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
    const reservations = await Reservation.find({ apartment: apartments }); 
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

/**
Obtiene y renderiza todas las reservas del usuario actual por su ID de sesión.
@param {object} req - Objeto de solicitud de Express.
@param {object} res - Objeto de respuesta de Express.
*/
export const getReservationsById = async (req, res) => {
  const { id } = req.params;
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
