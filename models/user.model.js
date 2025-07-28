import mongoose from "mongoose"; 
import bcrypt from "bcrypt";     


// ********** Esquema de Usuario **********

/**
 * Define el esquema para los usuarios en la base de datos.
 * Incluye campos como nombre, email, contraseña (hasheada), rol, biografía y avatar.
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,     
    default: "Usuario",  
  },
  email: {
    type: String,
    required: true,      
    unique: true,        
  },
  password: {
    type: String,
    required: true,     
  },
  role: {
    type: String,
    enum: ["user", "admin"], 
    default: "user",         
  },
  isSuperAdmin: {
    type: Boolean,
    default: false,          
  },
  bio: {
    type: String,
    default: "",           
  },
  avatar: {
    type: String,
    default: "default.jpg", 
  },
});

// ********** Middleware Pre-Guardado para Encriptar Contraseña **********

/**
 * Middleware 'pre' que se ejecuta antes de guardar un documento de usuario en la base de datos.
 * Su propósito es hashear la contraseña si ha sido modificada.
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next(); 
});

// ********** Método de Instancia para Comparar Contraseñas **********

/**
 * Añade un método a las instancias del modelo User para comparar una contraseña candidata
 * (introducida por el usuario) con la contraseña hasheada almacenada en la base de datos.
 * @param {string} candidatePassword - La contraseña proporcionada por el usuario para la verificación.
 * @returns {Promise<boolean>} - Una promesa que resuelve a `true` si las contraseñas coinciden, `false` en caso contrario.
 */
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);