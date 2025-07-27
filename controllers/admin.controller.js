import User from "../models/user.model.js";
import Apartment from "../models/apartment.model.js";
import Reservation from "../models/reservation.model.js";
import fs from "fs/promises"; 
import path from "path"; 
import { validationResult } from 'express-validator';


// *************************** createdBy: req.session.userId, ***************************

//  Gestión de Usuarios 

/**
 * Renderiza el dashboard del administrador con información del usuario, reservas y apartamentos.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const dashboard = async (req, res) => {
  console.log("Dashboard - Acceso de administrador");
  try {
    const user = await User.findById(req.session.userId);
    const myReservations = await Reservation.find({
      user: req.session.userId,
    })
      .populate("apartment")
      .limit(10)
      .sort({ endDate: 1 });
    const myApartments = await Apartment.find({
      createdBy: req.session.userId,
    }).populate("createdBy").limit(50);
    const apartmentIds = myApartments.map(apt => apt._id);
    const reservationsInMyApartments = await Reservation.find({
      apartment: { $in: apartmentIds }
    })
      .populate("apartment")
      .populate("user")
      .limit(10)
      .sort({ endDate: 1 });
    const allReservations = [...myReservations, ...reservationsInMyApartments];
    res.render("dashboard", { 
      title: "home", 
      user, 
      currentUser: user, 
      reservations: allReservations, 
      apartments: myApartments, 
      myReservations, 
      myApartments, 
      reservationsInMyApartments 
    });
  } catch (error) {
    console.error("Error al cargar el dashboard:", error);
    req.flash("error_msg", "Error al cargar el dashboard.");
    res.redirect("/");
  }
};

/**
 * Muestra el formulario para editar el perfil de un usuario (admin).
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const getEditProfile = async (req, res) => {
  const { id } = req.params; 
  console.log(`Accediendo a editar perfil con ID (actualmente no usado): ${id}`);
  res.render("aboutUs", { title: "about", error: undefined }); // Esto parece incorrecto, debería ser 'editProfile'
};

/**
 * Actualiza el perfil de un usuario (admin). Maneja la subida y eliminación de avatares.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const postUpdateProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;

    if (!name || !email) {
      req.flash("error_msg", "Nombre y correo electrónico son obligatorios.");
      return res.status(400).redirect("/admin/profile/edit");
    }

    const updates = { name, email, bio };
    const currentUser = await User.findById(req.session.userId); // Obtener el usuario actual para verificar el avatar

    if (req.file) { // Si se subió un nuevo archivo de avatar
      // Elimina el avatar anterior si no es el predeterminado
      if (currentUser.avatar && currentUser.avatar !== "default.jpg") {
        const oldAvatarPath = path.join(
          process.cwd(),
          "public",
          "uploads",
          "avatars",
          currentUser.avatar
        );
        try {
          await fs.unlink(oldAvatarPath);
          console.log(`Avatar anterior ${oldAvatarPath} eliminado.`);
        } catch (err) {
          if (err.code === "ENOENT") {
            console.warn(`Intento de eliminar avatar que no existe: ${oldAvatarPath}`);
          } else {
            console.error(`Error al eliminar avatar anterior ${oldAvatarPath}:`, err);
          }
        }
      }
      updates.avatar = req.file.filename; // Asigna el nuevo nombre de archivo del avatar
    }

    await User.findByIdAndUpdate(req.session.userId, updates); // Actualiza el usuario en la base de datos

    req.flash("success_msg", "Perfil actualizado exitosamente.");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Error al actualizar el perfil:", err);
    req.flash(
      "error_msg",
      "Hubo un error al guardar los cambios. Inténtalo de nuevo."
    );
    res.status(500).redirect("/admin/profile/edit");
  }
};

/**
 * Obtiene y muestra una lista de todos los usuarios registrados.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ name: 1 }); // Obtiene todos los usuarios, ordenados por nombre
    const currentUser = await User.findById(req.session.userId); // Obtiene el usuario actual
    res.render("users.ejs", { title: "admin", error: undefined, users, currentUser });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).render("error.ejs", {
      message: "Error interno del servidor al obtener usuarios",
      status: 500,
    });
  }
};

/**
 * Elimina un usuario por su ID.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const postDeleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Evita que un usuario se elimine a sí mismo (asumiendo req.user es el usuario logueado)
    if (id !== req.user._id.toString()) {
      const deletedUser = await User.findByIdAndDelete(id);
      if (deletedUser) {
        req.flash("success_msg", `Usuario "${deletedUser.name}" eliminado satisfactoriamente.`);
      } else {
        req.flash("error_msg", "Usuario no encontrado.");
      }
    } else {
      req.flash("error_msg", "No puedes eliminar tu propio usuario desde aquí.");
    }
    return res.redirect("/admin/users");
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    req.flash("error_msg", "Error al eliminar usuario.");
    return res.redirect("/admin/users");
  }
};

/**
 * Alterna el rol de un usuario entre 'admin' y 'user'.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const postToggleUserRole = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      req.flash("error_msg", "Usuario no encontrado.");
      return res.redirect("/admin/users");
    }

    // Evita que un usuario cambie su propio rol
    if (id === req.session.userId) {
      req.flash("error_msg", "No puedes cambiar tu propio rol.");
      return res.redirect("/admin/users");
    }

    // Alterna el rol
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    user.role = newRole;
    await user.save();

    const roleText = newRole === 'admin' ? 'Administrador' : 'Usuario';
    req.flash("success_msg", `Rol de "${user.name}" cambiado a ${roleText} satisfactoriamente. 🔄`);
    return res.redirect("/admin/users");
  } catch (error) {
    console.error("Error al cambiar el rol del usuario:", error);
    req.flash("error_msg", "Error al cambiar el rol del usuario.");
    return res.redirect("/admin/users");
  }
};

export const getAdminPanel = async (req, res) => {
    const currentUser = await User.findById(req.session.userId);
    
    // Solo apartamentos creados por el usuario actual
    const apartments = await Apartment.find({
      createdBy: req.session.userId
    }).populate("createdBy");
    
    const users = await User.find({});
    
    // Solo reservas relacionadas con los apartamentos del usuario actual
    const apartmentIds = apartments.map(apt => apt._id);
    const reservations = await Reservation.find({
      $or: [
        { user: req.session.userId }, // Reservas hechas por el usuario
        { apartment: { $in: apartmentIds } } // Reservas en apartamentos del usuario
      ]
    }).populate("apartment").populate("user");

    res.render('adminPanel', {
      title: "admin", 
      apartments, 
      reservations, 
      users,
      currentUser: currentUser,
      isSuperAdmin: currentUser.isSuperAdmin
    });
}


/**
 * Muestra el formulario para añadir un nuevo apartamento.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const getNewApartment = async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.userId);
    res.render("addApartment.ejs", { 
      title: "admin", 
      error: undefined,
      currentUser: currentUser
    });
  } catch (error) {
    console.error("Error al cargar el formulario de nuevo apartamento:", error);
    req.flash("error_msg", "Error al cargar el formulario.");
    res.redirect("/admin");
  }
};

/**
 * Función auxiliar para mover archivos. Maneja movimientos dentro del mismo dispositivo o copia + eliminación entre diferentes.
 * @param {string} oldPath - Ruta original del archivo.
 * @param {string} newPath - Nueva ruta de destino del archivo.
 */
