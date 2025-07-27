import User from '../models/user.model.js';

// --- Protección de Rutas ---

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
    // Si no hay userId en la sesión, el usuario no está autenticado.
    // Redirige al login.
    return res.redirect("/login");
  }

  try {
    // Busca el usuario en la base de datos por el ID de la sesión.
    const user = await User.findById(req.session.userId);

    // Si el usuario no existe en la base de datos (ej. fue eliminado),
    // redirige al login.
    if (!user) {
      return res.redirect("/login");
    }

    // Almacena el objeto de usuario en req.user para que esté disponible
    // en los siguientes middlewares y controladores de ruta.
    req.user = user;
    next(); // Pasa el control al siguiente middleware o ruta.
  } catch (error) {
    // Manejo de errores durante la búsqueda del usuario.
    console.error("Error en el middleware requireAuth:", error);
    return res.redirect("/login"); // En caso de error, redirige al login.
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
  // Verifica si req.user existe y si el rol del usuario no es "admin".
  // req.user debería haber sido establecido por el middleware `requireAuth`.
  if (req.user.role !== "admin") {
    // Si el usuario no es administrador, deniega el acceso con un estado 403.
    return res.status(403).send("Acceso denegado");
  }
  next(); // Si el usuario es administrador, pasa el control al siguiente middleware o ruta.
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
  // Verifica si req.user existe y si el usuario es super administrador.
  if (!req.user.isSuperAdmin) {
    // Si el usuario no es super administrador, deniega el acceso.
    req.flash("error_msg", "Acceso denegado. Solo el administrador principal puede acceder a esta función.");
    return res.redirect("/dashboard");
  }
  next(); // Si el usuario es super administrador, continúa.
};