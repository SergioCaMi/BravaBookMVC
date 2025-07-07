import path from 'path';

import User from "../models/user.model.js";

// Registro
export const register = async (req, res) => {
  try {
    console.log("Register");
    const { name, email, password } = req.body;

    // Ya existe?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", {
        title: "home",
        error: "El correo electrónico ya está en uso.",
      });
    }

    // El primer usuario será admin
    const firstUser = await User.countDocuments();
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: firstUser === 0 ? "admin" : "user",
    });

    await user.save();
    console.log("Usuario guardado:", user);
    req.session.userId = user._id;
    res.redirect("/dashboard");

    // res.render("home", { title: "home", error: undefined, user});
  } catch (err) {
    console.error(err);
    res.render("register", {
      title: "home",
      error: "Error al registrar usuario",
    });
  }
};

// LogIn
export const login = async (req, res) => {
  console.log("Login");

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.render("login", {
      title: "home",
      error: "Credenciales incorrectas",
    });
  }
  req.session.userId = user._id;
  console.log(user.name);
  res.redirect("/dashboard");
};

// LogOut
export const logout = (req, res) => {
  console.log("LogOut");

  req.session.destroy(() => res.redirect("/"));
};

// DashBoard
export const dashboard = async (req, res) => {
  console.log("Dashboard");

  const user = await User.findById(req.session.userId);
  res.render("dashboard", { title: "home", user });
};

// Home
export const getHome = async (req, res) => {
  res.render("home", { title: "home", error: undefined });
};
// ContactUs
export const getContactUs = async (req, res) => {
  res.render("contactUs", { title: "contact", error: undefined });
};
// AboutUs
export const getAboutUs = async (req, res) => {
  res.render("aboutUs", { title: "about", error: undefined });
};

// Editar profile
export const getEditProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }
    res.status(200).render("editProfile.ejs", { title: "home", user , error:undefined});
  } catch (err) {
    res.status(500).render("error.ejs", {
      message: "Error interno del servidor",
      status: 404,
    });
  }
};


export const postUpdateProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;

    if (!name || !email) {
      return res.status(400).render('editProfile', {
        title: 'Editar perfil',
        user: req.user,
        error: 'Nombre y correo son obligatorios.',
      });
    }

    const updates = { name, email, bio };

    if (req.file) {
      const userEmail = email;
      const userBaseName = userEmail.split('@')[0];
      const avatarPath = path.join('usuarios', userBaseName, 'avatar.jpg');

      updates.avatar = avatarPath;
    }

    await User.findByIdAndUpdate(req.session.userId, updates);

    res.redirect('/dashboard');

  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).render('editProfile', {
      title: 'Editar perfil',
      user: req.user,
      error: 'Hubo un error al guardar los cambios.',
    });
  }
};