# Guía de Implementación: BravaBookMVC

## 1. Sesiones
Se utiliza el paquete `express-session` para gestionar sesiones de usuario. Las sesiones permiten mantener información del usuario entre distintas peticiones HTTP. Se configura en el archivo principal (`app.js`) y se almacena en MongoDB usando `connect-mongo`.

**Ejemplo:**
```js
const session = require('express-session');
const MongoStore = require('connect-mongo');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));
```

## 2. Mensajes Flash
Se usa el paquete `connect-flash` para mostrar mensajes temporales (éxito, error, etc.) entre redirecciones. Se inicializa tras la sesión y se accede en las vistas EJS.

**Ejemplo:**
```js
const flash = require('connect-flash');
app.use(flash());
```
En las vistas:
```ejs
<% if (messages.success) { %>
  <div class="alert alert-success"><%= messages.success %></div>
<% } %>
```

## 3. Variables de Entorno
Se utiliza `dotenv` para cargar variables sensibles (como claves y URIs) desde un archivo `.env`.

**Ejemplo:**
```js
require('dotenv').config();
```
En `.env`:
```
MONGO_URI=mongodb://...
SESSION_SECRET=tu_clave_secreta
```

## 4. Subida de Imágenes
Se implementa con `multer`, que gestiona la subida de archivos desde formularios. Se configura un middleware para definir la carpeta de destino y los tipos permitidos.

**Ejemplo:**
```js
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });
app.post('/ruta', upload.single('imagen'), controlador);
```

## 5. Validación de Formularios con Bootstrap
Se aprovechan las clases de Bootstrap para mostrar validaciones visuales. Se usan atributos HTML (`required`, `pattern`, etc.) y clases como `is-invalid` o `is-valid`.

**Ejemplo:**
```html
<form class="needs-validation" novalidate>
  <input type="text" class="form-control" required>
  <div class="invalid-feedback">Campo obligatorio.</div>
</form>
```
En el JS se puede activar la validación:
```js
// addApartment.js
(function () {
  'use strict';
  var forms = document.querySelectorAll('.needs-validation');
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
})();
```

## 6. Otros Métodos Utilizados
- **Autenticación:** Se implementa con middleware personalizado y bcrypt para el hash de contraseñas.
- **Rutas protegidas:** Se verifica la sesión antes de acceder a rutas privadas.
- **Gestión de datos:** Se usan modelos de Mongoose para interactuar con MongoDB.
- **Vistas:** Se renderizan con EJS y se pasan variables desde el controlador.

---
Este archivo resume los principales métodos y paquetes utilizados en el proyecto BravaBookMVC, explicando su implementación paso a paso.
