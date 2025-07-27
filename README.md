# BravaBook MVC 🏨

## English Documentation

### 🔍 Project Overview
BravaBook MVC is a comprehensive apartment rental platform built with Node.js, Express, and MongoDB. The application provides a complete booking system with user management, apartment listings, reservations, and administrative tools. It features AI-powered search capabilities using Google's Gemini API and interactive maps for apartment locations.

### 🛠 Technologies Used

**Backend:**
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

**Frontend:**
- **EJS** - Embedded JavaScript templating engine
- **HTML5/CSS3** - Modern web standards
- **JavaScript (ES6+)** - Client-side interactivity
- **Bootstrap** - CSS framework for responsive design

**Authentication & Security:**
- **bcrypt** - Password hashing
- **express-session** - Session management
- **connect-mongo** - MongoDB session store
- **express-validator** - Input validation

**File Handling:**
- **Multer** - File upload middleware
- **UUID** - Unique identifier generation

**External APIs:**
- **Google Gemini AI** - Intelligent apartment search
- **Axios** - HTTP client for API requests

**Development Tools:**
- **Morgan** - HTTP request logger
- **Dotenv** - Environment variable management
- **Connect-flash** - Flash messaging

### 📁 Project Structure

```
BravaBookMVC/
├── app.js                     # Main application entry point
├── package.json               # Dependencies and scripts
├── config/
│   └── db.js                 # Database connection configuration
├── controllers/
│   ├── auth.controller.js    # Authentication and user management
│   ├── admin.controller.js   # Administrative functions
│   └── api.controller.js     # API endpoints
├── models/
│   ├── user.model.js         # User data model
│   ├── apartment.model.js    # Apartment data model
│   └── reservation.model.js  # Reservation data model
├── routes/
│   ├── auth.routes.js        # Authentication routes
│   ├── admin.routes.js       # Admin panel routes
│   └── api.routes.js         # API routes
├── middlewares/
│   ├── auth.js              # Authentication middleware
│   ├── validation.js        # Input validation middleware
│   └── uploadMiddleware.js  # File upload middleware
├── views/                   # EJS templates
│   ├── home.ejs            # Homepage
│   ├── login.ejs           # Login page
│   ├── register.ejs        # Registration page
│   ├── dashboard.ejs       # User dashboard
│   ├── adminPanel.ejs      # Admin panel
│   ├── seeApartments.ejs   # Apartment listings
│   ├── detailApartment.ejs # Apartment details
│   ├── addApartment.ejs    # Add apartment form
│   ├── editApartment.ejs   # Edit apartment form
│   ├── reservations.ejs    # Reservations management
│   ├── map.ejs             # Interactive map view
│   └── partials/           # Reusable template components
├── public/
│   ├── css/                # Stylesheets
│   ├── js/                 # Client-side JavaScript
│   ├── img/                # Images
│   └── uploads/            # User uploaded files
└── data/
    ├── city.json           # City data for location selection
    └── province.json       # Province data for location selection
```

### 🗄 Database Structure

**MongoDB Collections:**

1. **Users Collection:**
   - `name`: User's full name
   - `email`: Unique email address
   - `password`: Hashed password (bcrypt)
   - `role`: "user" or "admin"
   - `isSuperAdmin`: Boolean for super admin privileges
   - `bio`: User biography (optional)
   - `avatar`: Profile picture path

2. **Apartments Collection:**
   - `name`: Apartment title
   - `description`: Detailed description
   - `location`: Province and municipality data
   - `price`: Price per night
   - `maxGuests`: Maximum number of guests
   - `rooms`: Number of rooms
   - `bathrooms`: Number of bathrooms
   - `squareMeters`: Apartment size
   - `services`: Available amenities (object)
   - `rules`: House rules array
   - `bedsPerRoom`: Beds configuration
   - `images`: Array of image paths
   - `createdBy`: Reference to user who created it
   - `active`: Boolean for availability

3. **Reservations Collection:**
   - `apartment`: Reference to apartment
   - `user`: Reference to user who made reservation
   - `guestName`: Guest name
   - `guestEmail`: Guest email
   - `startDate`: Check-in date
   - `endDate`: Check-out date
   - `status`: "pending", "confirmed", "cancelled"
   - `paid`: Payment status boolean

### 👥 User Types

**1. Regular User:**
- Browse and search apartments
- Make reservations
- Manage personal reservations
- Edit profile
- View apartment details and maps

