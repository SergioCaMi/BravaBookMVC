import User from "../models/user.model.js";
import Apartment from "../models/apartment.model.js";
import Reservation from "../models/reservation.model.js";
import fs from "fs/promises";
import path from "path";

// ******************** Usuarios ********************

// DashBoard
export const dashboard = async (req, res) => {
  console.log("Dashboard ");
  const user = await User.findById(req.session.userId);
  const reservations = await Reservation.find({
    user: req.session.userId,
  })
    .populate("apartment")
    .limit(10)
    .sort({ endDate: 1 });
  const apartments = await Apartment.find({
    createdBy: req.session.userId,
  }).limit(50);

  res.render("dashboard", { title: "home", user, reservations, apartments });
};

// GET Edit Profile
export const getEditProfile = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  res.render("aboutUs", { title: "about", error: undefined });
};

// POST Edit Profile
export const postUpdateProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;

    if (!name || !email) {
      req.flash("error_msg", "Nombre y correo electrónico son obligatorios.");
      return res.status(400).redirect("/admin/profile/edit"); // Mejor redireccionar con flash
    }

    const updates = { name, email, bio };

    if (req.file) {
      const currentUser = await User.findById(req.session.userId);

      if (currentUser.avatar && currentUser.avatar !== "default.jpg") {
        const oldAvatarPath = path.join(
          process.cwd(),
          "public/uploads/avatars",
          currentUser.avatar
        );

        try {
          // ¡CAMBIO CLAVE AQUÍ! Usar await fs.unlink
          await fs.unlink(oldAvatarPath);
          console.log(`Avatar anterior ${oldAvatarPath} eliminado.`);
        } catch (err) {
          // Manejar específicamente el error si el archivo no existe (ENOENT)
          // para evitar que un error de archivo inexistente detenga la ejecución.
          if (err.code === "ENOENT") {
            console.warn(
              `Intento de eliminar avatar que no existe: ${oldAvatarPath}`
            );
          } else {
            console.error(
              `Error al eliminar avatar anterior ${oldAvatarPath}:`,
              err
            );
            // Puedes decidir si quieres que esto sea un error fatal o solo un warning
            // Si es fatal, podrías relanzar el error o devolver un 500.
          }
        }
      }
      updates.avatar = req.file.filename;
    }

    await User.findByIdAndUpdate(req.session.userId, updates);

    req.flash("success_msg", "Perfil actualizado exitosamente.");
    res.redirect("/admin/dashboard"); // Ajusta la redirección si es necesario
  } catch (err) {
    console.error("Error al actualizar el perfil:", err);
    req.flash(
      "error_msg",
      "Hubo un error al guardar los cambios. Inténtalo de nuevo."
    );
    res.status(500).redirect("/admin/profile/edit"); // Ajusta la redirección si es necesario
  }
};

// GET Users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ name: 1 });

    res.render("users.ejs", { title: "admin", error: undefined, users });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(404).render("error.ejs", {
      message: "Error interno del servidor",
      status: 404,
    });
  }
};

// ******************** Apartamentos ********************

// GET New Apartment
export const getNewApartment = async (req, res) => {
  res.render("addApartment.ejs", { title: "admin", error: undefined });
};

// POST New Apartment

async function moveFile(oldPath, newPath) {
  try {
    await fs.rename(oldPath, newPath); //renombramos
    console.log(`Archivo movido de ${oldPath} a ${newPath}`);
  } catch (err) {
    if (err.code === "EXDEV") {
      // si están en diferente directorio:
      // copiamos y luego borramos el original
      await fs.copyFile(oldPath, newPath);
      await fs.unlink(oldPath);
      console.log(
        `Archivo copiado y eliminado original de ${oldPath} a ${newPath}`
      );
    } else {
      throw err; // Re-lanza otros errores
    }
  }
}

