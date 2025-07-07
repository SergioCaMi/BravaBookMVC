import User from "../models/user.model.js";
import Apartment from "../models/apartment.model.js";
import Reservation from "../models/reservation.model.js";


// ******************** Usuarios ********************

// DashBoard
export const dashboard = async (req, res) => {
  console.log("Dashboard");

  const user = await User.findById(req.session.userId);
  res.render("dashboard", { title: "admin", user });
};


// GET Edit Profile
export const getEditProfile = async (req, res) => {
  const { id } = req.params;
  console.log(id)
  res.render("aboutUs", { title: "about", error: undefined });
};

// POST Edit Profile
export const postUpdateProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;

    // Validación básica
    if (!name || !email) {
      return res.status(400).render('editProfile', {
        title: 'Editar perfil',
        user: req.user,
        error: 'Nombre y correo electrónico son obligatorios.',
      });
    }

    const updates = { name, email, bio };

    // Si se subió un nuevo avatar
    if (req.file) {
      const currentUser = await User.findById(req.session.userId);

      // Borrar avatar anterior si no es el por defecto
      if (currentUser.avatar && currentUser.avatar !== 'default.jpg') {
        const oldAvatarPath = path.join(
          process.cwd(),
          'public/uploads/avatars',
          currentUser.avatar
        );

        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      updates.avatar = req.file.filename;
    }

    await User.findByIdAndUpdate(req.session.userId, updates);

    res.redirect('/dashboard');

  } catch (err) {
    console.error('Error al actualizar el perfil:', err);
    res.status(500).render('editProfile', {
      title: 'Editar perfil',
      user: req.user,
      error: 'Hubo un error al guardar los cambios. Inténtalo de nuevo.',
    });
  }
};

// GET Users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({role: "user"}).sort({ name: 1 });
    
  res.render("users.ejs", { title: "admin", error: undefined , users});
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(404).render("error.ejs", {
      message: "Error interno del servidor",
      status: 404,
    });
  }
};


// ******************** Apartamentos ********************

// GET Add Apartment
export const getAddApartment = async (req, res) => {
  res.render("addApartment.ejs", { title: "admin", error: undefined });
};

// POST Add Apartment
export const postAddApartment = async (req, res) => {
  const { id } = req.params;
  console.log(id)
  res.render("aboutUs", { title: "about", error: undefined });
};


// ******************** Reservas ********************
// GET Reservation
export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({});
    
  res.render("reservations.ejs", { title: "admin", error: undefined , reservations});
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    res.status(404).render("error.ejs", {
      message: "Error interno del servidor",
      status: 404,
    });
  }
};