**2. Admin:**
- All user capabilities
- Create, edit, and delete apartments
- Manage reservations for their apartments
- View received reservations
- Access to admin dashboard

**3. Super Admin:**
- All admin capabilities
- Manage all users in the system
- Delete any user account
- System-wide administrative privileges
- First admin user automatically becomes super admin

### 🚀 Getting Started

**Prerequisites:**
- Node.js (v14 or higher)
- MongoDB database
- Google Gemini API key (for AI search)

**Installation:**

1. Clone the repository:
```bash
git clone [repository-url]
cd BravaBookMVC
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/bravabookmvc
SESSION_SECRET=your-session-secret
GEMINI_API_KEY=your-gemini-api-key
PORT=3000
```

4. Start the application:
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 📝 User Registration & Login

**Registration Process:**
1. Navigate to `/register`
2. Fill required fields: name, email, password
3. Select user role (user/admin)
4. First admin user automatically becomes super admin
5. Email validation ensures uniqueness
6. Password is automatically hashed with bcrypt

**Login Process:**
1. Navigate to `/login`
2. Enter email and password
3. System validates credentials
4. Session is created upon successful login
5. Redirect to dashboard based on user role

### 🏠 Apartment Management

**Creating Apartments (Admin only):**
1. Access admin dashboard
2. Navigate to "Add Apartment"
3. Fill apartment details:
   - Name and description
   - Location (province/city)
   - Price per night
   - Capacity and rooms
   - Available services
   - House rules
   - Upload images

**Editing Apartments:**
1. Navigate to "My Apartments"
2. Select apartment to edit
3. Modify any field
4. Save changes

**Deleting Apartments:**
1. Access apartment list
2. Use delete action
3. Confirm deletion

### 📅 Reservation System

**Making Reservations (Users):**
1. Browse apartments or use search
2. Select desired apartment
3. Choose check-in and check-out dates
4. System checks availability
5. Fill guest information
6. Confirm reservation

**Managing Reservations (Admins):**
1. View received reservations in dashboard
2. Confirm or cancel reservations
3. Filter by status and dates
4. Contact guests directly

**Reservation Statuses:**
- **Pending**: Awaiting confirmation
- **Confirmed**: Approved by apartment owner
- **Cancelled**: Cancelled by admin or system

### 🎯 Dashboard Features

**User Dashboard:**
- Personal reservation history
- Quick access to search and browse
- Profile management
- Reservation status tracking

**Admin Dashboard:**
- Apartment management tools
- Reservation management with filters
- Revenue and booking statistics
- Quick action buttons

**Dashboard Filtering:**
- Filter reservations by type (made/received)
- Date range filtering
- Status-based filtering
- Real-time filter indicators

### 🤖 AI-Powered Search (Gemini Integration)

**How It Works:**
1. User enters natural language query
2. System sends query to Google Gemini API
3. AI converts query to structured filters
4. Database search with generated filters
5. Results displayed with applied filters

**Example Queries:**
- "Apartment in Madrid with pool under 800€"
- "3-bedroom flat in Barcelona with parking"
- "Pet-friendly apartment with terrace"

**Search Features:**
- Natural language processing
- Location-based filtering
- Price range filtering
- Amenity-based search
- Capacity filtering

### 🗺 Interactive Maps

**Map Features:**
- Display all available apartments
- Interactive markers with apartment info
- Zoom and pan functionality
- Location-based browsing
- Direct links to apartment details

**Implementation:**
- Apartment coordinates stored in database
- Real-time apartment availability
- Responsive map design
- Mobile-friendly interface

### 🔐 Security Features

**Authentication:**
- Secure password hashing with bcrypt
- Session-based authentication
- Session persistence in MongoDB
- Automatic logout on session expiry

**Data Validation:**
- Server-side input validation
- XSS protection
- SQL injection prevention
- File upload restrictions

**Access Control:**
- Role-based permissions
- Route protection middleware
- Admin-only areas
- User data isolation

### 📱 Responsive Design

**Mobile-First Approach:**
- Responsive layouts for all screen sizes
- Touch-friendly interfaces
- Optimized images and loading
- Mobile navigation patterns

**Cross-Browser Compatibility:**
- Modern browser support
- Progressive enhancement
- Fallback mechanisms
- CSS3 and ES6+ features

### 🚀 Performance Optimizations

**Database:**
- Efficient MongoDB queries
- Proper indexing
- Connection pooling
- Query optimization

**Frontend:**
- Minified CSS and JavaScript
- Image optimization
- Lazy loading
- Efficient DOM manipulation

