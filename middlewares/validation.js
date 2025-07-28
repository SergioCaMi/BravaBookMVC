import { body, param, validationResult } from "express-validator";
import User from "../models/user.model.js";
import Apartment from "../models/apartment.model.js";
import Reservation from "../models/reservation.model.js";

// Función para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => `${error.path}: ${error.msg}`);
    console.log("Errores de validación:", errorMessages);

    // Si es una petición AJAX, devolver JSON
    if (req.xhr || req.headers.accept?.indexOf("json") > -1) {
      return res.status(400).json({
        success: false,
        errors: errorMessages,
      });
    }

    // Si es una petición normal, usar flash messages y redirigir back
    req.flash("error_msg", errorMessages.join(", "));
    return res.redirect("back");
  }
  next();
};

// --- VALIDACIONES PARA USUARIO ---

/**
 * Validaciones para registro de usuario
 */
export const validateUserRegistration = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage("El email no puede exceder 100 caracteres")
    .custom(async (value) => {
      const existingUser = await User.findOne({ email: value });
      if (existingUser) {
        throw new Error("El email ya está en uso");
      }
      return true;
    }),

  body("password")
    .isLength({ min: 8, max: 16 })
    .withMessage("La contraseña debe tener entre 8 y 16 caracteres")
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/)
    .withMessage("La contraseña debe contener al menos una mayúscula, un número y un símbolo especial"),

  body("role").notEmpty().withMessage("El tipo de usuario es obligatorio").isIn(["user", "admin"]).withMessage('El rol debe ser "user" o "admin"'),

  body("bio").optional().trim().isLength({ max: 500 }).withMessage("La biografía no puede exceder 500 caracteres"),

  body("avatar").optional().isURL().withMessage("El avatar debe ser una URL válida"),
];

/**
 * Validaciones para login de usuario
 */
export const validateUserLogin = [
  body("email").trim().notEmpty().withMessage("El email es obligatorio").isEmail().withMessage("Debe ser un email válido").normalizeEmail(),

  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];

/**
 * Validaciones para actualización de perfil de usuario
 */
export const validateUserUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),

  body("email").optional().trim().isEmail().withMessage("Debe ser un email válido").normalizeEmail().isLength({ max: 100 }).withMessage("El email no puede exceder 100 caracteres"),

  body("bio").optional().trim().isLength({ max: 500 }).withMessage("La biografía no puede exceder 500 caracteres"),

  body("avatar").optional().isURL().withMessage("El avatar debe ser una URL válida"),
];

// --- VALIDACIONES PARA APARTAMENTO ---

/**
 * Validaciones para crear/editar apartamento
 */
export const validateApartment = [
  body("title").trim().notEmpty().withMessage("El título es obligatorio").isLength({ min: 1, max: 100 }).withMessage("El título debe tener entre 1 y 100 caracteres"),

  body("description").trim().notEmpty().withMessage("La descripción es obligatoria").isLength({ min: 1, max: 3000 }).withMessage("La descripción debe tener entre 1 y 3000 caracteres"),

  body("rules").optional().isArray().withMessage("Las reglas deben ser un array"),

  body("rules.*").optional().trim().isLength({ min: 1, max: 200 }).withMessage("Cada regla debe tener entre 1 y 200 caracteres"),

  body("rooms").optional().isInt({ min: 1 }).withMessage("El número de habitaciones debe ser un número entero mayor a 0"),

  body("bedsPerRoom").optional().isArray().withMessage("Las camas por habitación deben ser un array"),

  body("bedsPerRoom.*").optional().isInt({ min: 1, max: 10 }).withMessage("El número de camas por habitación debe estar entre 1 y 10"),

  body("bathrooms").optional().isInt({ min: 1, max: 10 }).withMessage("El número de baños debe estar entre 1 y 10"),

  body("maxGuests").optional().isInt({ min: 1, max: 50 }).withMessage("El número máximo de huéspedes debe estar entre 1 y 50"),

  body("squareMeters").optional().isInt({ min: 1, max: 1000 }).withMessage("Los metros cuadrados deben estar entre 1 y 1000"),

  body("price").optional().isNumeric().withMessage("El precio por noche debe ser un número").isFloat({ min: 1 }).withMessage("El precio por noche debe ser un número positivo"),

  body("location.province.id").optional({ checkFalsy: true }).isNumeric().withMessage("El ID de provincia debe ser numérico"),

  body("location.province.nm").optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 50 }).withMessage("El nombre de provincia debe tener entre 2 y 50 caracteres"),

  body("location.municipality.id").optional({ checkFalsy: true }).isNumeric().withMessage("El ID de municipio debe ser numérico"),

  body("location.municipality.nm").optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 50 }).withMessage("El nombre de municipio debe tener entre 2 y 50 caracteres"),

  body("location.gpsCoordinates.lat").optional({ checkFalsy: true }).isFloat({ min: -90, max: 90 }).withMessage("La latitud debe estar entre -90 y 90"),

  body("location.gpsCoordinates.lng").optional({ checkFalsy: true }).isFloat({ min: -180, max: 180 }).withMessage("La longitud debe estar entre -180 y 180"),

  // Validaciones para servicios (todos opcionales y booleanos)
  body("services.airConditioning").optional({ checkFalsy: true }).isIn(["on", "true", true]).withMessage("Aire acondicionado debe ser verdadero o falso"),

  body("services.heating").optional({ checkFalsy: true }).isIn(["on", "true", true]).withMessage("Calefacción debe ser verdadero o falso"),

  body("services.accessibility").optional({ checkFalsy: true }).isIn(["on", "true", true]).withMessage("Accesibilidad debe ser verdadero o falso"),

  body("services.television").optional({ checkFalsy: true }).isIn(["on", "true", true]).withMessage("Televisión debe ser verdadero o falso"),

  body("services.kitchen").optional({ checkFalsy: true }).isIn(["on", "true", true]).withMessage("Cocina debe ser verdadero o falso"),

  body("services.internet").optional({ checkFalsy: true }).isIn(["on", "true", true]).withMessage("Internet debe ser verdadero o falso"),
];

