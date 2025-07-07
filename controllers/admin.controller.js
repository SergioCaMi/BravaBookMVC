import User from "../models/user.model.js";

// DashBoard
export const dashboard = async (req, res) => {
  console.log("Dashboard");

  const user = await User.findById(req.session.userId);
  res.render("dashboard", { title: "admin", user });
};


// Editar profile
export const getEditProfile = async (req, res) => {
  const { id } = req.params;
  console.log(id)
  res.render("aboutUs", { title: "about", error: undefined });
};


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