### 🐛 Error Handling

**User-Friendly Error Pages:**
- Custom 404 and 500 error pages
- Clear error messages
- Navigation options
- Contact information

**Development Features:**
- Comprehensive error logging
- Debug mode availability
- Error tracking and monitoring

---

## Documentación en Español

### 🔍 Descripción del Proyecto
BravaBook MVC es una plataforma integral de alquiler de apartamentos construida con Node.js, Express y MongoDB. La aplicación proporciona un sistema completo de reservas con gestión de usuarios, listados de apartamentos, reservas y herramientas administrativas. Incluye capacidades de búsqueda potenciadas por IA usando la API de Google Gemini y mapas interactivos para las ubicaciones de los apartamentos.

### 🛠 Tecnologías Utilizadas

**Backend:**
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework de aplicaciones web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - Modelado de objetos MongoDB

**Frontend:**
- **EJS** - Motor de plantillas JavaScript embebido
- **HTML5/CSS3** - Estándares web modernos
- **JavaScript (ES6+)** - Interactividad del lado del cliente
- **Bootstrap** - Framework CSS para diseño responsivo

**Autenticación y Seguridad:**
- **bcrypt** - Hashing de contraseñas
- **express-session** - Gestión de sesiones
- **connect-mongo** - Almacén de sesiones MongoDB
- **express-validator** - Validación de entrada

**Manejo de Archivos:**
- **Multer** - Middleware de subida de archivos
- **UUID** - Generación de identificadores únicos

**APIs Externas:**
- **Google Gemini AI** - Búsqueda inteligente de apartamentos
- **Axios** - Cliente HTTP para peticiones de API

**Herramientas de Desarrollo:**
- **Morgan** - Logger de peticiones HTTP
- **Dotenv** - Gestión de variables de entorno
- **Connect-flash** - Mensajería flash

### 👥 Tipos de Usuario

**1. Usuario Regular:**
- Navegar y buscar apartamentos
- Realizar reservas
- Gestionar reservas personales
- Editar perfil
- Ver detalles de apartamentos y mapas

**2. Administrador:**
- Todas las capacidades de usuario
- Crear, editar y eliminar apartamentos
- Gestionar reservas de sus apartamentos
- Ver reservas recibidas
- Acceso al panel de administración

**3. Super Administrador:**
- Todas las capacidades de administrador
- Gestionar todos los usuarios del sistema
- Eliminar cualquier cuenta de usuario
- Privilegios administrativos del sistema
- El primer usuario admin se convierte automáticamente en super admin

### 🚀 Primeros Pasos

**Requisitos Previos:**
- Node.js (v14 o superior)
- Base de datos MongoDB
- Clave API de Google Gemini (para búsqueda IA)

**Instalación:**

1. Clonar el repositorio:
```bash
git clone [url-del-repositorio]
cd BravaBookMVC
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env`:
```env
MONGO_URI=mongodb://localhost:27017/bravabookmvc
SESSION_SECRET=tu-secreto-de-sesion
GEMINI_API_KEY=tu-clave-api-gemini
PORT=3000
```

4. Iniciar la aplicación:
```bash
# Modo desarrollo (con reinicio automático)
npm run dev

# Modo producción
npm start
```

### 📝 Registro e Inicio de Sesión

**Proceso de Registro:**
1. Navegar a `/register`
2. Completar campos requeridos: nombre, email, contraseña
3. Seleccionar rol de usuario (user/admin)
4. El primer usuario admin se convierte automáticamente en super admin
5. Validación de email asegura unicidad
6. La contraseña se hashea automáticamente con bcrypt

**Proceso de Inicio de Sesión:**
1. Navegar a `/login`
2. Introducir email y contraseña
3. El sistema valida las credenciales
4. Se crea una sesión tras el login exitoso
5. Redirección al dashboard según el rol del usuario

### 🏠 Gestión de Apartamentos

**Crear Apartamentos (Solo Admins):**
1. Acceder al dashboard de admin
2. Navegar a "Añadir Apartamento"
3. Completar detalles del apartamento:
   - Nombre y descripción
   - Ubicación (provincia/ciudad)
   - Precio por noche
   - Capacidad y habitaciones
   - Servicios disponibles
   - Normas de la casa
   - Subir imágenes

**Editar Apartamentos:**
1. Navegar a "Mis Apartamentos"
2. Seleccionar apartamento a editar
3. Modificar cualquier campo
4. Guardar cambios

