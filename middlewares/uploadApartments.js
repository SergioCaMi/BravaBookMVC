import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid'; 
// Función para crear directorio si no existe
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};


// Función para la edición de apartamentos
// Configuramos el almacenamiento
const storageApartmentImages = multer.diskStorage({
  // Configuramos donde lo guardamos
  destination: async (req, file, cb) => {
    try {
      const apartmentId = req.params.id;

      if (!apartmentId) {
        return cb(
          new Error(
            "ID de apartamento no proporcionado en la URL para la subida de imágenes."
          ),
          null
        );
      }

      const uploadPath = path.join(
        "public",
        "uploads",
        "apartments",
        apartmentId
      );

      // Asegúrate de que esta carpeta exista antes de intentar guardar la imagen
      ensureDirExists(uploadPath);

      // Confimrmos destino
      cb(null, uploadPath);
    } catch (err) {
      console.error(
        "Error al determinar la carpeta de destino para la imagen del apartamento:",
        err
      );
      cb(err, null); // Pasa el error a Multer
    }
  },
//   Configuramos nombre de la imagen
  filename: (req, file, cb) => {
    // Generamos un nombre de archivo único  
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Obtenemos la extensión original 
    const fileExtension = path.extname(file.originalname); 
    // Crea el nombre final del archivo. 
    const filename = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
    // Confirmamos nombre de archivo
    cb(null, filename);
  },
});

export const uploadApartmentImages = multer({
  storage: storageApartmentImages,
});

// Archivos temporales antes de tener el Id del apartamento
const storageNewApartmentTempImages = multer.diskStorage({
    destination: (req, file, cb) => {
        // Generamos un ID único para esta subida temporal 
        const tempUploadId = uuidv4(); 
        // Creamos una carpeta temporal específica para esta solicitud de creación
        const tempUploadPath = path.join('public', 'uploads', 'temp_apartment_creations', tempUploadId);
        
        ensureDirExists(tempUploadPath);
        
        // Guardamos la ruta temporal en el objeto `req` para que podamos acceder a ella
        // en el controlador después de que Multer haya terminado.
        req.tempUploadDir = tempUploadPath; 

        cb(null, tempUploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
    }
});

export const uploadNewApartmentTempImages = multer({
    storage: storageNewApartmentTempImages
});