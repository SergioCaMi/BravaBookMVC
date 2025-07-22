# Validaciones del Backend - BravaBookMVC

## Resumen de Implementación

Se han implementado validaciones robustas del backend usando **express-validator** para todos los modelos de la aplicación: User, Apartment y Reservation.

## Middleware de Validación Implementado

### Archivo: `middlewares/validation.js`

#### Funciones Principales:

1. **`handleValidationErrors`**: Maneja errores de validación de forma centralizada
2. **Validaciones de Usuario**: `validateUserRegistration`, `validateUserLogin`, `validateUserUpdate`
3. **Validaciones de Apartamento**: `validateApartment`
4. **Validaciones de Reserva**: `validateReservation`
5. **Validaciones Auxiliares**: `validateMongoId`, `validatePagination`, `validateApartmentFilters`

---

## Validaciones por Modelo

### 👤 USUARIO (User)

#### Registro (`validateUserRegistration`):
- **Nombre**: 2-50 caracteres, solo letras y espacios
- **Email**: Formato válido, único en BD, máximo 100 caracteres
- **Contraseña**: 8-16 caracteres, al menos 1 letra, 1 número, 1 símbolo especial
- **Rol**: Opcional, solo 'user' o 'admin'
- **Biografía**: Opcional, máximo 500 caracteres
- **Avatar**: Opcional, URL válida

#### Login (`validateUserLogin`):
- **Email**: Formato válido, obligatorio
- **Contraseña**: Obligatoria

#### Actualización (`validateUserUpdate`):
- Mismas validaciones que registro pero todos los campos opcionales

---

### 🏠 APARTAMENTO (Apartment)

#### Validaciones Principales (`validateApartment`):
- **Título**: 5-100 caracteres, obligatorio
- **Descripción**: 20-1000 caracteres, obligatoria
- **Reglas**: Array opcional, cada regla 1-200 caracteres
- **Habitaciones**: 1-20, entero
- **Camas por habitación**: Array de enteros 1-10
- **Baños**: 1-10, entero
- **Huéspedes máx**: 1-50, entero
- **Precio por noche**: 1-10000, obligatorio

#### Ubicación:
- **Provincia**: 2-50 caracteres, obligatorio
- **Ciudad**: 2-50 caracteres, obligatorio
- **Dirección**: 5-200 caracteres, obligatorio
- **Coordenadas**: Lat (-90 a 90), Lng (-180 a 180)

#### Servicios:
- Todos booleanos opcionales (aire acondicionado, calefacción, etc.)

---

### 📅 RESERVA (Reservation)

#### Validaciones Principales (`validateReservation`):
- **Apartamento**: ID de MongoDB válido, debe existir y estar activo
- **Fecha inicio**: Formato ISO8601, no puede ser anterior a hoy
- **Fecha fin**: Posterior a fecha inicio, máximo 365 días
- **Nombre huésped**: 2-100 caracteres, solo letras y espacios
- **Email huésped**: Formato válido, máximo 100 caracteres
- **Estado**: 'confirmed' o 'cancelled'
- **Pagado**: Booleano opcional
- **Precio total**: Número positivo

#### Validaciones Avanzadas:
- **Conflicto de fechas**: Verifica automáticamente que no haya solapamiento con otras reservas confirmadas
- **Disponibilidad del apartamento**: Confirma que el apartamento existe y está activo

---

## Aplicación en Controladores

### Auth Controller (`auth.controller.js`):
- `register`: Valida datos de registro + verificación manual de email único
- `login`: Valida credenciales de entrada

### Admin Controller (`admin.controller.js`):
- `postNewApartment`: Valida datos de apartamento nuevo
- `putApartmentEdit`: Valida edición de apartamento
- `putReservationEdit`: Valida edición de reserva

---

## Aplicación en Rutas

### Auth Routes (`auth.routes.js`):
```javascript
router.post('/register', validateUserRegistration, handleValidationErrors, authController.register);
router.post('/login', validateUserLogin, handleValidationErrors, authController.login);
router.post('/profile/update', validateUserUpdate, handleValidationErrors, authController.postUpdateProfile);
```

### Admin Routes (`admin.routes.js`):
```javascript
router.post("/apartment/new", validateApartment, handleValidationErrors, adminController.postNewApartment);
router.post("/apartment/edit/:id/save", validateApartment, handleValidationErrors, adminController.putApartmentEdit);
router.post("/reservation/edit/:id", validateReservation, handleValidationErrors, adminController.putReservationEdit);
```

---

## Características de Seguridad

### 🔒 Validaciones de Seguridad:
1. **Sanitización**: Trim automático de strings
2. **Normalización**: Email normalization
3. **Validaciones asíncronas**: Verificación en BD para emails únicos
4. **Verificación de existencia**: Apartamentos y usuarios deben existir
5. **Validación de disponibilidad**: Apartamentos activos, fechas disponibles

### 📝 Manejo de Errores:
- **AJAX requests**: Respuesta JSON con errores
- **Formularios normales**: Flash messages + redirect
- **Errores centralizados**: Un solo middleware para todos los casos

### 🎯 Validaciones Específicas del Negocio:
- **Fechas de reserva**: No solapamiento, rangos válidos
- **Contraseñas**: Fuerza obligatoria con patrones específicos
- **Emails únicos**: Verificación en tiempo real en BD
- **Estados válidos**: Solo valores enum permitidos

---

## Ejemplo de Uso

```javascript
// En el controlador
export const register = async (req, res) => {
  // Las validaciones ya se ejecutaron en el middleware
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    req.flash("error", errorMessages.join(', '));
    return res.redirect("/register");
  }
  
  // Los datos ya están validados y sanitizados
  const { name, email, password } = req.body;
  // ... resto de la lógica
};
```

---

## Beneficios Implementados

✅ **Validación robusta del backend** independiente del frontend
✅ **Sanitización automática** de inputs
✅ **Verificaciones de integridad** en base de datos
✅ **Validaciones de negocio** específicas del dominio
✅ **Manejo centralizado de errores**
✅ **Seguridad mejorada** contra inyecciones y datos maliciosos
✅ **Experiencia de usuario** mejorada con mensajes claros
✅ **Consistencia** entre todas las rutas y controladores

El sistema ahora tiene una capa completa de validación del backend que complementa las validaciones del frontend y del modelo, proporcionando seguridad en profundidad.
