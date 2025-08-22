# BravaBook MVC

## Table of Contents (English)
1. [Online Version](#online-version)
2. [Project Overview](#project-overview)
3. [Technologies Used & What I Learned](#technologies-used--what-i-learned)
4. [Installation & Getting Started](#installation--getting-started)
5. [Project Structure](#project-structure)
6. [User Types](#user-types)
7. [User Registration & Login](#user-registration--login)
8. [Apartment Management](#apartment-management)
9. [Reservation System](#reservation-system)
10. [Dashboard Features](#dashboard-features)
11. [AI-Powered Search (Gemini Integration)](#ai-powered-search-gemini-integration)
12. [Interactive Maps](#interactive-maps)
13. [Security Features](#security-features)
14. [Responsive Design](#responsive-design)
15. [Performance Optimizations](#performance-optimizations)
16. [Error Handling](#error-handling)
17. [License](#license)
18. [Contributing](#contributing)
19. [Support](#support)

## Tabla de Contenidos (Castellano)
1. [Versión Online](#versión-online)
2. [Descripción del Proyecto](#descripción-del-proyecto)
3. [Tecnologías Utilizadas y Aprendizajes](#tecnologías-utilizadas-y-aprendizajes)
4. [Instalación y Puesta en Marcha](#instalación-y-puesta-en-marcha)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Tipos de Usuario](#tipos-de-usuario)
7. [Registro e Inicio de Sesión](#registro-e-inicio-de-sesión)
8. [Gestión de Apartamentos](#gestión-de-apartamentos)
9. [Sistema de Reservas](#sistema-de-reservas)
10. [Características del Dashboard](#características-del-dashboard)
11. [Búsqueda Potenciada por IA (Gemini)](#búsqueda-potenciada-por-ia-gemini)
12. [Mapas Interactivos](#mapas-interactivos)
13. [Características de Seguridad](#características-de-seguridad)
14. [Diseño Responsivo](#diseño-responsivo)
15. [Optimizaciones de Rendimiento](#optimizaciones-de-rendimiento)
16. [Manejo de Errores](#manejo-de-errores)
17. [License](#license)
18. [Contributing](#contributing)
19. [Support](#support)

## Project Overview
BravaBook MVC is a comprehensive apartment rental platform built with Node.js, Express, MongoDB, EJS, HTML5,  CSS3, Bootstrap and JavaScript (ES6+). The application provides a complete booking system with user management, apartment listings, reservations, and administrative tools. It features AI-powered search capabilities using Google's Gemini API and interactive maps for apartment locations. All technologies applied in both backend and frontend are detailed below.

## Technologies Used & What I Learned

**Backend:**
- Node.js: Server-side JavaScript runtime. In this project I learned to design asynchronous flows using Promises/async-await, organize code into modules, manage dependencies with npm, handle errors and logging, and structure a maintainable server entry point (`app.js`). I also worked on startup scripts and environment-dependent configuration.
- Express.js: API and web app framework. I learned to design RESTful routes and controllers, compose reusable middlewares (authentication, validation, file handling), handle request/response lifecycle, and separate concerns between routers, controllers and services for cleaner code and testability.
- MongoDB: NoSQL database. I learned to model application data for flexible documents, design efficient queries, and consider indexing and query performance for listing and filtering apartments and reservations.
- Mongoose: Data modeling for MongoDB. I learned to define schemas, validation rules, virtuals and population to reference related documents (users, apartments, reservations), and to use Mongoose methods for CRUD operations and transactions where appropriate.

**Frontend:**
- EJS: Templating engine for dynamic views. I learned to render server-side templates, pass data from controllers to views, create reusable partials, and progressively enhance pages with client-side JavaScript.
- HTML5/CSS3: Modern web structure and styles. I practiced semantic HTML, responsive layout techniques, and CSS best practices (flexbox/grid, utility classes) to make views accessible and maintainable.
- JavaScript (ES6+): Client-side interactivity and best practices. I implemented DOM manipulation for forms, client-side validation, date-range pickers, pagination and asynchronous UI updates (AJAX), keeping code modular and readable.
- Bootstrap: Responsive CSS framework and reusable components. I used Bootstrap to speed up layout and UI consistency, combining it with custom CSS for project-specific styling.

**Authentication & Security:**
- bcrypt: Secure password hashing. Implemented password hashing and comparison to protect stored credentials.
- express-session: User session management. Learned session lifecycle, session options, and protecting routes based on session state.
- connect-mongo: Session storage in MongoDB. Configured persistent session storage to survive server restarts and scale safely.
- express-validator: Input validation. Added server-side validation to prevent malformed data and reduce security risks.

**File Handling:**
- Multer: File upload middleware. Learned to accept multipart form data, configure storage destinations and filename generation, and validate uploaded file types and sizes.
- UUID: Unique identifier generation. Used to create non-colliding filenames and identifiers for uploaded assets.

**External APIs:**
- Google Gemini AI: Intelligent apartment search using AI. Learned to build an integration that sends natural language queries, interprets the AI response as structured filters, and translates that into DB queries to provide smarter search results.
- Axios: HTTP client for API consumption. Used for making API requests to external services and handling responses and errors robustly.

**Development Tools:**
- Morgan: HTTP request logger. Used to log incoming requests for debugging and performance analysis.
- Dotenv: Environment variable management. Learned to keep secrets and environment-specific settings out of source code.
- Connect-flash: Flash messaging for notifications. Used for short user feedback messages after form submissions and redirects.

**Other Learnings:**
- Responsive and mobile-first design: Building layouts and interactions that work well on desktop and mobile.
- Access control and user roles: Designing role-based authorization (user, admin, super admin) and protecting routes and actions accordingly.
- Performance optimization and error handling: Applying basic optimizations (minification, lazy loading) and creating friendly error pages and logging to trace issues.
- Interactive maps and filters: Storing coordinates, rendering map markers, and enabling location-based browsing and filtering for apartments.

## Installation & Getting Started

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
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Rename the `.env.example` to `.env` in the project root. You can do this from the terminal using:
   ```powershell
   ren .env.example .env
   ```
   After renaming, open the `.env` file and add your own credentials and API keys (e.g., MongoDB URI, session secret, Gemini API key, etc.) following the example provided.
4. Start the application:
   ```bash
   # Development mode (with auto-restart)
   npm run dev

   # Production mode
   npm start
   ```
5. Access `http://localhost:3000` in your browser.

**Note:** For the online version, visit [https://bravabookmvc.onrender.com/](https://bravabookmvc.onrender.com/)

## Project Structure

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

## User Types

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

## User Registration & Login

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

## Apartment Management

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

## Reservation System

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

## Dashboard Features

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

## AI-Powered Search (Gemini Integration)

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

## Interactive Maps

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

## Security Features

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

## Responsive Design

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

## Performance Optimizations

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

## Error Handling

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

# BravaBook MVC (Castellano)

## Versión Online
[BravaBookMVC en Render](https://bravabookmvc.onrender.com/)

## Descripción del Proyecto
BravaBook MVC es una plataforma integral de alquiler de apartamentos construida con Node.js, Express, MongoDB, EJS, HTML5, CSS3, Bootstrap y JavaScript (ES6+). La aplicación proporciona un sistema completo de reservas con gestión de usuarios, listados de apartamentos, reservas y herramientas administrativas. Incluye búsqueda por IA (Google Gemini API) y mapas interactivos. Todas las tecnologías aplicadas en backend y frontend se detallan abajo.

## Tecnologías Utilizadas y Aprendizajes

**Backend:**
- Node.js: Entorno de ejecución para JavaScript en el servidor. En este proyecto aprendí a diseñar flujos asincrónicos usando Promises/async-await, organizar el código en módulos, gestionar dependencias con npm, manejar errores y logging, y estructurar un punto de entrada mantenible (`app.js`). También trabajé con scripts de arranque y configuración por entorno.
- Express.js: Framework para crear APIs y aplicaciones web. Aprendí a diseñar rutas RESTful y controladores, componer middlewares reutilizables (autenticación, validación, manejo de archivos), manejar el ciclo request/response y separar responsabilidades entre routers, controladores y servicios para facilitar pruebas y mantenimiento.
- MongoDB: Base de datos NoSQL. Aprendí a modelar datos de aplicación con documentos flexibles, diseñar consultas eficientes y considerar indexado y rendimiento para listados y filtros de apartamentos y reservas.
- Mongoose: Modelado de datos en MongoDB. Aprendí a definir esquemas y reglas de validación, virtuals y población para referencias entre documentos (usuarios, apartamentos, reservas), y a usar métodos de Mongoose para operaciones CRUD y transacciones cuando fue necesario.

**Frontend:**
- EJS: Motor de plantillas para renderizar vistas dinámicas. Aprendí a renderizar plantillas del lado servidor, pasar datos desde controladores a vistas, crear partials reutilizables y enriquecer progresivamente las páginas con JavaScript del lado cliente.
- HTML5/CSS3: Estructura y estilos modernos para la web. Practiqué HTML semántico, técnicas de diseño responsivo y buenas prácticas de CSS (flexbox/grid, clases utilitarias) para mantener vistas accesibles y mantenibles.
- JavaScript (ES6+): Interactividad en el cliente y buenas prácticas de programación. Implementé manipulación del DOM para formularios, validación cliente, date-range pickers, paginación y actualizaciones asíncronas (AJAX), manteniendo el código modular y legible.
- Bootstrap: Framework CSS para diseño responsivo y componentes reutilizables. Lo utilicé para acelerar el diseño y mantener consistencia visual, combinándolo con CSS personalizado para estilos específicos del proyecto.

**Autenticación y Seguridad:**
- bcrypt: Hashing seguro de contraseñas. Implementé hashing y comparación de contraseñas para proteger credenciales almacenadas.
- express-session: Gestión de sesiones de usuario. Aprendí el ciclo de vida de sesiones, opciones de configuración y cómo proteger rutas según el estado de sesión.
- connect-mongo: Almacenamiento de sesiones en MongoDB. Configuré persistencia de sesiones para que sobrevivan reinicios del servidor y escalen de forma segura.
- express-validator: Validación de entrada. Añadí validaciones del lado servidor para prevenir datos mal formados y reducir riesgos de seguridad.

**Manejo de Archivos:**
- Multer: Middleware para subir archivos. Aprendí a aceptar multipart/form-data, configurar destinos de almacenamiento y generación de nombres de archivo, y validar tipos y tamaños de archivos subidos.
- UUID: Generación de identificadores únicos. Usado para crear nombres de archivo no colisionables e identificadores para assets subidos.

**APIs Externas:**
- Google Gemini AI: Búsqueda inteligente de apartamentos usando IA. Aprendí a construir una integración que envía consultas en lenguaje natural, interpreta la respuesta de la IA como filtros estructurados y transforma eso en consultas a la BD para ofrecer resultados más inteligentes.
- Axios: Cliente HTTP para consumir APIs. Usado para realizar peticiones a servicios externos y gestionar respuestas y errores de forma robusta.

**Herramientas de Desarrollo:**
- Morgan: Logger de peticiones HTTP. Usado para registrar peticiones entrantes durante desarrollo y análisis.
- Dotenv: Gestión de variables de entorno. Aprendí a mantener secretos y configuraciones por entorno fuera del código fuente.
- Connect-flash: Mensajería flash para notificaciones. Usado para mostrar mensajes de feedback al usuario tras formularios y redirecciones.

**Otros Aprendizajes:**
- Diseño responsivo y mobile-first: Construir layouts e interacciones que funcionen bien en escritorio y móvil.
- Control de acceso y roles de usuario: Diseñar autorización basada en roles (user, admin, super admin) y proteger rutas y acciones.
- Optimización de rendimiento y manejo de errores: Aplicar optimizaciones básicas (minificación, carga perezosa) y crear páginas de error amigables y logging para rastrear incidencias.
- Mapas interactivos y filtros: Almacenar coordenadas, renderizar marcadores en el mapa y permitir navegación y filtrado por ubicación para los apartamentos.

## Instalación y Puesta en Marcha

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
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Renombra el archivo `.env.example` a `.env` en la raíz del proyecto. Puedes hacerlo desde la terminal con:
   ```powershell
   ren .env.example .env
   ```
   Después de renombrarlo, abre el archivo `.env` y añade tus propias credenciales y claves (por ejemplo, URI de MongoDB, secreto de sesión, clave de API Gemini, etc.) siguiendo el ejemplo proporcionado.
4. Iniciar la aplicación:
   ```bash
   # Modo desarrollo (con reinicio automático)
   npm run dev

   # Modo producción
   npm start
   ```
5. Acceder a `http://localhost:3000` en tu navegador.

**Nota:** Para la versión online, visita [https://bravabookmvc.onrender.com/](https://bravabookmvc.onrender.com/)

## Estructura del Proyecto

```
BravaBookMVC/
├── app.js                     # Punto de entrada principal de la aplicación
├── package.json               # Dependencias y scripts
├── config/
│   └── db.js                 # Configuración de conexión a la base de datos
├── controllers/
│   ├── auth.controller.js    # Autenticación y gestión de usuarios
│   ├── admin.controller.js   # Funciones administrativas
│   └── api.controller.js     # Endpoints de la API
├── models/
│   ├── user.model.js         # Modelo de datos de usuario
│   ├── apartment.model.js    # Modelo de datos de apartamento
│   └── reservation.model.js  # Modelo de datos de reserva
├── routes/
│   ├── auth.routes.js        # Rutas de autenticación
│   ├── admin.routes.js       # Rutas del panel de admin
│   └── api.routes.js         # Rutas de la API
├── middlewares/
│   ├── auth.js              # Middleware de autenticación
│   ├── validation.js        # Middleware de validación de entrada
│   └── uploadMiddleware.js  # Middleware de subida de archivos
├── views/                   # Plantillas EJS
│   ├── home.ejs            # Página de inicio
│   ├── login.ejs           # Página de inicio de sesión
│   ├── register.ejs        # Página de registro
│   ├── dashboard.ejs       # Panel de usuario
│   ├── adminPanel.ejs      # Panel de administración
│   ├── seeApartments.ejs   # Listados de apartamentos
│   ├── detailApartment.ejs # Detalles del apartamento
│   ├── addApartment.ejs    # Formulario para añadir apartamento
│   ├── editApartment.ejs   # Formulario para editar apartamento
│   ├── reservations.ejs    # Gestión de reservas
│   ├── map.ejs             # Vista de mapa interactivo
│   └── partials/           # Componentes de plantilla reutilizables
├── public/
│   ├── css/                # Hojas de estilo
│   ├── js/                 # JavaScript del lado del cliente
│   ├── img/                # Imágenes
│   └── uploads/            # Archivos subidos por el usuario
└── data/
    ├── city.json           # Datos de ciudades para selección de ubicación
    └── province.json       # Datos de provincias para selección de ubicación
```

### 🗄 Estructura de la Base de Datos

**Colecciones de MongoDB:**

1. **Colección de Usuarios:**
   - `name`: Nombre completo del usuario
   - `email`: Dirección de correo electrónico única
   - `password`: Contraseña hasheada (bcrypt)
   - `role`: "user" o "admin"
   - `isSuperAdmin`: Booleano para privilegios de super admin
   - `bio`: Biografía del usuario (opcional)
   - `avatar`: Ruta de la imagen de perfil

2. **Colección de Apartamentos:**
   - `name`: Título del apartamento
   - `description`: Descripción detallada
   - `location`: Datos de provincia y municipio
   - `price`: Precio por noche
   - `maxGuests`: Máximo número de huéspedes
   - `rooms`: Número de habitaciones
   - `bathrooms`: Número de baños
   - `squareMeters`: Tamaño del apartamento
   - `services`: Servicios disponibles (objeto)
   - `rules`: Array de normas de la casa
   - `bedsPerRoom`: Configuración de camas
   - `images`: Array de rutas de imágenes
   - `createdBy`: Referencia al usuario que lo creó
   - `active`: Booleano para disponibilidad

3. **Colección de Reservas:**
   - `apartment`: Referencia al apartamento
   - `user`: Referencia al usuario que hizo la reserva
   - `guestName`: Nombre del huésped
   - `guestEmail`: Correo electrónico del huésped
   - `startDate`: Fecha de entrada
   - `endDate`: Fecha de salida
   - `status`: "pending", "confirmed", "cancelled"
   - `paid`: Estado de pago booleano

## Tipos de Usuario

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

## Registro e Inicio de Sesión

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

## Gestión de Apartamentos

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

## Sistema de Reservas

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

## Características del Dashboard

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

## Búsqueda Potenciada por IA (Integración Gemini)

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

## Mapas Interactivos

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

## Características de Seguridad

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

## Diseño Responsivo

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

## Optimizaciones de Rendimiento

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

## Manejo de Errores

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

*Developed by Sergio Calvo using Node.js, Express, MongoDB, EJS, HTML5, CSS3, JavaScript (ES6+), Bootstrap, and modern web technologies.*