export const postNewApartment = async (req, res) => {
  console.log("Datos recibidos para nuevo apartamento (req.body):", req.body);
  console.log(
    "Archivos temporales recibidos por Multer (req.files):",
    req.files
  );
  const tempUploadDir = req.tempUploadDir;
  let newApartment = null;

  try {
    const {
      title,
      description,
      rooms,
      bathrooms,
      price,
      maxGuests,
      squareMeters,
    } = req.body;
    const photosToSave = [];
    // *** Normas ***
    const rules = Array.isArray(req.body.rules)
      ? req.body.rules.map((r) => r.trim()).filter((r) => r.length > 0)
      : [];

    //  *** Servicios ***
    // existe el servicio? es igual a 'on'? true/false
    const services = {
      airConditioning: req.body.services?.airConditioning === "on",
      heating: req.body.services?.heating === "on",
      accessibility: req.body.services?.accessibility === "on",
      television: req.body.services?.television === "on",
      kitchen: req.body.services?.kitchen === "on",
      internet: req.body.services?.internet === "on",
    };

    //  *** Localización ***
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
    //  *** Camas por habitación ***
    let bedsPerRoom = [];
    if (Array.isArray(req.body.bedsPerRoom)) {
      bedsPerRoom = req.body.bedsPerRoom
        .map((num) => parseInt(num, 10))
        .filter((num) => !isNaN(num) && num >= 0);
    }

    const url = false;
    if (url) {
      // *** Fotos ***

      const photos = Array.isArray(req.body.photos)
        ? req.body.photos
            .filter((photo) => photo.url?.trim())
            .map((photo, index) => ({
              ...photo,
              url: photo.url.trim(),
              description: photo.description || "",
              isMain: String(index) === String(req.body.mainPhotoIndex),
            }))
        : [];

      // *** Crear la nueva instancia ***
      newApartment = new Apartment({
        title,
        description,
        rules,
        rooms: Number(rooms),
        bedsPerRoom,
        bathrooms: Number(bathrooms),
        photos,
        price: Number(price),
        maxGuests: Number(maxGuests),
        squareMeters: Number(squareMeters),
        services,
        location,
        active: true,
        createdBy: req.body.createdBy,
      });
    } else {
      // *** Crear la nueva instancia ***
      newApartment = new Apartment({
        title,
        description,
        rules,
        rooms: Number(rooms),
        bedsPerRoom,
        bathrooms: Number(bathrooms),
        photos: [],
        price: Number(price),
        maxGuests: Number(maxGuests),
        squareMeters: Number(squareMeters),
        services,
        location,
        active: true,
        createdBy: req.body.createdBy,
      });
    }
    await newApartment.save();
    const apartmentId = newApartment._id.toString();

    if (req.files && req.files.length > 0) {
      const finalApartmentPhotoDir = path.join(
        "public",
        "uploads",
        "apartments",
        apartmentId
      );
      await fs.mkdir(finalApartmentPhotoDir, { recursive: true });

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const oldFilePath = file.path;
        const newFilePath = path.join(finalApartmentPhotoDir, file.filename);
        const publicUrl = `/uploads/apartments/${apartmentId}/${file.filename}`;
        try {
          await moveFile(oldFilePath, newFilePath);

          const description = req.body.photos?.[i]?.description || "";
          const isMain = String(i) === String(req.body.mainPhotoIndex);

          photosToSave.push({
            url: publicUrl,
            description: description,
            isMain: isMain,
          });
        } catch (moveErr) {
          console.error(`Error al mover el archivo ${file.filename}:`, moveErr);
        }
      }
    }
    // ahora, una vez ya tenemos id en el nuevo apartamento, y hemos gestionado las fotos, las agregamos a la BBDD
    newApartment.photos = photosToSave;
    await newApartment.save();

    req.flash("success_msg", "El apartamento se ha creado satisfactoriamente.");
    res.redirect("/admin");
  } catch (error) {
    req.flash("error_msg", "Hubo un error al crear el apartamento.");
    console.error("Error:", error.message);
    res.redirect("/admin");
} finally {
    // *** PASO 4: Limpieza - Eliminar la carpeta temporal de Multer ***
    // Esto se ejecuta SIEMPRE, haya error o no.
    if (tempUploadDir) { // Solo verificamos que la ruta temporal fue establecida
        try {
            // `fs.rm` es para eliminar directorios (recursivamente).
            // `force: true` asegura que se elimine incluso si no está vacío o no existe.
            await fs.rm(tempUploadDir, { recursive: true, force: true });
            console.log(`Carpeta temporal ${tempUploadDir} eliminada.`);
        } catch (cleanErr) {
            // Manejamos específicamente el error 'ENOENT' (No such file or directory)
            // Esto significa que la carpeta ya no existía o nunca se creó, lo cual está bien.
            if (cleanErr.code === 'ENOENT') {
                console.log(`Carpeta temporal ${tempUploadDir} no encontrada o ya eliminada. No se requiere limpieza.`);
            } else {
                console.error(`Error al limpiar la carpeta temporal ${tempUploadDir}:`, cleanErr);
            }
        }
    }
}};

