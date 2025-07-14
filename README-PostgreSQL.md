# MediSafe - Migración a PostgreSQL

Este documento describe cómo migrar MediSafe de localStorage a PostgreSQL.

## 🗄️ Estructura de la Base de Datos

### Tablas Creadas

1. **users** - Usuarios del sistema
   - `id` (SERIAL PRIMARY KEY)
   - `username` (VARCHAR(50) UNIQUE)
   - `password_hash` (VARCHAR(255))
   - `email` (VARCHAR(100))
   - `created_at`, `updated_at` (TIMESTAMP)

2. **medications** - Medicamentos
   - `id` (SERIAL PRIMARY KEY)
   - `user_id` (FOREIGN KEY → users.id)
   - `name` (VARCHAR(100))
   - `dose` (VARCHAR(100))
   - `frequency` (VARCHAR(100))
   - `time` (TIME)
   - `expiry_date` (DATE)
   - `notes` (TEXT)
   - `created_at`, `updated_at` (TIMESTAMP)

3. **reminders** - Recordatorios
   - `id` (SERIAL PRIMARY KEY)
   - `user_id` (FOREIGN KEY → users.id)
   - `medication_id` (FOREIGN KEY → medications.id)
   - `reminder_time` (TIME)
   - `days_of_week` (INTEGER[])
   - `is_active` (BOOLEAN)
   - `last_taken` (TIMESTAMP)
   - `created_at`, `updated_at` (TIMESTAMP)

4. **goals** - Metas personales
   - `id` (SERIAL PRIMARY KEY)
   - `user_id` (FOREIGN KEY → users.id)
   - `title` (VARCHAR(200))
   - `description` (TEXT)
   - `deadline` (DATE)
   - `is_completed` (BOOLEAN)
   - `completed_at` (TIMESTAMP)
   - `created_at`, `updated_at` (TIMESTAMP)

## 🚀 Instalación y Configuración

### Prerrequisitos

1. **PostgreSQL** instalado y ejecutándose
2. **Node.js** (versión 14 o superior)
3. **npm** o **yarn**

### Paso 1: Instalar PostgreSQL

#### Windows
```bash
# Descargar desde https://www.postgresql.org/download/windows/
# O usar chocolatey:
choco install postgresql
```

#### macOS
```bash
# Usar Homebrew
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Paso 2: Configurar PostgreSQL

```bash
# Conectar como usuario postgres
sudo -u postgres psql

# Crear base de datos
CREATE DATABASE medisafe;

# Crear usuario (opcional)
CREATE USER medisafe_user WITH PASSWORD 'tu_password';

# Dar permisos
GRANT ALL PRIVILEGES ON DATABASE medisafe TO medisafe_user;

# Salir
\q
```

### Paso 3: Configurar Variables de Entorno

Edita el archivo `config.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medisafe
DB_USER=postgres
DB_PASSWORD=tu_password_aqui

# JWT Configuration
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5500
```

### Paso 4: Instalar Dependencias

```bash
npm install
```

### Paso 5: Inicializar Base de Datos

```bash
npm run init-db
```

Este comando:
- Crea todas las tablas necesarias
- Crea índices para optimizar consultas
- Crea un usuario de prueba (testuser/test123)

### Paso 6: Iniciar el Servidor

```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Medicamentos
- `GET /api/medications` - Obtener medicamentos del usuario
- `POST /api/medications` - Crear medicamento
- `PUT /api/medications/:id` - Actualizar medicamento
- `DELETE /api/medications/:id` - Eliminar medicamento

### Recordatorios
- `GET /api/reminders` - Obtener recordatorios del usuario
- `POST /api/reminders` - Crear recordatorio
- `PUT /api/reminders/:id` - Actualizar recordatorio
- `DELETE /api/reminders/:id` - Eliminar recordatorio

### Metas
- `GET /api/goals` - Obtener metas del usuario
- `POST /api/goals` - Crear meta
- `PUT /api/goals/:id` - Actualizar meta
- `DELETE /api/goals/:id` - Eliminar meta

### Salud
- `GET /api/health` - Verificar estado del servidor

## 🔄 Migración del Frontend

### Opción 1: Usar el Nuevo Script (Recomendado)

Reemplaza `script.js` con `script-postgresql.js`:

```html
<!-- En index.html -->
<script src="script-postgresql.js"></script>
```

### Opción 2: Migración Gradual

Si prefieres mantener compatibilidad con localStorage, puedes:

1. Mantener `script.js` para localStorage
2. Crear `script-hybrid.js` que use API pero mantenga localStorage como fallback
3. Migrar gradualmente las funciones

## 🧪 Testing

### Usuario de Prueba
- **Usuario:** testuser
- **Contraseña:** test123

### Probar la API

```bash
# Verificar salud del servidor
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

## 🔧 Troubleshooting

### Error de Conexión a PostgreSQL
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo systemctl status postgresql

# Verificar configuración en pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

### Error de CORS
- Verificar que `CORS_ORIGIN` en `config.env` coincida con tu frontend
- Para desarrollo local: `http://localhost:5500`

### Error de JWT
- Verificar que `JWT_SECRET` esté configurado
- Usar una cadena segura y única

### Error de Puerto
- Verificar que el puerto 3000 esté disponible
- Cambiar `PORT` en `config.env` si es necesario

## 📊 Ventajas de PostgreSQL vs localStorage

### ✅ Ventajas de PostgreSQL
- **Persistencia real**: Los datos no se pierden al limpiar el navegador
- **Seguridad**: Contraseñas hasheadas, autenticación JWT
- **Escalabilidad**: Múltiples usuarios, backups, replicación
- **Integridad**: Relaciones entre tablas, constraints
- **Consultas avanzadas**: JOINs, agregaciones, filtros complejos
- **Backup y recuperación**: Estrategias profesionales de backup

### ❌ Desventajas de localStorage
- **Limitado al navegador**: Datos perdidos al limpiar caché
- **Sin seguridad**: Contraseñas en texto plano
- **Sin escalabilidad**: Solo un usuario por dispositivo
- **Sin integridad**: Sin relaciones ni constraints
- **Limitaciones de tamaño**: ~5-10MB máximo

## 🚀 Próximos Pasos

1. **Implementar migración de datos**: Script para migrar datos existentes de localStorage
2. **Agregar validaciones**: Validación de datos en el backend
3. **Implementar logging**: Logs de auditoría y debugging
4. **Agregar tests**: Tests unitarios y de integración
5. **Optimizar consultas**: Índices adicionales según uso
6. **Implementar cache**: Redis para mejorar rendimiento
7. **Agregar monitoreo**: Health checks y métricas

## 📝 Notas de Desarrollo

- El backend usa **Express.js** con **PostgreSQL**
- Autenticación con **JWT** y **bcryptjs**
- CORS configurado para desarrollo local
- Rate limiting para prevenir abuso
- Helmet para seguridad HTTP
- Manejo de errores centralizado

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles. 