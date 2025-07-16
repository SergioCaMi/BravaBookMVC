import mongoose from 'mongoose'; // Importa la librería Mongoose para la modelación de objetos en MongoDB.

const { Schema } = mongoose; // Desestructura Schema de mongoose para facilitar su uso.

// --- Esquema de Reserva ---

/**
 * Define el esquema para las reservas de apartamentos.
 * Incluye referencias al apartamento y al usuario, fechas de la reserva,
 * información del huésped, estado, estado de pago y precio total.
 */
const reservationSchema = new Schema(
  {
    apartment: {
      type: Schema.Types.ObjectId, // Tipo de dato ObjectId, que es una referencia a otro documento.
      ref: 'Apartment',            // Hace referencia al modelo 'Apartment'.
      required: true,              // El apartamento asociado a la reserva es obligatorio.
    },
    user: {
      type: Schema.Types.ObjectId, // Tipo de dato ObjectId.
      ref: 'User',                 // Hace referencia al modelo 'User'.
      required: true,              // El usuario que realiza la reserva es obligatorio.
    },
    startDate: {
      type: Date,     // Fecha de inicio de la reserva.
      required: true, // La fecha de inicio es obligatoria.
    },
    endDate: {
      type: Date,     // Fecha de fin de la reserva.
      required: true, // La fecha de fin es obligatoria.
    },
    guestName: {
      type: String,   // Nombre del huésped.
      required: true, // El nombre del huésped es obligatorio.
    },
    guestEmail: {
      type: String,   // Correo electrónico del huésped.
      required: true, // El correo electrónico del huésped es obligatorio.
    },
    status: {
      type: String,           // Estado actual de la reserva.
      enum: ['confirmed', 'cancelled'], // Solo puede ser 'confirmed' (confirmada) o 'cancelled' (cancelada).
      default: 'confirmed',   // Por defecto, una reserva se crea como 'confirmed'.
    },
    paid: {
      type: Boolean,  // Indica si la reserva ha sido pagada.
      default: false, // Por defecto, una reserva no está pagada.
    },
    totalPrice: {
      type: Number,   // Precio total de la reserva.
      required: true, // El precio total es obligatorio. Este campo se calculará antes de la validación.
    },
  },
  { timestamps: true } // Añade automáticamente campos `createdAt` y `updatedAt` para registrar la creación y última modificación.
);

// --- Middleware Pre-Validación para Calcular el Precio Total ---

/**
 * Middleware 'pre' que se ejecuta antes de la validación de un documento de reserva.
 * Su propósito es calcular automáticamente el `totalPrice` de la reserva
 * basándose en la duración y el precio por noche del apartamento.
 */
reservationSchema.pre('validate', async function (next) {
  // Si no hay fecha de inicio, fecha de fin o apartamento, no se puede calcular el precio, así que se pasa al siguiente middleware.
  if (!this.startDate || !this.endDate || !this.apartment) {
    return next();
  }

  try {
    // Se obtiene el modelo 'Apartment' para buscar el apartamento asociado a la reserva.
    const Apartment = mongoose.model('Apartment');
    const apartment = await Apartment.findById(this.apartment);

    // Si el apartamento no se encuentra, se devuelve un error.
    if (!apartment) {
      return next(new Error('Apartamento no encontrado'));
    }

    // Define la duración de un día en milisegundos.
    const oneDay = 1000 * 60 * 60 * 24;

    // Normaliza las fechas de inicio y fin a la medianoche (00:00:00) para asegurar un cálculo de días preciso.
    const start = new Date(this.startDate).setHours(0, 0, 0, 0);
    const end = new Date(this.endDate).setHours(0, 0, 0, 0);

    // Calcula el número de días completos de la reserva (redondeando hacia arriba para incluir el día de salida si se pasa la medianoche).
    const days = Math.ceil((end - start) / oneDay);

    // Si la duración es cero o negativa, significa que la fecha de salida no es posterior a la de entrada, lo cual es un error.
    if (days <= 0) {
      return next(new Error('La fecha de salida debe ser posterior a la de entrada'));
    }

    // Calcula el precio total multiplicando el precio del apartamento por el número de días.
    this.totalPrice = apartment.price * days;
    next(); // Pasa al siguiente paso del proceso de validación.
  } catch (error) {
    // Si ocurre algún error durante el proceso (ej. error de base de datos al buscar el apartamento),
    // pasa el error al siguiente middleware.
    next(error);
  }
});

// Exporta el modelo de Mongoose, creando la colección 'Reservation' en la base de datos.
export default mongoose.model('Reservation', reservationSchema);