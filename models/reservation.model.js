import mongoose from 'mongoose'; 
const { Schema } = mongoose; 

// ********** Esquema de Reserva **********

/**
 * Define el esquema para las reservas de apartamentos.
 * Incluye referencias al apartamento y al usuario, fechas de la reserva,
 * información del huésped, estado, estado de pago y precio total.
 */
const reservationSchema = new Schema(
  {
    apartment: {
      type: Schema.Types.ObjectId, 
      ref: 'Apartment',            
      required: true,         
    },
    user: {
      type: Schema.Types.ObjectId, 
      ref: 'User',                 
      required: true,              
    },
    startDate: {
      type: Date,     
      required: true, 
    },
    endDate: {
      type: Date,     
      required: true, 
    },
    guestName: {
      type: String,   
      required: true, 
    },
    guestEmail: {
      type: String,   
      required: true, 
    },
    status: {
      type: String,           
      enum: ['confirmed', 'cancelled'], 
      default: 'confirmed',  
    },
    paid: {
      type: Boolean,  
      default: false, 
    },
    totalPrice: {
      type: Number,   
      required: true, 
    },
  },
  { timestamps: true } // Añade automáticamente campos `createdAt` y `updatedAt` para registrar la creación y última modificación.
);

// ********** Middleware Pre-Validación para Calcular el Precio Total **********

/**
 * Middleware 'pre' que se ejecuta antes de la validación de un documento de reserva.
 */
reservationSchema.pre('validate', async function (next) {

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
    next(); 
  } catch (error) {
 
    next(error);
  }
});

export default mongoose.model('Reservation', reservationSchema);