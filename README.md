# CODE_CRAFTERS

```
 ██████╗ ██████╗ ██████╗ ███████╗     ██████╗██████╗  █████╗ ███████╗████████╗███████╗██████╗ ███████╗
██╔════╝██╔═══██╗██╔══██╗██╔════╝    ██╔════╝██╔══██╗██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗██╔════╝
██║     ██║   ██║██║  ██║█████╗      ██║     ██████╔╝███████║█████╗     ██║   █████╗  ██████╔╝███████╗
██║     ██║   ██║██║  ██║██╔══╝      ██║     ██╔══██╗██╔══██║██╔══╝     ██║   ██╔══╝  ██╔══██╗╚════██║
╚██████╗╚██████╔╝██████╔╝███████╗    ╚██████╗██║  ██║██║  ██║██║        ██║   ███████╗██║  ██║███████║
 ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝     ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝        ╚═╝   ╚══════╝╚═╝  ╚═╝╚══════╝
```

> **// THE TECH COMMUNITY HUB — Aprende · Conecta · Innova**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-008CDD?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com)
[![License](https://img.shields.io/badge/License-MIT-00FF9D?style=flat-square)](./LICENSE)

---

## ⚡ ¿Qué es Code Crafters?

**Code Crafters** es una plataforma fullstack de gestión de eventos tecnológicos.  
Diseñada para que la comunidad tech cree, descubra y asista a hackathons, masterclasses, talleres y eventos de networking — con ticketing integrado, pagos por Stripe y perfiles personalizados.

---

## 🖥️ Demo

```
cc@system:~$ ./init.sh

✓ PostgreSQL  — schema validado
✓ Spring Security + JWT  — activo
✓ REST API  — 14 endpoints listos
✓ Cloudinary + Stripe  — conectados
✓ React.js  — componentes compilados
✓ SYSTEM ONLINE — todo nominal
```

---

## 🗂️ Estructura del proyecto

```
code-crafters/
├── backend/                        # Spring Boot 3 + Java 17
│   ├── src/main/java/
│   │   └── com/code/crafters/
│   │       ├── controller/         # REST controllers
│   │       ├── service/            # Lógica de negocio
│   │       ├── repository/         # JPA Repositories
│   │       ├── entity/             # Entidades JPA + Enums
│   │       ├── dto/                # Request / Response DTOs
│   │       ├── security/           # Spring Security + JWT
│   │       └── validation/         # Validadores custom (@MaxFileSize)
│   └── src/test/                   # Tests unitarios, integración y E2E
│
└── frontend/                       # React 18 + Vite
    └── src/
        ├── components/
        │   ├── atoms/              # Componentes base reutilizables
        │   ├── molecules/          # Grupos de átomos
        │   └── organisms/          # Secciones completas de UI
        ├── context/auth/           # AuthContext + AuthProvider
        ├── hooks/                  # useAuth
        ├── pages/                  # Vistas por ruta
        ├── router/                 # React Router + ProtectedRoute
        ├── services/               # Capa API (axios)
        ├── utils/                  # dateFormatter, etc.
        └── constants/              # bootSteps, etc.
```

---

## 🛠️ Stack tecnológico

### Backend
| Tecnología | Uso |
|---|---|
| **Java 21** | Lenguaje principal |
| **Spring Boot 3** | Framework base |
| **Spring Security + JWT** | Autenticación y autorización |
| **Spring Data JPA + Hibernate** | Persistencia de datos |
| **PostgreSQL** | Base de datos relacional |
| **Cloudinary** | Almacenamiento y gestión de imágenes |
| **Stripe** | Procesamiento de pagos |
| **Jakarta Validation** | Validación de DTOs |
| **Lombok** | Reducción de boilerplate |

### Frontend
| Tecnología | Uso |
|---|---|
| **React 18** | UI reactiva |
| **Vite** | Build tool ultrarrápido |
| **React Router v6** | Navegación SPA |
| **Axios** | Cliente HTTP con interceptores |
| **Stripe.js + React Stripe** | Checkout integrado |
| **jsPDF** | Generación de tickets en PDF |
| **CSS Modules** | Estilos encapsulados |
| **Vitest + Testing Library** | Tests unitarios |

---

## ✨ Funcionalidades

### 🗓️ Gestión de eventos
- Crear, editar y eliminar eventos con imagen, fecha, ubicación y precio
- Categorías: `HACKATHON` · `MASTERCLASS` · `TALLER` · `NETWORKING`
- Modalidades: `ONLINE` · `PRESENCIAL`
- Filtros avanzados: categoría, precio, alias de autor, rango de fechas, eventos pasados
- Paginación de 15 eventos por página

### 🎫 Ticketing y pagos
- Registro instantáneo a eventos gratuitos con generación de QR
- Pasarela **Stripe** para eventos de pago
- Descarga de entradas en **PDF** con código QR
- Historial de entradas en "Mis Tickets"

### 👤 Perfil de usuario
- Registro y login con **JWT**
- Edición inline de nombre, apellidos, alias, email y contraseña
- Subida de foto de perfil via Cloudinary
- Panel de control de eventos propios (activos e historial)
- Eliminación de cuenta

### 🌐 Comunidad
- Feed público de eventos ordenado por fecha
- Lista de asistentes confirmados con avatares
- Acceso protegido a funciones según autenticación

---

## 🚀 Instalación y puesta en marcha

### Prerrequisitos
```bash
node >= 18.x
java >= 17
postgresql >= 14
```

### 1. Clonar el repositorio
```bash
git clone https://github.com/Code-Crafters-Events/CodeCrafters-Front.git
cd directorio
```

### 2. Backend

```bash
cd backend

# Configurar variables de entorno en application.properties o .env
# DB_URL=jdbc:postgresql://localhost:5432/codecrafters
# DB_USER=postgres
# DB_PASS=tu_password
# JWT_SECRET=tu_secreto_super_seguro
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

./mvnw spring-boot:run
# API disponible en http://localhost:8080
```

### 3. Frontend

```bash
cd frontend

# Crear .env.local
echo "VITE_API_URL=http://localhost:8080" >> .env.local
echo "VITE_STRIPE_PUBLIC_KEY=pk_test_..." >> .env.local

npm install
npm run dev
# App disponible en http://localhost:5173
```

---

## 🔌 API Reference

### Autenticación
```
POST   /api/auth/register        Registro de usuario
POST   /api/auth/login           Login → devuelve JWT
```

### Eventos
```
GET    /api/v1/events            Listar eventos (paginado)
GET    /api/v1/events/:id        Obtener evento por ID
GET    /api/v1/events/user/:id   Eventos de un usuario
GET    /api/v1/events/search     Búsqueda con filtros
POST   /api/v1/events            Crear evento          🔒
PUT    /api/v1/events/:id        Editar evento         🔒
DELETE /api/v1/events/:id        Eliminar evento       🔒
```

### Tickets
```
POST   /api/v1/tickets           Registrarse a evento  🔒
DELETE /api/v1/tickets           Cancelar asistencia   🔒
GET    /api/v1/tickets/user/:id  Tickets de usuario    🔒
GET    /api/v1/tickets/event/:id Asistentes de evento  🔒
GET    /api/v1/tickets/count     Total de tickets
```

### Usuarios
```
GET    /api/v1/users             Listar usuarios
GET    /api/v1/users/:id         Obtener usuario
PATCH  /api/v1/users/:id/profile Actualizar perfil     🔒
DELETE /api/v1/users/:id         Eliminar cuenta       🔒
```

### Pagos
```
POST   /api/v1/payments/create-intent  Crear intención de pago Stripe  🔒
```

### Imágenes
```
POST   /api/v1/images/events/:id  Subir imagen de evento  🔒
POST   /api/v1/images/users/:id   Subir foto de perfil    🔒
```

> 🔒 Requiere header `Authorization: Bearer <token>`

---

## 🧪 Tests

### Backend (JUnit 5 + Mockito)

```bash
cd backend
./mvnw test

# Con cobertura
./mvnw verify jacoco:report
# Reporte en target/site/jacoco/index.html
```

**Cobertura objetivo:**
- `MaxFileSizeValidator` → 16/16 statements · 8/8 branches
- Services → 90%+ líneas
- Controllers → tests de integración con MockMvc

### Frontend (Vitest + Testing Library)

```bash
cd frontend
npm run test           # modo watch
npm run test:run       # una sola pasada
npm run test:coverage  # con reporte de cobertura
```

**Componentes testeados:**

| Componente | Cobertura |
|---|---|
| `AttendeeAvatar` | ✅ 100% branches |
| `AvatarUpload` | ✅ 100% branches |
| `Button` | ✅ 100% branches |
| `CategoryTag` | ✅ 100% branches |
| `PriceTag` | ✅ 100% branches |
| `Toast` | ✅ 100% branches |
| `Tab` | ✅ 100% branches |
| `RadioOption` | ✅ 100% branches |
| `EditableField` | ✅ 100% branches |
| `ScrollToTop` | ✅ 100% branches |
| `LogLine` | ✅ 100% branches |
| `AttendeesList` | ✅ 100% branches |
| `FormField` | ✅ 100% branches |
| `EventRow` | ✅ 100% branches |
| `AuthProvider` | ✅ 100% branches |
| `ProtectedRoute` | ✅ 100% branches |
| `dateFormatter` | ✅ 100% branches |
| `useAuth` | ✅ 100% |

---

## 📁 Variables de entorno

### Backend (`application.properties`)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/codecrafters
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASS}
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000
stripe.secret-key=${STRIPE_SECRET_KEY}
stripe.webhook-secret=${STRIPE_WEBHOOK_SECRET}
```

### Frontend (`.env.local`)
```env
VITE_API_URL=http://localhost:8080
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## 🔐 Seguridad

- **JWT** con expiración configurable para autenticación stateless
- **Spring Security** con filtros por rol y ruta
- **CORS** configurado para el origen del frontend
- **BCrypt** para hash de contraseñas
- Validación de imágenes (tipo MIME + tamaño máx. 5 MB) en cliente y servidor
- Rutas protegidas en frontend con `ProtectedRoute`
- Interceptor Axios para renovación automática de sesión y redirección en 401

---

## 🎨 Diseño

La interfaz sigue una estética **cyberpunk/tech** con:
- Paleta oscura con acentos neón (`#00FF9D`, `#FF2D78`, `#00F5FF`, `#FFB800`)
- Tipografía `Orbitron` + `Share Tech Mono`
- Animaciones de arranque tipo terminal (LoadingScreen)
- Ticker de eventos en tiempo real
- CSS Modules para estilos encapsulados por componente

---

## 👩‍💻 Autora

**Jennifer Cros**  
Desarrolladora fullstack · Java · React · Spring Boot

---

## 📄 Licencia

```
MIT License — © 2026 CODE_CRAFTERS
```

*// system shutdown — hasta la próxima iteración*