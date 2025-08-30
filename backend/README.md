# MediSafe Backend API

Backend estructurado en Node.js para la aplicación de gestión de medicamentos MediSafe.

## 🏗️ Arquitectura

```
backend/
├── src/
│   ├── config/          # Configuraciones
│   │   ├── app.js       # Configuración Express
│   │   └── database.js  # Configuración SQLite
│   ├── controllers/     # Lógica de negocio
│   │   └── auth.controller.js
│   ├── middleware/      # Middlewares
│   │   ├── auth.js      # Autenticación JWT
│   │   └── validation.js # Validaciones
│   ├── routes/          # Rutas de la API
│   │   └── auth.routes.js
│   └── index.js         # Punto de entrada
├── package.json
└── README.md
```

## 🚀 Endpoints

### Base: `/api/v1`

#### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/profile` - Obtener perfil (protegido)

#### Sistema
- `GET /health` - Estado del servidor

## 📋 Requisitos

- Node.js 18+
- npm o yarn

## ⚙️ Instalación

1. **Instalar dependencias:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variables de entorno** en `config.env` (en el root del repo):
   ```env
   BACKEND_PORT=4000
   CORS_ORIGIN=*
   JWT_SECRET=tu_super_secret_key_aqui
   ```

3. **Iniciar servidor:**
   ```bash
   # Desarrollo (con nodemon)
   npm run dev
   
   # Producción
   npm start
   ```

## 🔐 Autenticación

- **JWT** con expiración de 24 horas
- **Hash de contraseñas** con bcrypt (12 salt rounds)
- **Validaciones robustas** en entrada de datos
- **Middleware de autenticación** para rutas protegidas

## 🛡️ Seguridad

- **Helmet** para headers de seguridad
- **CORS** configurado para desarrollo
- **Rate limiting** (200 requests por 15 minutos)
- **Validación de entrada** con express-validator
- **Sanitización** de datos

## 📊 Base de Datos

- **SQLite** con esquema automático
- **Tablas:** users, medications, reminders, goals
- **Relaciones** con foreign keys y cascade delete
- **Timestamps** automáticos

## 🧪 Pruebas

Usa `test-backend-auth.html` para probar:
- Health check
- Registro de usuarios
- Login y obtención de JWT
- Perfil de usuario (con token)

## 📝 Logs

El servidor registra:
- Todas las peticiones HTTP
- Errores de validación
- Errores internos del servidor
- Estado de la base de datos

## 🔄 Desarrollo

Para agregar nuevas funcionalidades:
1. Crear controlador en `controllers/`
2. Crear validaciones en `middleware/validation.js`
3. Crear rutas en `routes/`
4. Agregar middleware de autenticación si es necesario 