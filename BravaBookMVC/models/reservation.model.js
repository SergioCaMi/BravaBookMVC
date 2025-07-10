import mongoose from 'mongoose';

const { Schema } = mongoose;

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
  { timestamps: true }
);

// Calculamos el total
reservationSchema.pre('validate', async function (next) {
  if (!this.startDate || !this.endDate || !this.apartment) return next();

  try {
    const Apartment = mongoose.model('Apartment');
    const apartment = await Apartment.findById(this.apartment);

    if (!apartment) {
      return next(new Error('Apartamento no encontrado'));
    }

    const oneDay = 1000 * 60 * 60 * 24;
    const start = new Date(this.startDate).setHours(0, 0, 0, 0);
    const end = new Date(this.endDate).setHours(0, 0, 0, 0);
    const days = Math.ceil((end - start) / oneDay);

    if (days <= 0) {
      return next(new Error('La fecha de salida debe ser posterior a la de entrada'));
    }

    this.totalPrice = apartment.price * days;
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('Reservation', reservationSchema);