// ******************** Reservas ********************
// GET Reservation
export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({})
      .populate("apartment")
      .populate("user")
      .sort({ endDate: 1 });
    res.render("reservations.ejs", {
      title: "admin",
      reservations,
    });
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    res.status(404).render("error.ejs", {
      message: "Error interno del servidor",
      status: 404,
    });
  }
};

//GET edit apartment
export const getApartmentEdit = async (req, res) => {
  const { id } = req.params;
  console.log(req.params);
  try {
    const apartments = await Apartment.findById(id);
    console.log(apartments);
    if (!apartments) {
      req.flash("error_msg", "El apartamento no se ha encontrado.");
      res.redirect("/admin");
    }
    res.render("editApartment.ejs", {
      title: "admin",
      apartments,
    });
  } catch (err) {
    req.flash("error_msg", "Error interno del servidor.");
    res.redirect("/admin");
  }
};

// PUT edit apartment
export const putApartmentEdit = async (req, res) => {
    const { id } = req.params;

    try {
        const apartment = await Apartment.findById(id);
        if (!apartment) {
            req.flash("error_msg", "Apartamento no encontrado.");
            return res.redirect("/admin");
        }

        const {
            title,
            description,
            // Aseguramos que estos valores sean capturados como Strings
            // y luego validados/parseados a números de forma segura
            rooms: roomsStr,
            bathrooms: bathroomsStr,
            price: priceStr,
            maxGuests: maxGuestsStr,
            squareMeters: squareMetersStr,

            mainPhotoIndex,
            deletedPhotoIndexes = [],
            existingPhotos = [],
            newPhotos = []
        } = req.body;

        // --- Validación y Parsing de Campos Numéricos ---
        const parseNumber = (value, defaultValue = 0) => {
            const num = Number(value);
            return isNaN(num) ? defaultValue : num;
        };

        const rooms = parseNumber(roomsStr, 1); // Asume 1 si no es válido
        const bathrooms = parseNumber(bathroomsStr, 1); // Asume 1 si no es válido
        const price = parseNumber(priceStr, 0); // Asume 0 si no es válido
        const maxGuests = parseNumber(maxGuestsStr, 1); // Asume 1 si no es válido
        const squareMeters = parseNumber(squareMetersStr, 0); // Asume 0 si no es válido

        // Si rooms o maxGuests son 0 después del parseo y no se permite, puedes añadir una validación aquí
        if (rooms < 1 || maxGuests < 1) {
             req.flash("error_msg", "El número de habitaciones y el máximo de huéspedes deben ser al menos 1.");
             return res.redirect(`/admin/apartment/edit/${id}`);
        }
        // Puedes añadir validaciones similares para price y squareMeters si deben ser mayores a 0


        // *** Normas ***
        const rules = Array.isArray(req.body.rules)
            ? req.body.rules.map((r) => r.trim()).filter((r) => r.length > 0)
            : [];

        // *** Procesar fotos existentes y marcadas para eliminación ***
        let updatedPhotos = [];
        const indexesToDelete = Array.isArray(deletedPhotoIndexes)
            ? deletedPhotoIndexes.map(Number)
            : [Number(deletedPhotoIndexes)];

        apartment.photos.forEach((photo, index) => {
            if (!indexesToDelete.includes(index)) {
                const correspondingExistingPhoto = existingPhotos.find(
                    (ep, epIndex) => epIndex === index
                );

                if (correspondingExistingPhoto) {
                    updatedPhotos.push({
                        ...photo,
                        description: correspondingExistingPhoto.description || "",
                        isMain: String(index) === String(mainPhotoIndex),
                    });
                } else {
                    updatedPhotos.push({
                        ...photo,
                        isMain: String(index) === String(mainPhotoIndex),
                    });
                }
            }
        });

        // *** Procesar nuevas fotos (archivos y URLs) ***
        let filePhotosIndex = 0;
        const uploadedFiles = req.files && req.files.apartmentPhotos ? req.files.apartmentPhotos : [];

        // ¡MODIFICACIÓN CLAVE AQUÍ!
        // Aseguramos que newPhotos sea un array para evitar el error 'undefined'
        const photosToProcess = Array.isArray(newPhotos) ? newPhotos : [];

        for (let i = 0; i < photosToProcess.length; i++) { // Iteramos sobre 'photosToProcess'
            const newPhotoData = photosToProcess[i]; // Ahora newPhotoData estará definido
            let photoUrl = '';
            let photoType = '';

            // Si newPhotoData es undefined o null por alguna razón inesperada, saltar esta iteración
            if (!newPhotoData) {
                console.warn(`[EDICIÓN] newPhotoData es undefined o null para el índice ${i}. Saltando.`);
                continue; 
            }

            if (newPhotoData.uploadType === 'url') {
                photoUrl = newPhotoData.url?.trim();
                photoType = 'url';
            } 
            else if (newPhotoData.uploadType === 'file' && uploadedFiles.length > filePhotosIndex) {
                const file = uploadedFiles[filePhotosIndex];
                photoUrl = `/uploads/apartments/${id}/${file.filename}`;
                photoType = 'local';
                filePhotosIndex++;
            }

            if (photoUrl) {
                updatedPhotos.push({
                    url: photoUrl,
                    description: newPhotoData.description || "",
                    isMain: `new_${i}` === String(mainPhotoIndex),
                    type: photoType
                });
            }
        }
        if (updatedPhotos.length > 0 && !updatedPhotos.some(p => p.isMain)) {
            updatedPhotos[0].isMain = true;
        }

        // *** Servicios ***
        const services = {
            airConditioning: req.body.services?.airConditioning === "on",
            heating: req.body.services?.heating === "on",
            accessibility: req.body.services?.accessibility === "on",
            television: req.body.services?.television === "on",
            kitchen: req.body.services?.kitchen === "on",
            internet: req.body.services?.internet === "on",
        };

        // *** Localización ***
        const location = {
            province: {
                id: req.body.location?.province?.id
                    ? parseNumber(req.body.location.province.id) // Usar parseNumber
                    : 0,
                nm: req.body.location?.province?.nm || "No especificado",
            },
            municipality: {
                id: req.body.location?.municipality?.id
                    ? parseNumber(req.body.location.municipality.id) // Usar parseNumber
                    : 0,
                nm: req.body.location?.municipality?.nm || "No especificado",
            },
            gpsCoordinates: {
                lat: req.body.location?.gpsCoordinates?.lat
                    ? parseNumber(req.body.location.gpsCoordinates.lat) // Usar parseNumber
                    : 0,
                lng: req.body.location?.gpsCoordinates?.lng
                    ? parseNumber(req.body.location.gpsCoordinates.lng) // Usar parseNumber
                    : 0,
            },
        };

        // *** Camas por habitación ***
        let bedsPerRoom = [];
        if (Array.isArray(req.body.bedsPerRoom)) {
            bedsPerRoom = req.body.bedsPerRoom
                .map((num) => parseNumber(num, 0)) // Usar parseNumber para cada cama
                .filter((num) => !isNaN(num) && num >= 0)
                .slice(0, rooms); // rooms ya es un número seguro
        }

        // *** Estado activo/desactivado ***
        let active = false;
        if (typeof req.body.active === "string") {
            active = req.body.active === "on" || req.body.active === "true";
        } else if (typeof req.body.active === "boolean") {
            active = req.body.active;
        }

        const updateApartmentData = {
            title,
            description,
            rules,
            rooms, // rooms ya es un número
            bedsPerRoom,
            bathrooms, // bathrooms ya es un número
            photos: updatedPhotos,
            price, // price ya es un número
            maxGuests, // maxGuests ya es un número
            squareMeters, // squareMeters ya es un número
            services,
            location,
            active,
            updatedAt: new Date(),
        };

        const result = await Apartment.findByIdAndUpdate(id, updateApartmentData, {
            new: true,
            runValidators: true,
        });

        if (!result) {
            req.flash("error_msg", "Error al actualizar el apartamento.");
            return res.redirect("/admin");
        }

        req.flash(
            "success_msg",
            "El apartamento se ha editado satisfactoriamente."
        );
        res.redirect("/admin");
        console.log("Updated!");
    } catch (error) {
        req.flash("error_msg", `Hubo un error al editar el apartamento: ${error.message}`);
        console.error("Error:", error.message);
        res.redirect("/admin");
    }
};


