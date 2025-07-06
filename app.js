import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import path from 'path';
import User from './models/user.model.js'; 


// Rutas
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Variables deentorno
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Directorios
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ********** Procesar datos de formularios y JSON **********
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Sesiones ---
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

// Usuario siempre cargado
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


// Rutas
app.use('/', authRoutes);
app.use('/admin', adminRoutes);


// --- Middlewares ---
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ********** Motor de vistas EJS **********
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ********** Recursos publicos **********
app.use(express.static("public"));
app.use("/data", express.static("data"));


// ********** Morgan para visualizar el flujo por consola **********
import morgan from "morgan";
app.use(morgan("dev"));


// ********** Conexión a la base de datos **********
import { connectDB } from "./config/db.js";
await connectDB().catch((err) => console.log(err));

// --- Servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});


// --- Conexión a la base de datos ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error conectando a MongoDB', err));


// ******************** URL inválida Error 404 ********************
app.use((req, res) => {
  res
    .status(404)
    .render("error.ejs", { message: "Página no encontrada", status: 404 });
});

// ******************** Manejo de errores internos (500) ********************
app.use((err, req, res, next) => {
  console.error("Error interno del servidor:", err.message);

  res.status(500).render("error", {
    message: "Ups! Ha ocurrido un error. Vuelve a intentarlo más tarde",
    status: 500,
  });
});
