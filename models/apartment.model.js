import mongoose from "mongoose"; // Importa la librería Mongoose para la modelación de objetos en MongoDB.

const { Schema } = mongoose; // Desestructura Schema de mongoose para facilitar su uso.

// --- Esquema de Servicios ---

/**
 * Define el esquema para los servicios que ofrece un apartamento.
 * Cada propiedad es de tipo Boolean y tiene un valor por defecto de 'false'.
 */
const servicesSchema = new Schema({
  airConditioning: { type: Boolean, default: false }, // Indica si el apartamento tiene aire acondicionado.
  heating: { type: Boolean, default: false },       // Indica si el apartamento tiene calefacción.
  accessibility: { type: Boolean, default: false }, // Indica si el apartamento es accesible.
  television: { type: Boolean, default: false },    // Indica si el apartamento tiene televisión.
  kitchen: { type: Boolean, default: false },       // Indica si el apartamento tiene cocina.
  internet: { type: Boolean, default: false },      // Indica si el apartamento tiene conexión a internet.
});

// --- Esquema de Apartamento ---

/**
 * Define el esquema principal para los apartamentos.
 * Este esquema incluye detalles del apartamento, reglas, fotos, precios, capacidad,
 * servicios y ubicación, así como información de auditoría.
 */
const apartmentSchema = new Schema(
  {
    title: {
      type: String,
      required: true, // El título del apartamento es obligatorio.
    },
    description: {
      type: String,
      required: true, // La descripción del apartamento es obligatoria.
    },
    rules: {
      type: [String], // Array de cadenas para las reglas del apartamento.
      default: [],    // Por defecto, es un array vacío.
    },
    rooms: {
      type: Number,   // Número de habitaciones.
      default: 1,     // Por defecto, un apartamento tiene 1 habitación.
    },
    bedsPerRoom: {
      type: [Number], // Array de números que representa la cantidad de camas por cada habitación.
      default: [],    // Por defecto, es un array vacío.
    },
    bathrooms: {
      type: Number,   // Número de baños.
      default: 1,     // Por defecto, un apartamento tiene 1 baño.
    },
    photos: [
      {
        url: { type: String, default: "/img/default.jpg" }, // URL de la foto; por defecto, una imagen genérica.
        description: { type: String, default: "" },          // Descripción opcional de la foto.
        isMain: { type: Boolean, default: false },           // Indica si es la foto principal del apartamento.
      },
    ],
    price: {
      type: Number,
      required: true, // El precio por noche o período es obligatorio.
    },
    maxGuests: {
      type: Number,   // Número máximo de huéspedes permitidos.
      default: 1,     // Por defecto, permite al menos un huésped.
    },
    squareMeters: {
      type: Number,   // Superficie del apartamento en metros cuadrados.
      default: 0,     // Por defecto, 0 metros cuadrados.
    },
    services: servicesSchema, // Incrusta el esquema de servicios definido anteriormente.
    location: {
      province: {
        id: { type: Number, default: 0 },             // ID de la provincia.
        nm: { type: String, default: "No especificado" }, // Nombre de la provincia.
      },
      municipality: {
        id: { type: Number, default: 0 },             // ID del municipio.
        nm: { type: String, default: "No especificado" }, // Nombre del municipio.
      },
      gpsCoordinates: {
        lat: { type: Number, default: 0 },            // Latitud de las coordenadas GPS.
        lng: { type: Number, default: 0 },            // Longitud de las coordenadas GPS.
      },
    },
    active: {
      type: Boolean,  // Indica si el apartamento está activo y disponible.
      default: true,  // Por defecto, un apartamento recién creado está activo.
    },
    createdBy: {
      type: Schema.Types.ObjectId, // Referencia al ID de un usuario (propietario o administrador).
      ref: "User",                 // Especifica que se refiere al modelo 'User'.
      required: true,              // Es obligatorio saber quién creó el apartamento.
    },
  },
  {
    timestamps: true, // Añade automáticamente campos `createdAt` y `updatedAt` para registrar la creación y última modificación.
  }
);

// Exporta el modelo de Mongoose, creando la colección 'Apartment' en la base de datos.
export default mongoose.model("Apartment", apartmentSchema);