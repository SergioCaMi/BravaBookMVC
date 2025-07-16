import multer from "multer"; // Importa la librería Multer para manejar subidas de archivos.
import path from "path"; // Importa el módulo 'path' para trabajar con rutas de archivos y directorios.
import fs from "fs"; // Importa el módulo 'fs' para interactuar con el sistema de archivos.
import { v4 as uuidv4 } from 'uuid'; // Importa la función v4 de 'uuid' para generar IDs únicos.

/**
 * Función auxiliar para asegurar que un directorio existe. Si no existe, lo crea.
 * @param {string} dirPath - La ruta del directorio a verificar/crear.
 */
const ensureDirExists = (dirPath) => {
  // Comprueba si el directorio no existe.
  if (!fs.existsSync(dirPath)) {
    // Si no existe, lo crea de forma recursiva (crea directorios anidados si es necesario).
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// --- Configuración de Multer para la Edición de Apartamentos ---

// Configura el almacenamiento en disco para las imágenes de apartamentos existentes (edición).
const storageApartmentImages = multer.diskStorage({
  /**
   * Define la carpeta de destino para guardar las imágenes.
   * Se guarda en una subcarpeta específica del apartamento usando su ID.
   * @param {object} req - El objeto de solicitud de Express.
   * @param {object} file - El archivo que se está subiendo.
   * @param {function} cb - La función callback para indicar el destino.
   */
  destination: async (req, file, cb) => {
    try {
      // Obtiene el ID del apartamento de los parámetros de la solicitud.
      const apartmentId = req.params.id;

      // Si no se proporciona el ID del apartamento, se produce un error.
      if (!apartmentId) {
        return cb(
          new Error(
            "ID de apartamento no proporcionado en la URL para la subida de imágenes."
          ),
          null
        );
      }

      // Construye la ruta de subida final: public/uploads/apartments/[apartmentId]
      const uploadPath = path.join(
        "public",
        "uploads",
        "apartments",
        apartmentId
      );

      // Asegura que la carpeta de destino exista antes de guardar el archivo.
      ensureDirExists(uploadPath);

      // Confirma la carpeta de destino a Multer.
      cb(null, uploadPath);
    } catch (err) {
      // Manejo de errores si algo sale mal al determinar la ruta de destino.
      console.error(
        "Error al determinar la carpeta de destino para la imagen del apartamento:",
        err
      );
      cb(err, null); // Pasa el error a Multer.
    }
  },
  /**
   * Define el nombre del archivo guardado.
   * Genera un nombre único para evitar colisiones.
   * @param {object} req - El objeto de solicitud de Express.
   * @param {object} file - El archivo que se está subiendo.
   * @param {function} cb - La función callback para indicar el nombre del archivo.
   */
  filename: (req, file, cb) => {
    // Genera un sufijo único usando la marca de tiempo actual y un número aleatorio.
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Obtiene la extensión original del archivo (ej. .jpg, .png).
    const fileExtension = path.extname(file.originalname);
    // Crea el nombre final del archivo: [nombreCampo]-[sufijoUnico][extension].
    const filename = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
    // Confirma el nombre del archivo a Multer.
    cb(null, filename);
  },
});

/**
 * Middleware de Multer para la subida de imágenes de apartamentos (edición).
 * Utiliza la configuración de almacenamiento `storageApartmentImages`.
 */
export const uploadApartmentImages = multer({
  storage: storageApartmentImages,
});

// --- Configuración de Multer para la Creación de Nuevos Apartamentos (Temporal) ---

// Configura el almacenamiento en disco para las imágenes temporales de nuevos apartamentos.
// Estas imágenes se guardan en una carpeta temporal hasta que el apartamento tiene un ID.
const storageNewApartmentTempImages = multer.diskStorage({
  /**
   * Define la carpeta de destino temporal para guardar las imágenes de nuevos apartamentos.
   * Se crea una carpeta única para cada subida temporal.
   * @param {object} req - El objeto de solicitud de Express.
   * @param {object} file - El archivo que se está subiendo.
   * @param {function} cb - La función callback para indicar el destino.
   */
  destination: (req, file, cb) => {
    // Genera un ID único para esta operación de subida temporal.
    const tempUploadId = uuidv4();
    // Construye la ruta de la carpeta temporal: public/uploads/temp_apartment_creations/[tempUploadId].
    const tempUploadPath = path.join('public', 'uploads', 'temp_apartment_creations', tempUploadId);

    // Asegura que la carpeta temporal exista.
    ensureDirExists(tempUploadPath);

    // Guarda la ruta temporal en `req.tempUploadDir` para que el controlador pueda acceder a ella
    // y realizar la limpieza posteriormente.
    req.tempUploadDir = tempUploadPath;

    // Confirma la carpeta de destino a Multer.
    cb(null, tempUploadPath);
  },
  /**
   * Define el nombre del archivo guardado en la carpeta temporal.
   * Genera un nombre único similar al anterior.
   * @param {object} req - El objeto de solicitud de Express.
   * @param {object} file - El archivo que se está subiendo.
   * @param {function} cb - La función callback para indicar el nombre del archivo.
   */
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  }
});

/**
 * Middleware de Multer para la subida temporal de imágenes al crear nuevos apartamentos.
 * Utiliza la configuración de almacenamiento `storageNewApartmentTempImages`.
 */
export const uploadNewApartmentTempImages = multer({
  storage: storageNewApartmentTempImages
});