import mongoose from "mongoose";

const { Schema } = mongoose;

const reservationSchema = new Schema({
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
    enum: ["confirmed", "cancelled"],
    default: "confirmed",
  },
  paid: {
    type: Boolean,
    default: false,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Reservation', reservationSchema);