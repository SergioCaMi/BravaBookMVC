import User from '../models/user.model.js';

// ********** Protección de Rutas **********

/**
 * Middleware para requerir autenticación del usuario.
 * Redirige a la página de login si el usuario no está autenticado o no existe.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función para pasar el control al siguiente middleware.
 */
export const requireAuth = async (req, res, next) => {
  // Verifica si hay un userId en la sesión
  if (!req.session.userId) {
    // Si no está autenticado:
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect("/login");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error en el middleware requireAuth:", error);
    return res.redirect("/login"); 
  }
};

/**
 * Middleware para requerir rol de administrador.
 * Este middleware debe usarse DESPUÉS de `requireAuth`,
 * ya que depende de que `req.user` esté disponible.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función para pasar el control al siguiente middleware.
 */
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    // Si el usuario no es admin, no permite el acceso.
    return res.status(403).send("Acceso denegado");
  }
  next(); 
};

/**
 * Middleware para requerir rol de super administrador.
 * Este middleware debe usarse DESPUÉS de `requireAuth`,
 * ya que depende de que `req.user` esté disponible.
 * Solo el primer administrador creado puede acceder a estas rutas.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 * @param {function} next - Función para pasar el control al siguiente middleware.
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user.isSuperAdmin) {
    req.flash("error_msg", "Acceso denegado. Solo el administrador principal puede acceder a esta función.");
    return res.redirect("/dashboard");
  }
  next(); 
};