// POST Cancel Reservation
export const postCancelReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      req.flash("error_msg", "Reserva no encontrada");
      return res.redirect("/admin/reservations");
    }
    reservation.status = "cancelled";
    await reservation.save();
    req.flash("success_msg", "Reserva cancelada satisfactoriamente.");
    return res.redirect("/admin/reservations");
  } catch (error) {
    req.flash("error_msg", "Error al cancelar la reserva.");
    return res.redirect("/admin/reservations");
  }
};

// POST Confirm Reservation
export const postConfirmReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      req.flash("error_msg", "Reserva no encontrada");
      return res.redirect("/admin/reservations");
    }
    reservation.status = "confirmed";
    await reservation.save();
    req.flash("success_msg", "Reserva confirmada satisfactoriamente.");
    return res.redirect("/admin/reservations");
  } catch (error) {
    req.flash("error_msg", "Error al confirmar la reserva.");
    return res.redirect("/admin/reservations");
  }
};

// POST delete user
export const postDeleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (id !== req.user._id) {
      await User.findByIdAndDelete(id);
    }
    req.flash("success_msg", "User eliminado satisfactoriamente.");
    return res.redirect("/admin/users");
  } catch (error) {
    req.flash("error_msg", "Error al eliminar usuario.");
    return res.redirect("/admin/users");
  }
};

