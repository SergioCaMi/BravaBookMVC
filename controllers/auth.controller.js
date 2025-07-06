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
