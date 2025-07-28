import mongoose from "mongoose"; 
const { Schema } = mongoose; 
// ********** Esquema de Servicios **********

/**
 * Define el esquema para los servicios que ofrece un apartamento.
 * Cada propiedad es de tipo Boolean y tiene un valor por defecto de 'false'.
 */
const servicesSchema = new Schema({
  airConditioning: { type: Boolean, default: false }, 
  heating: { type: Boolean, default: false },       
  accessibility: { type: Boolean, default: false }, 
  television: { type: Boolean, default: false },    
  kitchen: { type: Boolean, default: false },       
  internet: { type: Boolean, default: false },      
});

// ********** Esquema de Apartamento **********

/**
 * Define el esquema principal para los apartamentos.
 * Este esquema incluye detalles del apartamento, reglas, fotos, precios, capacidad,
 * servicios y ubicación, así como información de auditoría.
 */
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
    services: servicesSchema, 
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
    timestamps: true, // Añade automáticamente campos `createdAt` y `updatedAt` para registrar la creación y última modificación.
  }
);

export default mongoose.model("Apartment", apartmentSchema);
