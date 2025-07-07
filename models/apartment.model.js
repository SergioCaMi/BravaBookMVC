import mongoose from "mongoose";

const { Schema } = mongoose;

const apartmentSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  rules: [String],
  rooms: {
    type: Number,
    required: true,
  },
  bedsPerRoom: [Number],
  bathrooms: Number,
  photos: [
    {
      url: String,
      description: String,
      isMain: Boolean,
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  maxGuests: {
    type: Number,
    required: true,
  },
  squareMeters: {
    type: Number,
    required: true,
  },
  services: {
    airConditioning: Boolean,
    heating: Boolean,
    accessibility: Boolean,
    television: Boolean,
    kitchen: Boolean,
    internet: Boolean,
  },
  location: {
    province: String,
    city: String,
    gpsCoordinates: {
      lat: Number,
      lng: Number,
    },
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true, 
});

export default mongoose.model('Apartment', apartmentSchema);