// POST Delete Apartment
export const postDeleteApartment = async (req, res) => {
  const { id } = req.params;

  try {
    const apartment = await Apartment.findById(id);
    if (!apartment) {
      req.flash("error_msg", "apartment no encontrado");
      return res.redirect("/seeApartments");
    }
    apartment.active = false;
    await apartment.save();
    req.flash("success_msg", "Apartamento eliminado satisfactoriamente.");
    return res.redirect("/seeApartments");
  } catch (error) {
    req.flash("error_msg", "Error al eliminar el apartamento.");
    return res.redirect("/seeApartments");
  }
};

// POST Active Apartment
export const postActiveApartment = async (req, res) => {
  const { id } = req.params;

  try {
    const apartment = await Apartment.findById(id);
    if (!apartment) {
      req.flash("error_msg", "apartment no encontrado");
      return res.redirect("/seeApartments");
    }
    apartment.active = true;
    await apartment.save();
    req.flash("success_msg", "Apartamento activado satisfactoriamente.");
    return res.redirect("/seeApartments");
  } catch (error) {
    req.flash("error_msg", "Error al activar el apartamento.");
    return res.redirect("/seeApartments");
  }
};

//GET edit reservation
export const getReservationEdit = async (req, res) => {
  const { id } = req.params;
  console.log(req.params);
  try {
    const reservation = await Reservation.findById(id).populate("apartment");
    console.log(reservation);
    if (!reservation) {
      req.flash("error_msg", "La reserva no se ha encontrado.");
      res.redirect("/admin");
    }
    res.render("editReservation.ejs", {
      title: "admin",
      reservation,
    });
  } catch (err) {
    req.flash("error_msg", "Error interno del servidor.");
    res.redirect("/admin");
  }
};

//POST edit reservation
export const putReservationEdit = async (req, res) => {
  const { id } = req.params;
  const { apartmentId, guestName, guestEmail, dateRange } = req.body;
  const [start, end] = dateRange.split(" - ");
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.log("fecha no disponible");
    req.flash("error_msg", "Fechas no disponibles.");
    res.redirect("/reservations/new-reservation");
  }

  try {
    const reservationToUpdate = await Reservation.findById(id);
    if (!reservationToUpdate) {
      req.flash("error_msg", "Reserva no encontrada.");
      return res.redirect("/");
    }
    const dataReservations = await Reservation.find({
      apartment: apartmentId,
      status: "confirmed",
      _id: { $ne: id },
      $and: [{ endDate: { $gt: startDate } }, { startDate: { $lt: endDate } }],
    });
    console.log("La fecha es válida?", dataReservations.length === 0);
    console.log("Buscando en apartamento:", apartmentId);
    console.log("Fecha inicio nueva:", startDate);
    console.log("Fecha fin nueva:", endDate);
    console.log("Número de reservas solapadas:", dataReservations.length);
    if (dataReservations.length === 0) {
      console.log("reserva valida");
      await Reservation.findByIdAndUpdate(
        id,
        {
          user: req.session.userId,
          guestName,
          guestEmail,
          startDate,
          endDate,
        },
        { new: true, runValidators: true }
      );
      console.log("Objeto guardado");
      req.flash("success_msg", "Reserva realizada con éxito.");
      res.redirect("/");
    } else {
      console.log("reserva INvalida");

      req.flash("error_msg", "Fechas no disponibles");
      res.redirect(`/apartments/${apartmentId}#reservation`);
    }
  } catch (err) {
    console.log("Error:", err);

    req.flash(
      "error_msg",
      "Fallo en la edición de la reserva. Pongase en contacto por telefono con nuestro equipo."
    );
    res.redirect("/");
  }
};
