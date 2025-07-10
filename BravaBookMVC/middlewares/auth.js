import User from '../models/user.model.js';

// Protección de rutas
export const requireAuth = async (req, res, next) => {
  if (!req.session.userId) return res.redirect("/login");
  const user = await User.findById(req.session.userId);
  if (!user) return res.redirect("/login");
  req.user = user;
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Acceso denegado");
  }
  next();
};
