import User from "../models/user.model.js";
import Apartment from "../models/apartment.model.js";
import Reservation from "../models/reservation.model.js";

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

    // Validación básica
    if (!name || !email) {
      return res.status(400).render("editProfile", {
        title: "Editar perfil",
        user: req.user,
        error: "Nombre y correo electrónico son obligatorios.",
      });
    }

    const updates = { name, email, bio };

    // Si se subió un nuevo avatar
    if (req.file) {
      const currentUser = await User.findById(req.session.userId);

      // Borrar avatar anterior si no es el por defecto
      if (currentUser.avatar && currentUser.avatar !== "default.jpg") {
        const oldAvatarPath = path.join(
          process.cwd(),
          "public/uploads/avatars",
          currentUser.avatar
        );

        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      updates.avatar = req.file.filename;
    }

    await User.findByIdAndUpdate(req.session.userId, updates);

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error al actualizar el perfil:", err);
    res.status(500).render("editProfile", {
      title: "Editar perfil",
      user: req.user,
      error: "Hubo un error al guardar los cambios. Inténtalo de nuevo.",
    });
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
export const postNewApartment = async (req, res) => {
  console.log(req.body);

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

    // *** Normas ***
    const rules = Array.isArray(req.body.rules)
      ? req.body.rules.map((r) => r.trim()).filter((r) => r.length > 0)
      : [];

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
    // *** Crear la nueva instancia ***
    const newApartment = new Apartment({
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

    await newApartment.save();
    //  res.status(201).json({ apartment: newApartment });
    req.flash("success_msg", "El apartamento se ha creado satisfactoriamente.");
    res.redirect("/admin");
  } catch (error) {
    req.flash("error_msg", "Hubo un error al crear el apartamento.");
    console.error("Error:", error.message);
    res.redirect("/admin");
  }
};

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
  // console.log(req.body);
  const { id } = req.params;
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

    // *** Normas ***
    const rules = Array.isArray(req.body.rules)
      ? req.body.rules.map((r) => r.trim()).filter((r) => r.length > 0)
      : [];

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
        .filter((num) => !isNaN(num) && num >= 0)
        .slice(0, Number(rooms));
    }

    // *** Crear la nueva instancia ***
    // Estado activo/desactivado
    let active = false;
    if (typeof req.body.active === "string") {
      active = req.body.active === "on" || req.body.active === "true";
    } else if (typeof req.body.active === "boolean") {
      active = req.body.active;
    }
    const updateApartment = {
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
      active,
    };
    console.log("Creamos el objeto para update");
    const apartment = await Apartment.findByIdAndUpdate(id, updateApartment, {
      new: true,
    });
    req.flash(
      "success_msg",
      "El apartamento se ha editado satisfactoriamente."
    );
    res.redirect("/admin");
    console.log("Updated!");
  } catch (error) {
    req.flash("error_msg", "Hubo un error al crear el apartamento.");
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