async function moveFile(oldPath, newPath) {
  try {
    await fs.rename(oldPath, newPath); // Intenta renombrar (mover) el archivo
    console.log(`Archivo movido de ${oldPath} a ${newPath}`);
  } catch (err) {
    if (err.code === "EXDEV") { // Error si las rutas están en diferentes sistemas de archivos
      await fs.copyFile(oldPath, newPath); // Copia el archivo
      await fs.unlink(oldPath); // Elimina el original
      console.log(`Archivo copiado y eliminado original de ${oldPath} a ${newPath}`);
    } else {
      throw err; // Re-lanza otros errores
    }
  }
}

/**
 * Procesa la creación de un nuevo apartamento, incluyendo la subida de imágenes.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const postNewApartment = async (req, res) => {
  console.log("=== POST NEW APARTMENT INICIADO ===");
  console.log("URL solicitada:", req.originalUrl);
  console.log("Método:", req.method);
  console.log("Datos recibidos para nuevo apartamento (req.body):", req.body);
  // req.files contendrá los archivos subidos a través de Multer.
  // req.body.newPhotos contendrá los datos del formulario, incluyendo descripciones y URLs.
  console.log("Archivos temporales recibidos por Multer (req.files):", req.files);

  // Verificar errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("=== ERRORES DE VALIDACIÓN ENCONTRADOS ===");
    const errorMessages = errors.array().map(error => error.msg);
    console.log("Errores:", errorMessages);
    req.flash("error_msg", errorMessages.join(', '));
    return res.redirect("/admin/apartment/new");
  }

  console.log("=== VALIDACIÓN PASADA, PROCESANDO APARTAMENTO ===");

  const tempUploadDir = req.tempUploadDir; // Directorio temporal de Multer
  let newApartment = null; // Se inicializa para limpieza en el 'finally'

  try {
    const {
      title,
      description,
      rooms,
      bathrooms,
      price,
      maxGuests,
      squareMeters,
      mainPhotoIndex, // Este campo ahora puede ser 'new_0', 'new_1', etc.
    } = req.body;

    // `req.body.newPhotos` será un objeto donde las claves son los índices
    // del array en el frontend, y los valores son los objetos de foto.
    // Ej: { '0': { uploadType: 'file', description: '...' }, '1': { uploadType: 'url', url: '...', description: '...' } }
    const newPhotosData = req.body.newPhotos || {};

    const photosToSave = []; // Array para almacenar las URLs de las fotos finales

    // Parsing y filtrado de reglas
    const rules = Array.isArray(req.body.rules)
      ? req.body.rules.map((r) => r.trim()).filter((r) => r.length > 0)
      : [];

    // Conversión de servicios a booleano
    const services = {
      airConditioning: req.body.services?.airConditioning === "on",
      heating: req.body.services?.heating === "on",
      accessibility: req.body.services?.accessibility === "on",
      television: req.body.services?.television === "on",
      kitchen: req.body.services?.kitchen === "on",
      internet: req.body.services?.internet === "on",
    };

    // Parsing y manejo de la localización
    const location = {
      province: {
        id: req.body.location?.province?.id
          ? Number(req.body.location.province.id)
          : 0,
        nm: req.body.location?.province?.nm || "No especificado",
      },
      municipality: {
        id: req.body.location?.municipality?.id
          ? Number(req.body.location.municipality.id)
          : 0,
        nm: req.body.location?.municipality?.nm || "No especificado",
      },
      gpsCoordinates: {
        lat: req.body.location?.gpsCoordinates?.lat
          ? Number(req.body.location.gpsCoordinates.lat)
          : 0,
        lng: req.body.location?.gpsCoordinates?.lng
          ? Number(req.body.location.gpsCoordinates.lng)
          : 0,
      },
    };

    // Parsing de camas por habitación
    let bedsPerRoom = [];
    if (Array.isArray(req.body.bedsPerRoom)) {
      bedsPerRoom = req.body.bedsPerRoom
        .map((num) => parseInt(num, 10))
        .filter((num) => !isNaN(num) && num >= 0);
    }

    // Crea una nueva instancia de Apartamento (sin fotos iniciales, se añadirán después)
    newApartment = new Apartment({
      title,
      description,
      rules,
      rooms: Number(rooms),
      bedsPerRoom,
      bathrooms: Number(bathrooms),
      photos: [], // Se llenará más tarde
      price: Number(price),
      maxGuests: Number(maxGuests),
      squareMeters: Number(squareMeters),
      services,
      location,
      active: true,
      createdBy: req.session.userId, // Asigna el usuario logueado como creador
    });

    await newApartment.save(); // Guarda el apartamento para obtener un ID

    const finalApartmentPhotoDir = path.join(
      "public",
      "uploads",
      "apartments",
      newApartment._id.toString() // Usa el ID del apartamento para la carpeta
    );
    await fs.mkdir(finalApartmentPhotoDir, { recursive: true }); // Crea la carpeta del apartamento si no existe

    // 1. Procesar fotos subidas por archivo (a través de Multer)
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        // El 'originalname' de Multer contiene el nombre original del archivo.
        // El 'filename' de Multer contiene el nombre que Multer le dio en el directorio temporal.
        const originalIndex = parseInt(file.fieldname.match(/\[(\d+)\]/)[1], 10); // Extrae el índice del campo de Multer, ej: newPhotos[0][file] -> 0

        const oldFilePath = file.path;
        const newFileName = file.filename; // Multer ya debería haberle dado un nombre único
        const newFilePath = path.join(finalApartmentPhotoDir, newFileName);
        const publicUrl = `/uploads/apartments/${newApartment._id.toString()}/${newFileName}`;

        try {
          await moveFile(oldFilePath, newFilePath); // Mueve el archivo del temporal al final
          const descriptionPhoto = newPhotosData[originalIndex]?.description || ""; // Obtiene la descripción del objeto 'newPhotosData'
          // Compara con el valor del radio button principal (ej: 'new_0')
          const isMainPhoto = `new_${originalIndex}` === mainPhotoIndex;

          photosToSave.push({
            url: publicUrl,
            description: descriptionPhoto,
            isMain: isMainPhoto,
          });
        } catch (moveErr) {
          console.error(`Error al mover el archivo ${file.filename}:`, moveErr);
          // Opcional: manejar el error, quizás eliminando el archivo ya creado o notificando al usuario
        }
      }
    }

    // 2. Procesar fotos proporcionadas por URL
    // Recorremos los datos de `newPhotosData` enviados desde el frontend.
    for (const index in newPhotosData) {
        const photoData = newPhotosData[index];

        // Si la foto es de tipo 'url' y tiene una URL válida
        if (photoData.uploadType === 'url' && photoData.url) {
            const isMainPhoto = `new_${index}` === mainPhotoIndex;
            photosToSave.push({
                url: photoData.url,
                description: photoData.description || "",
                isMain: isMainPhoto,
            });
        }
        // Nota: Las fotos de tipo 'file' ya se han procesado en el bloque anterior `req.files`.
        // Evitamos duplicar la lógica para las subidas de archivos aquí.
    }


    // Ordena las fotos para que la principal quede al principio
    // Esto es opcional, pero ayuda a la consistencia
    photosToSave.sort((a, b) => {
        if (a.isMain && !b.isMain) return -1;
        if (!a.isMain && b.isMain) return 1;
        return 0;
    });

    // Actualiza el apartamento con las URLs de las fotos finales
    newApartment.photos = photosToSave;
    await newApartment.save();

    req.flash("success_msg", "El apartamento se ha creado satisfactoriamente. 🎉");
    res.redirect("/admin");
  } catch (error) {
    console.error("Error al crear el apartamento:", error.message);
    req.flash("error_msg", "Hubo un error al crear el apartamento. Por favor, inténtalo de nuevo.");
    res.redirect("/admin/apartment/new"); // Redirige de vuelta al formulario de creación
  } finally {
    // Limpieza: Elimina la carpeta temporal de Multer
    if (tempUploadDir) {
      try {
        await fs.rm(tempUploadDir, { recursive: true, force: true });
        console.log(`Carpeta temporal ${tempUploadDir} eliminada.`);
      } catch (cleanErr) {
        if (cleanErr.code === 'ENOENT') {
          console.log(`Carpeta temporal ${tempUploadDir} no encontrada o ya eliminada. No se requiere limpieza.`);
        } else {
          console.error(`Error al limpiar la carpeta temporal ${tempUploadDir}:`, cleanErr);
        }
      }
    }
  }
};
/**
 * Obtiene y muestra el formulario para editar un apartamento existente.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const getApartmentEdit = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Solo permite editar apartamentos creados por el usuario actual
    const apartment = await Apartment.findOne({
      _id: id,
      createdBy: req.session.userId
    });
    
    if (!apartment) {
      req.flash("error_msg", "El apartamento no se ha encontrado o no tienes permisos para editarlo.");
      return res.redirect("/admin");
    }
    
    res.render("editApartment.ejs", { title: "admin", apartment: apartment });
  } catch (err) {
    console.error("Error al obtener apartamento para edición:", err);
    req.flash("error_msg", "Error interno del servidor al obtener apartamento.");
    res.redirect("/admin");
  }
};

/**
 * Actualiza un apartamento existente, incluyendo la gestión de fotos.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const putApartmentEdit = async (req, res) => {
  const { id } = req.params;
  const tempUploadDir = req.tempUploadDir; // Directorio temporal de Multer

  // Verificar errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    req.flash("error", errorMessages.join(', '));
    return res.redirect(`/admin/apartments/${id}/edit`);
  }

  try {
    // Solo permite editar apartamentos creados por el usuario actual
    const apartment = await Apartment.findOne({
      _id: id,
      createdBy: req.session.userId
    });
    
    if (!apartment) {
      req.flash("error_msg", "Apartamento no encontrado o no tienes permisos para editarlo.");
      return res.redirect("/admin");
    }

    const {
      title,
      description,
      rooms: roomsStr,
      bathrooms: bathroomsStr,
      price: priceStr,
      maxGuests: maxGuestsStr,
      squareMeters: squareMetersStr,
      mainPhotoIndex,
      deletedPhotoIndexes = [],
      existingPhotos = [],
      newPhotos = [], // Asegurarse de que sea un array
    } = req.body;

    // Función auxiliar para parsear números de forma segura
    const parseNumber = (value, defaultValue = 0) => {
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    };

    const rooms = parseNumber(roomsStr, 1);
    const bathrooms = parseNumber(bathroomsStr, 1);
    const price = parseNumber(priceStr, 0);
    const maxGuests = parseNumber(maxGuestsStr, 1);
    const squareMeters = parseNumber(squareMetersStr, 0);

    // Validaciones básicas de números
    if (rooms < 1 || maxGuests < 1) {
      req.flash("error_msg", "El número de habitaciones y el máximo de huéspedes deben ser al menos 1.");
      return res.redirect(`/admin/apartment/edit/${id}`);
    }

    // Parsing y filtrado de reglas
    const rules = Array.isArray(req.body.rules)
      ? req.body.rules.map((r) => r.trim()).filter((r) => r.length > 0)
      : [];

    //  Procesamiento de Fotos 
    let updatedPhotos = [];
    const indexesToDelete = Array.isArray(deletedPhotoIndexes)
      ? deletedPhotoIndexes.map(Number)
      : [Number(deletedPhotoIndexes)]; // Convierte a array si es un solo índice

    // Filtra fotos existentes que no estén marcadas para eliminación
    apartment.photos.forEach((photo, index) => {
      if (!indexesToDelete.includes(index)) {
        // Busca la descripción de la foto existente en el formulario
        const correspondingExistingPhoto = Array.isArray(existingPhotos) ? existingPhotos.find((ep, epIndex) => epIndex === index) : undefined;
        updatedPhotos.push({
          ...photo,
          description: correspondingExistingPhoto?.description || photo.description || "",
          isMain: String(index) === String(mainPhotoIndex),
        });
      } else {
        // Eliminar físicamente el archivo del disco si es una foto local
        if (photo.url.startsWith("/uploads/apartments/")) {
          const filePath = path.join(process.cwd(), "public", photo.url);
          fs.unlink(filePath).catch(err => {
            if (err.code !== 'ENOENT') { // Ignorar error si el archivo no existe
              console.error(`Error al eliminar foto del disco ${filePath}:`, err);
            }
          });
        }
      }
    });

    // Procesa nuevas fotos (archivos subidos y URLs)
    let filePhotosIndex = 0;
    const uploadedFiles = req.files && req.files.apartmentPhotos ? req.files.apartmentPhotos : [];
    const photosToProcess = Array.isArray(newPhotos) ? newPhotos : []; // Asegura que newPhotos es un array

    const finalApartmentPhotoDir = path.join("public", "uploads", "apartments", id);
    await fs.mkdir(finalApartmentPhotoDir, { recursive: true }); // Asegura que el directorio del apartamento exista

    for (let i = 0; i < photosToProcess.length; i++) {
      const newPhotoData = photosToProcess[i];
      let photoUrl = '';
      let photoType = '';

      if (!newPhotoData) {
        console.warn(`[EDICIÓN] newPhotoData es undefined o null para el índice ${i}. Saltando.`);
        continue;
      }

      if (newPhotoData.uploadType === 'url' && newPhotoData.url?.trim()) {
        photoUrl = newPhotoData.url.trim();
        photoType = 'url';
      } else if (newPhotoData.uploadType === 'file' && uploadedFiles.length > filePhotosIndex) {
        const file = uploadedFiles[filePhotosIndex];
        const oldFilePath = file.path;
        const newFilePath = path.join(finalApartmentPhotoDir, file.filename);
        photoUrl = `/uploads/apartments/${id}/${file.filename}`;
        photoType = 'local';
        try {
          await moveFile(oldFilePath, newFilePath); // Mueve el archivo subido a la ubicación final
        } catch (moveErr) {
          console.error(`Error al mover nuevo archivo ${file.filename}:`, moveErr);
          photoUrl = ''; // Si falla el movimiento, no lo añadas a las fotos
        }
        filePhotosIndex++;
      }

      if (photoUrl) {
        updatedPhotos.push({
          url: photoUrl,
          description: newPhotoData.description || "",
          isMain: `new_${i}` === String(mainPhotoIndex), // Usar `new_${i}` para identificar las nuevas fotos
          type: photoType
        });
      }
    }

    // Asegurar que al menos una foto sea principal si hay fotos
    if (updatedPhotos.length > 0 && !updatedPhotos.some(p => p.isMain)) {
      updatedPhotos[0].isMain = true;
    }

    // Conversión de servicios a booleano
    const services = {
      airConditioning: req.body.services?.airConditioning === "on",
      heating: req.body.services?.heating === "on",
      accessibility: req.body.services?.accessibility === "on",
      television: req.body.services?.television === "on",
      kitchen: req.body.services?.kitchen === "on",
      internet: req.body.services?.internet === "on",
    };

    // Parsing y manejo de la localización
    const location = {
      province: {
        id: req.body.location?.province?.id
          ? parseNumber(req.body.location.province.id)
          : 0,
        nm: req.body.location?.province?.nm || "No especificado",
      },
      municipality: {
        id: req.body.location?.municipality?.id
          ? parseNumber(req.body.location.municipality.id)
          : 0,
        nm: req.body.location?.municipality?.nm || "No especificado",
      },
      gpsCoordinates: {
        lat: req.body.location?.gpsCoordinates?.lat
          ? parseNumber(req.body.location.gpsCoordinates.lat)
          : 0,
        lng: req.body.location?.gpsCoordinates?.lng
          ? parseNumber(req.body.location.gpsCoordinates.lng)
          : 0,
      },
    };

    // Parsing de camas por habitación
    let bedsPerRoom = [];
    if (Array.isArray(req.body.bedsPerRoom)) {
      bedsPerRoom = req.body.bedsPerRoom
        .map((num) => parseNumber(num, 0))
        .filter((num) => !isNaN(num) && num >= 0)
        .slice(0, rooms); // Asegura que el número de camas no exceda el número de habitaciones
    }

    // Determina si el apartamento está activo
    let active = false;
    if (typeof req.body.active === "string") {
      active = req.body.active === "on" || req.body.active === "true";
    } else if (typeof req.body.active === "boolean") {
      active = req.body.active;
    }

    // Objeto con los datos a actualizar
    const updateApartmentData = {
      title,
      description,
      rules,
      rooms,
      bedsPerRoom,
      bathrooms,
      photos: updatedPhotos,
      price,
      maxGuests,
      squareMeters,
      services,
      location,
      active,
      updatedAt: new Date(), // Actualiza la fecha de modificación
    };

    const result = await Apartment.findByIdAndUpdate(id, updateApartmentData, {
      new: true, // Devuelve el documento modificado
      runValidators: true, // Ejecuta las validaciones del esquema
    });

    if (!result) {
      req.flash("error_msg", "Error al actualizar el apartamento.");
      return res.redirect("/admin");
    }

    req.flash("success_msg", "El apartamento se ha editado satisfactoriamente. ✨");
    res.redirect("/admin");
    console.log("Apartamento actualizado!");
  } catch (error) {
    console.error("Error al editar el apartamento:", error.message);
    req.flash("error_msg", `Hubo un error al editar el apartamento: ${error.message}`);
    res.redirect(`/admin/apartment/edit/${id}`); // Redirige de vuelta al formulario de edición
  } finally {
    // Limpieza: Elimina la carpeta temporal de Multer
    if (tempUploadDir) {
      try {
        await fs.rm(tempUploadDir, { recursive: true, force: true });
        console.log(`Carpeta temporal ${tempUploadDir} eliminada.`);
      } catch (cleanErr) {
        if (cleanErr.code === 'ENOENT') {
          console.log(`Carpeta temporal ${tempUploadDir} no encontrada o ya eliminada. No se requiere limpieza.`);
        } else {
          console.error(`Error al limpiar la carpeta temporal ${tempUploadDir}:`, cleanErr);
        }
      }
    }
  }
};

/**
 * Desactiva (elimina lógicamente) un apartamento por su ID.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const postDeleteApartment = async (req, res) => {
  const { id } = req.params;

  try {
    // Solo permite eliminar apartamentos creados por el usuario actual
    const apartment = await Apartment.findOne({
      _id: id,
      createdBy: req.session.userId
    }).populate("createdBy");
    
    if (!apartment) {
      req.flash("error_msg", "Apartamento no encontrado o no tienes permisos para eliminarlo.");
      return res.redirect("/seeApartments"); // Redirecciona a la lista de apartamentos públicos
    }
    
    apartment.active = false; // Desactiva el apartamento en lugar de eliminarlo físicamente
    await apartment.save();
    req.flash("success_msg", "Apartamento eliminado satisfactoriamente. ");
    return res.redirect("/");
  } catch (error) {
    console.error("Error al eliminar apartamento:", error);
    req.flash("error_msg", "Error al eliminar el apartamento.");
    return res.redirect("/");
  }
};

/**
 * Activa un apartamento por su ID.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const postActiveApartment = async (req, res) => {
  const { id } = req.params;

  try {
    // Solo permite activar apartamentos creados por el usuario actual
    const apartment = await Apartment.findOne({
      _id: id,
      createdBy: req.session.userId
    });
    
    if (!apartment) {
      req.flash("error_msg", "Apartamento no encontrado o no tienes permisos para activarlo.");
      return res.redirect("/seeApartments");
    }
    apartment.active = true; // Activa el apartamento
    await apartment.save();
    req.flash("success_msg", "Apartamento activado satisfactoriamente.");
    return res.redirect("/seeApartments");
  } catch (error) {
    console.error("Error al activar el apartamento:", error);
    req.flash("error_msg", "Error al activar el apartamento.");
    return res.redirect("/seeApartments");
  }
};


//  Gestión de Reservas 

/**
 * Obtiene y muestra una lista de todas las reservas.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const getReservations = async (req, res) => {
  try {
    // Obtener apartamentos del usuario actual
    const myApartments = await Apartment.find({
      createdBy: req.session.userId
    });
    const apartmentIds = myApartments.map(apt => apt._id);
    
    // Solo obtener reservas recibidas en apartamentos del usuario actual
    const reservations = await Reservation.find({
      apartment: { $in: apartmentIds } // Solo reservas en apartamentos del usuario
    })
      .populate("apartment")
      .populate("user")
      .sort({ endDate: 1 }); // Ordena por fecha de fin ascendente
      
    res.render("reservations.ejs", {
      title: "admin",
      reservations,
    });
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    res.status(500).render("error.ejs", {
      message: "Error interno del servidor al obtener reservas",
      status: 500,
    });
  }
};

/**
 * Cancela una reserva por su ID.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const postCancelReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findById(id).populate("apartment");
    if (!reservation) {
      req.flash("error_msg", "Reserva no encontrada.");
      return res.redirect("/admin/reservations");
    }
    
    // Verificar permisos: debe ser una reserva en un apartamento del usuario
    const isMyApartment = reservation.apartment && reservation.apartment.createdBy.toString() === req.session.userId;
    
    if (!isMyApartment) {
      req.flash("error_msg", "No tienes permisos para cancelar esta reserva.");
      return res.redirect("/admin/reservations");
    }
    
    reservation.status = "cancelled"; // Cambia el estado a "cancelled"
    await reservation.save();
    req.flash("success_msg", "Reserva cancelada satisfactoriamente. ❌");
    return res.redirect("/admin/reservations");
  } catch (error) {
    console.error("Error al cancelar la reserva:", error);
    req.flash("error_msg", "Error al cancelar la reserva.");
    return res.redirect("/admin/reservations");
  }
};

/**
 * Confirma una reserva por su ID.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const postConfirmReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findById(id).populate("apartment");
    if (!reservation) {
      req.flash("error_msg", "Reserva no encontrada.");
      return res.redirect("/admin/reservations");
    }
    
    // Verificar permisos: debe ser una reserva en un apartamento del usuario
    const isMyApartment = reservation.apartment && reservation.apartment.createdBy.toString() === req.session.userId;
    
    if (!isMyApartment) {
      req.flash("error_msg", "No tienes permisos para confirmar esta reserva.");
      return res.redirect("/admin/reservations");
    }
    
    reservation.status = "confirmed"; // Cambia el estado a "confirmed"
    await reservation.save();
    req.flash("success_msg", "Reserva confirmada satisfactoriamente. ✅");
    return res.redirect("/admin/reservations");
  } catch (error) {
    console.error("Error al confirmar la reserva:", error);
    req.flash("error_msg", "Error al confirmar la reserva.");
    return res.redirect("/admin/reservations");
  }
};

/**
 * Marca una reserva como pagada.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const postMarkPaidReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findById(id).populate("apartment");
    if (!reservation) {
      req.flash("error_msg", "Reserva no encontrada.");
      return res.redirect("/admin/reservations");
    }
    
    // Verificar permisos: debe ser una reserva en un apartamento del usuario
    const isMyApartment = reservation.apartment && reservation.apartment.createdBy.toString() === req.session.userId;
    
    if (!isMyApartment) {
      req.flash("error_msg", "No tienes permisos para modificar esta reserva.");
      return res.redirect("/admin/reservations");
    }
    
    reservation.paid = true; // Marca la reserva como pagada
    await reservation.save();
    req.flash("success_msg", "Reserva marcada como pagada satisfactoriamente. 💰");
    return res.redirect("/admin/reservations");
  } catch (error) {
    console.error("Error al marcar la reserva como pagada:", error);
    req.flash("error_msg", "Error al marcar la reserva como pagada.");
    return res.redirect("/admin/reservations");
  }
};

/**
 * Elimina una reserva por su ID.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const postDeleteReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findById(id).populate("apartment");
    if (!reservation) {
      req.flash("error_msg", "Reserva no encontrada.");
      return res.redirect("/admin/reservations");
    }
    
    // Verificar permisos: debe ser una reserva en un apartamento del usuario
    const isMyApartment = reservation.apartment && reservation.apartment.createdBy.toString() === req.session.userId;
    
    if (!isMyApartment) {
      req.flash("error_msg", "No tienes permisos para eliminar esta reserva.");
      return res.redirect("/admin/reservations");
    }
    
    await Reservation.findByIdAndDelete(id);
    req.flash("success_msg", "Reserva eliminada satisfactoriamente. 🗑️");
    return res.redirect("/admin/reservations");
  } catch (error) {
    console.error("Error al eliminar la reserva:", error);
    req.flash("error_msg", "Error al eliminar la reserva.");
    return res.redirect("/admin/reservations");
  }
};

/**
 * Muestra el formulario para editar una reserva existente.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const getReservationEdit = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar que la reserva sea en un apartamento del usuario
    const reservation = await Reservation.findById(id).populate("apartment");
    if (!reservation) {
      req.flash("error_msg", "La reserva no se ha encontrado.");
      return res.redirect("/admin/reservations");
    }
    
    // Verificar permisos: debe ser una reserva en un apartamento del usuario
    const isMyApartment = reservation.apartment && reservation.apartment.createdBy.toString() === req.session.userId;
    
    if (!isMyApartment) {
      req.flash("error_msg", "No tienes permisos para editar esta reserva.");
      return res.redirect("/admin/reservations");
    }
    
    res.render("editReservation.ejs", { title: "admin", reservation });
  } catch (err) {
    console.error("Error al obtener reserva para edición:", err);
    req.flash("error_msg", "Error interno del servidor al obtener reserva.");
    res.redirect("/admin/reservations");
  }
};

/**
 * Actualiza una reserva existente, incluyendo la validación de fechas.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const putReservationEdit = async (req, res) => {
  const { id } = req.params;
  
  // Verificar errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    req.flash("error", errorMessages.join(', '));
    return res.redirect(`/admin/reservation/edit/${id}`);
  }

  const { apartmentId, guestName, guestEmail, dateRange } = req.body;
  const [start, end] = dateRange.split(" - ");
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    req.flash("error_msg", "Fechas no válidas proporcionadas.");
    return res.redirect(`/admin/reservation/edit/${id}`); // Vuelve al formulario de edición
  }

  try {
    const reservationToUpdate = await Reservation.findById(id);
    if (!reservationToUpdate) {
      req.flash("error_msg", "Reserva no encontrada.");
      return res.redirect("/admin/reservations");
    }

    // Comprueba solapamientos con otras reservas confirmadas para el mismo apartamento, excluyendo la actual
    const conflictingReservations = await Reservation.find({
      apartment: apartmentId,
      status: "confirmed",
      _id: { $ne: id }, // Excluye la reserva que estamos editando
      $and: [{ endDate: { $gt: startDate } }, { startDate: { $lt: endDate } }],
    });

    if (conflictingReservations.length === 0) {
      // No hay conflictos, procede con la actualización
      await Reservation.findByIdAndUpdate(
        id,
        {
          guestName,
          guestEmail,
          startDate,
          endDate,
          // No se actualiza 'user' o 'apartment' si no se proporcionan, o si la lógica lo requiere
        },
        { new: true, runValidators: true }
      );
      req.flash("success_msg", "Reserva actualizada con éxito. ✔️");
      res.redirect("/admin/reservations"); // Redirige a la lista de reservas
    } else {
      req.flash("error_msg", "Fechas no disponibles: hay otra reserva confirmada que se solapa con este período.");
      res.redirect(`/admin/reservation/edit/${id}`);
    }
  } catch (err) {
    console.error("Error al editar la reserva:", err);
    req.flash(
      "error_msg",
      "Fallo en la edición de la reserva. Por favor, contacta al soporte técnico."
    );
    res.redirect(`/admin/reservation/edit/${id}`);
  }
};



export const getAllApartments = async (req, res) => {
  try {
    // Solo apartamentos creados por el usuario actual
    const apartments = await Apartment.find({ 
      active: true,
      createdBy: req.session.userId 
    }).populate("createdBy");
    res.render("homeAdmin", { title: "admin", error: undefined, apartments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};