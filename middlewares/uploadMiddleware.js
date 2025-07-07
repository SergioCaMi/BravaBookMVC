import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/user.model.js';

// Función para crear directorio si no existe
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Middleware de almacenamiento
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Buscar al usuario en la base de datos
      const user = await User.findById(req.session.userId);
      if (!user) {
        return cb(new Error('Usuario no encontrado'), null);
      }

      // Extraer nombre base del email
      const userBaseName = user.email.split('@')[0];

      // Ruta donde se guardará la imagen
      const uploadPath = path.join('public', 'uploads', 'usuarios', userBaseName);

      // Crear carpeta si no existe
      ensureDirExists(uploadPath);

      // Continuar con la ruta
      cb(null, uploadPath);
    } catch (err) {
      cb(err, null);
    }
  },
  filename: (req, file, cb) => {
    // Guardar siempre como avatar.jpg
    cb(null, 'avatar.jpg');
  }
});

export const upload = multer({ storage });