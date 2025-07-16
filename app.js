
//  Importaciones de Módulos 
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import path from 'path';
import User from './models/user.model.js'; 

// Rutas de la aplicación
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import apiRoutes from './routes/api.routes.js';

// Utilidades de ruta para ES Modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuración de variables de entorno
import dotenv from 'dotenv';
dotenv.config();

// Mensajes flash
import flash from 'connect-flash';

// Logging de peticiones HTTP
import morgan from "morgan";

// Conexión a la base de datos
import { connectDB } from "./config/db.js";

//  Inicialización de la Aplicación 
const app = express();

// Definición de directorios para rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//  Middlewares de Procesamiento de Peticiones 
// Parseo de cuerpo de petición (JSON y URL-encoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Gestión de sesiones (persistentes en MongoDB)
app.use(session({
  secret: process.env.SESSION_SECRET || 'clave-super-secreta',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 día
  }
}));

// Carga del usuario en `res.locals` para vistas (usuario siempre disponible en vistas)
app.use(async (req, res, next) => {
    res.locals.error = undefined;
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      res.locals.currentUser = user; 
    } catch (err) {
      res.locals.currentUser = null;
    }
  } else {
    res.locals.currentUser = null;
  }
  next();
});

// Configuración de mensajes flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Logging de peticiones HTTP con Morgan
app.use(morgan("dev"));

//  Configuración de Archivos Estáticos y Vistas 
// Servir archivos estáticos desde 'public' y 'data'
app.use(express.static(path.join(__dirname, 'public')));
app.use("/data", express.static("data"));

// Configuración del motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//  Montaje de Rutas de la Aplicación 
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

//  Conexión a la Base de Datos 
await connectDB().catch((err) => console.log(err));

//  Manejo de Errores y Rutas No Encontradas 
// Manejo de URL inválida (Error 404)
app.use((req, res) => {
  res
    .status(404)
    .render("error.ejs", { message: "Página no encontrada", status: 404 });
});

// Manejo de errores internos del servidor (Error 500)
app.use((err, req, res, next) => {
  console.error("Error interno del servidor:", err.message);

  res.status(500).render("error", {
    message: "Ups! Ha ocurrido un error. Vuelve a intentarlo más tarde",
    status: 500,
  });
});


//  Inicio del Servidor 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});