**Eliminar Apartamentos:**
1. Acceder a lista de apartamentos
2. Usar acción de eliminar
3. Confirmar eliminación

### 📅 Sistema de Reservas

**Realizar Reservas (Usuarios):**
1. Navegar por apartamentos o usar búsqueda
2. Seleccionar apartamento deseado
3. Elegir fechas de entrada y salida
4. El sistema verifica disponibilidad
5. Completar información del huésped
6. Confirmar reserva

**Gestionar Reservas (Admins):**
1. Ver reservas recibidas en dashboard
2. Confirmar o cancelar reservas
3. Filtrar por estado y fechas
4. Contactar huéspedes directamente

**Estados de Reserva:**
- **Pendiente**: Esperando confirmación
- **Confirmada**: Aprobada por propietario
- **Cancelada**: Cancelada por admin o sistema

### 🎯 Características del Dashboard

**Dashboard de Usuario:**
- Historial de reservas personales
- Acceso rápido a búsqueda y navegación
- Gestión de perfil
- Seguimiento de estado de reservas

**Dashboard de Admin:**
- Herramientas de gestión de apartamentos
- Gestión de reservas con filtros
- Estadísticas de ingresos y reservas
- Botones de acción rápida

**Filtrado del Dashboard:**
- Filtrar reservas por tipo (realizadas/recibidas)
- Filtrado por rango de fechas
- Filtrado basado en estado
- Indicadores de filtro en tiempo real

### 🤖 Búsqueda Potenciada por IA (Integración Gemini)

**Cómo Funciona:**
1. Usuario introduce consulta en lenguaje natural
2. Sistema envía consulta a API de Google Gemini
3. IA convierte consulta a filtros estructurados
4. Búsqueda en base de datos con filtros generados
5. Resultados mostrados con filtros aplicados

**Consultas de Ejemplo:**
- "Apartamento en Madrid con piscina bajo 800€"
- "Piso de 3 habitaciones en Barcelona con parking"
- "Apartamento que admite mascotas con terraza"

**Características de Búsqueda:**
- Procesamiento de lenguaje natural
- Filtrado basado en ubicación
- Filtrado por rango de precios
- Búsqueda basada en comodidades
- Filtrado por capacidad

### 🗺 Mapas Interactivos

**Características del Mapa:**
- Mostrar todos los apartamentos disponibles
- Marcadores interactivos con info del apartamento
- Funcionalidad de zoom y panorámica
- Navegación basada en ubicación
- Enlaces directos a detalles del apartamento

**Implementación:**
- Coordenadas de apartamentos almacenadas en BD
- Disponibilidad de apartamentos en tiempo real
- Diseño de mapa responsivo
- Interfaz amigable para móviles

### 🔐 Características de Seguridad

**Autenticación:**
- Hashing seguro de contraseñas con bcrypt
- Autenticación basada en sesiones
- Persistencia de sesión en MongoDB
- Logout automático al expirar sesión

**Validación de Datos:**
- Validación de entrada del lado del servidor
- Protección XSS
- Prevención de inyección SQL
- Restricciones de subida de archivos

**Control de Acceso:**
- Permisos basados en roles
- Middleware de protección de rutas
- Áreas solo para admin
- Aislamiento de datos de usuario

### 📱 Diseño Responsivo

**Enfoque Mobile-First:**
- Layouts responsivos para todos los tamaños de pantalla
- Interfaces amigables al tacto
- Imágenes y carga optimizadas
- Patrones de navegación móvil

**Compatibilidad Cross-Browser:**
- Soporte para navegadores modernos
- Mejora progresiva
- Mecanismos de fallback
- Características CSS3 y ES6+

### 🚀 Optimizaciones de Rendimiento

**Base de Datos:**
- Consultas MongoDB eficientes
- Indexación apropiada
- Pool de conexiones
- Optimización de consultas

**Frontend:**
- CSS y JavaScript minificados
- Optimización de imágenes
- Carga perezosa
- Manipulación eficiente del DOM

### 🐛 Manejo de Errores

**Páginas de Error Amigables:**
- Páginas de error 404 y 500 personalizadas
- Mensajes de error claros
- Opciones de navegación
- Información de contacto

**Características de Desarrollo:**
- Logging comprensivo de errores
- Disponibilidad de modo debug
- Seguimiento y monitoreo de errores

---

## 📄 License
This project is licensed under the ISC License.

## 👥 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support
If you need help or have questions, please contact our technical team.

---

*Developed with ❤️ using Node.js, Express, MongoDB, and modern web technologies.*