// --- VALIDACIONES PARA RESERVA ---

/**
 * Validaciones para crear/editar reserva
 */
export const validateReservation = [
  body("apartment")
    .notEmpty()
    .withMessage("El apartamento es obligatorio")
    .isMongoId()
    .withMessage("ID de apartamento inválido")
    .custom(async (value) => {
      const apartment = await Apartment.findById(value);
      if (!apartment) {
        throw new Error("El apartamento no existe");
      }
      if (!apartment.active) {
        throw new Error("El apartamento no está disponible");
      }
      return true;
    }),

  body("startDate")
    .notEmpty()
    .withMessage("La fecha de inicio es obligatoria")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Formato de fecha de inicio inválido (debe ser YYYY-MM-DD)")
    .custom((value) => {
      const startDate = new Date(value + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(startDate.getTime())) {
        throw new Error("Fecha de inicio inválida");
      }

      if (startDate < today) {
        throw new Error("La fecha de inicio no puede ser anterior a hoy");
      }
      return true;
    }),

  body("endDate")
    .notEmpty()
    .withMessage("La fecha de fin es obligatoria")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Formato de fecha de fin inválido (debe ser YYYY-MM-DD)")
    .custom(async (value, { req }) => {
      const startDate = new Date(req.body.startDate + "T00:00:00");
      const endDate = new Date(value + "T00:00:00");

      if (isNaN(endDate.getTime())) {
        throw new Error("Fecha de fin inválida");
      }

      if (endDate <= startDate) {
        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
      }

      // Validar que la reserva no sea más de 365 días
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 365) {
        throw new Error("La reserva no puede exceder 365 días");
      }

      // Verificar conflictos de fechas solo si tenemos apartment
      if (req.body.apartment) {
        const conflictingReservations = await Reservation.find({
          apartment: req.body.apartment,
          status: "confirmed",
          _id: { $ne: req.params.id },
          $and: [{ endDate: { $gt: startDate } }, { startDate: { $lt: endDate } }],
        });

        if (conflictingReservations.length > 0) {
          throw new Error("Las fechas seleccionadas ya están reservadas");
        }
      }

      return true;
    }),

  body("guestName")
    .trim()
    .notEmpty()
    .withMessage("El nombre del huésped es obligatorio")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre del huésped debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre del huésped solo puede contener letras y espacios"),

  body("guestEmail")
    .trim()
    .notEmpty()
    .withMessage("El email del huésped es obligatorio")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage("El email del huésped no puede exceder 100 caracteres"),

  body("status").optional().isIn(["confirmed", "cancelled"]).withMessage('El estado debe ser "confirmed" o "cancelled"'),

  body("paid").optional().isBoolean().withMessage("El estado de pago debe ser verdadero o falso"),

  body("totalPrice").optional().isNumeric().withMessage("El precio total debe ser un número").isFloat({ min: 0 }).withMessage("El precio total debe ser positivo"),
];

// --- VALIDACIONES PARA PARÁMETROS ---

/**
 * Validación para IDs de MongoDB
 */
export const validateMongoId = (paramName = "id") => [param(paramName).isMongoId().withMessage(`${paramName} inválido`)];

/**
 * Validación para paginación
 */
// export const validatePagination = [
//   body('page')
//     .optional()
//     .isInt({ min: 1 })
//     .withMessage('La página debe ser un número positivo'),

//   body('limit')
//     .optional()
//     .isInt({ min: 1, max: 100 })
//     .withMessage('El límite debe estar entre 1 y 100')
// ];

/**
 * Validación para filtros de búsqueda de apartamentos
 */
export const validateApartmentFilters = [
  body("province").optional().trim().isLength({ min: 2, max: 50 }).withMessage("La provincia debe tener entre 2 y 50 caracteres"),

  body("city").optional().trim().isLength({ min: 2, max: 50 }).withMessage("La ciudad debe tener entre 2 y 50 caracteres"),

  body("minPrice").optional().isFloat({ min: 0 }).withMessage("El precio mínimo debe ser positivo"),

  body("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El precio máximo debe ser positivo")
    .custom((value, { req }) => {
      if (req.body.minPrice && parseFloat(value) < parseFloat(req.body.minPrice)) {
        throw new Error("El precio máximo debe ser mayor al precio mínimo");
      }
      return true;
    }),

  body("guests").optional().isInt({ min: 1, max: 50 }).withMessage("El número de huéspedes debe estar entre 1 y 50"),

  body("startDate")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Formato de fecha de inicio inválido (debe ser YYYY-MM-DD)"),

  body("endDate")
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Formato de fecha de fin inválido (debe ser YYYY-MM-DD)")
    .custom((value, { req }) => {
      if (req.body.startDate && value) {
        const startDate = new Date(req.body.startDate + "T00:00:00");
        const endDate = new Date(value + "T00:00:00");

        if (endDate <= startDate) {
          throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
        }
      }
      return true;
    }),
];
