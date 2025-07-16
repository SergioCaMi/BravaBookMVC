import mongoose from "mongoose"; // Importa la librería Mongoose para la modelación de objetos en MongoDB.
import bcrypt from "bcrypt";     // Importa la librería bcrypt para el hashing y comparación de contraseñas.

// --- Esquema de Usuario ---

/**
 * Define el esquema para los usuarios en la base de datos.
 * Incluye campos como nombre, email, contraseña (hasheada), rol, biografía y avatar.
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,      // El nombre es un campo obligatorio.
    default: "Usuario",  // Valor por defecto si no se proporciona.
  },
  email: {
    type: String,
    required: true,      // El email es un campo obligatorio.
    unique: true,        // El email debe ser único en la colección.
  },
  password: {
    type: String,
    required: true,      // La contraseña es un campo obligatorio.
  },
  role: {
    type: String,
    enum: ["user", "admin"], // El rol solo puede ser 'user' o 'admin'.
    default: "user",         // El rol por defecto es 'user'.
  },
  bio: {
    type: String,
    default: "",           // Campo de biografía opcional, por defecto cadena vacía.
  },
  avatar: {
    type: String,
    default: "default.jpg", // Nombre de archivo de la imagen de avatar, por defecto 'default.jpg'.
  },
});

// --- Middleware Pre-Guardado para Encriptar Contraseña ---

/**
 * Middleware 'pre' que se ejecuta antes de guardar un documento de usuario en la base de datos.
 * Su propósito es hashear la contraseña si ha sido modificada.
 */
userSchema.pre("save", async function (next) {
  // `this` se refiere al documento de usuario que se va a guardar.
  // Si la contraseña no ha sido modificada, pasa al siguiente middleware sin hacer nada.
  if (!this.isModified("password")) {
    return next();
  }
  // Si la contraseña ha sido modificada, la hashea con un coste de 10 rondas de salado.
  this.password = await bcrypt.hash(this.password, 10);
  next(); // Pasa al siguiente paso del proceso de guardado.
});

// --- Método de Instancia para Comparar Contraseñas ---

/**
 * Añade un método a las instancias del modelo User para comparar una contraseña candidata
 * (introducida por el usuario) con la contraseña hasheada almacenada en la base de datos.
 * @param {string} candidatePassword - La contraseña proporcionada por el usuario para la verificación.
 * @returns {Promise<boolean>} - Una promesa que resuelve a `true` si las contraseñas coinciden, `false` en caso contrario.
 */
userSchema.methods.comparePassword = function (candidatePassword) {
  // `this.password` se refiere a la contraseña hasheada almacenada en el documento del usuario.
  return bcrypt.compare(candidatePassword, this.password);
};

// Exporta el modelo de Mongoose, creando la colección 'User' en la base de datos.
export default mongoose.model("User", userSchema);