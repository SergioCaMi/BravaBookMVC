import multer from 'multer'; // Importa la librería Multer para el manejo de subidas de archivos.
import path from 'path';     // Importa el módulo 'path' para manipular rutas de archivos.
import fs from 'fs';         // Importa el módulo 'fs' para interactuar con el sistema de archivos.
import User from '../models/user.model.js'; // Importa el modelo de usuario para interactuar con la base de datos.

/**
 * Función auxiliar para asegurar que un directorio existe. Si no existe, lo crea.
 * @param {string} dirPath - La ruta del directorio a verificar o crear.
 */
const ensureDirExists = (dirPath) => {
  // Comprueba si el directorio en la ruta especificada no existe.
  if (!fs.existsSync(dirPath)) {
    // Si no existe, crea el directorio de forma recursiva, lo que significa
    // que también creará cualquier directorio padre necesario que no exista.
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// --- Configuración de Multer para la Subida de Avatares de Usuario ---

// Configura el almacenamiento en disco para las imágenes de avatar de usuario.
const storage = multer.diskStorage({
  /**
   * Define la carpeta de destino donde se guardarán los archivos.
   * La carpeta se crea basada en el nombre de usuario (extraído del email).
   * @param {object} req - El objeto de solicitud de Express.
   * @param {object} file - El archivo que se está subiendo.
   * @param {function} cb - La función callback que se usa para indicar el destino.
   */
  destination: async (req, file, cb) => {
    try {
      // Busca al usuario en la base de datos utilizando el ID de sesión.
      const user = await User.findById(req.session.userId);
      // Si el usuario no se encuentra, se devuelve un error.
      if (!user) {
        return cb(new Error('Usuario no encontrado'), null);
      }

      // Extrae la parte inicial del email del usuario para usarla como nombre de carpeta.
      // Por ejemplo, si el email es 'ejemplo@dominio.com', userBaseName será 'ejemplo'.
      const userBaseName = user.email.split('@')[0];

      // Construye la ruta completa donde se guardará la imagen:
      // public/uploads/usuarios/[nombreDeUsuarioBase]
      const uploadPath = path.join('public', 'uploads', 'usuarios', userBaseName);

      // Asegura que el directorio de destino exista. Si no existe, lo crea.
      ensureDirExists(uploadPath);

      // Llama al callback con 'null' para indicar que no hay error y la ruta de destino.
      cb(null, uploadPath);
    } catch (err) {
      // En caso de cualquier error durante la búsqueda del usuario o la creación del directorio,
      // pasa el error a Multer.
      cb(err, null);
    }
  },
  /**
   * Define el nombre del archivo guardado.
   * En este caso, todas las imágenes de avatar se guardan con el nombre fijo 'avatar.jpg'.
   * @param {object} req - El objeto de solicitud de Express.
   * @param {object} file - El archivo que se está subiendo.
   * @param {function} cb - La función callback que se usa para indicar el nombre del archivo.
   */
  filename: (req, file, cb) => {
    // Llama al callback con 'null' para indicar que no hay error y el nombre de archivo fijo.
    cb(null, 'avatar.jpg');
  }
});

/**
 * Middleware de Multer configurado con el almacenamiento definido.
 * Este 'upload' se puede usar en rutas para manejar la subida de archivos.
 * Por ejemplo: `router.post('/profile', upload.single('avatar'), ...)`
 */
export const upload = multer({ storage });