import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Función para crear directorio si no existe (la misma que ya tienes)
const ensureDirExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// --- Nueva Configuración de almacenamiento para IMÁGENES de Apartamentos ---
const storageApartmentImages = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            // ¡CLAVE AQUÍ! Obtener el ID del apartamento de los parámetros de la URL
            // Asumimos que tu ruta será algo como: /admin/apartments/:apartmentId/upload-image
            const apartmentId = req.params.id;

            if (!apartmentId) {
                // Si el ID no está en la URL, no podemos crear la carpeta correcta
                return cb(new Error('ID de apartamento no proporcionado en la URL para la subida de imágenes.'), null);
            }

            // Define la ruta completa de la carpeta: public/uploads/apartments/<apartmentId>/
            const uploadPath = path.join('public', 'uploads', 'apartments', apartmentId);

            // Asegúrate de que esta carpeta exista antes de intentar guardar la imagen
            ensureDirExists(uploadPath);

            // Indica a Multer que este es el destino final
            cb(null, uploadPath);
        } catch (err) {
            console.error("Error al determinar la carpeta de destino para la imagen del apartamento:", err);
            cb(err, null); // Pasa el error a Multer
        }
    },
    filename: (req, file, cb) => {
        // Genera un nombre de archivo único para evitar que las fotos se sobrescriban
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname); // Obtiene la extensión original (ej. .jpg, .png)

        // Crea el nombre final del archivo. Puedes incluir el nombre del campo (ej. 'mainPhoto-123.jpg')
        const filename = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;

        cb(null, filename);
    }
});

// Exporta esta instancia de Multer para usarla en tus rutas
export const uploadApartmentImages = multer({ storage: storageApartmentImages });