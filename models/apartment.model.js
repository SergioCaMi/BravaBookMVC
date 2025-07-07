import mongoose from "mongoose";
const { Schema } = mongoose;

const apartmentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    rules: {
      type: [String],
      default: [],
    },
    rooms: {
      type: Number,
      default: 1,
    },
    bedsPerRoom: {
      type: [Number],
      default: [],
    },
    bathrooms: {
      type: Number,
      default: 1,
    },
    photos: [
      {
        url: { type: String, default: "/img/default.jpg" },
        description: { type: String, default: "" },
        isMain: { type: Boolean, default: false },
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    maxGuests: {
      type: Number,
      default: 1,
    },
    squareMeters: {
      type: Number,
      default: 0,
    },
    services: {
      airConditioning: { type: Boolean, default: false },
      heating: { type: Boolean, default: false },
      accessibility: { type: Boolean, default: false },
      television: { type: Boolean, default: false },
      kitchen: { type: Boolean, default: false },
      internet: { type: Boolean, default: false },
    },
    location: {
      province: {
        id: { type: Number, default: 0 },
        nm: { type: String, default: "No especificado" },
      },
      municipality: {
        id: { type: Number, default: 0 },
        nm: { type: String, default: "No especificado" },
      },
      gpsCoordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Apartment", apartmentSchema);
