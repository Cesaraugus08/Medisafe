# MediSafe - Conexión SQLite Definitiva

Este documento explica cómo establecer la conexión definitiva entre la aplicación MediSafe y la base de datos SQLite.

## 🚀 Inicio Rápido

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Iniciar Servidor SQLite
```bash
node server-sqlite.js
```

O usar el script de Windows:
```bash
start-sqlite-server.bat
```

### 3. Probar Conexión
Abrir `test-sqlite-connection.html` en el navegador para verificar la conexión.

## 📁 Archivos Principales

### Backend (Servidor)
- `server-sqlite.js` - Servidor Express con SQLite
- `config.env` - Configuración del entorno
- `medisafe.db` - Base de datos SQLite (se crea automáticamente)

### Frontend (Cliente)
- `script-sqlite.js` - Cliente JavaScript para conectar con SQLite
- `test-sqlite-connection.html` - Página de prueba de conexión

## 🔧 Configuración

### Variables de Entorno
Crear archivo `config.env`:
```env
PORT=3000
JWT_SECRET=tu_secreto_jwt_aqui
CORS_ORIGIN=http://localhost:5500
```

### Base de Datos
La base de datos SQLite se crea automáticamente en `medisafe.db` con las siguientes tablas:

#### Tabla: users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: medications
```sql
CREATE TABLE medications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT NOT NULL,
  dose TEXT NOT NULL,
  frequency TEXT NOT NULL,
  time TEXT NOT NULL,
  expiry_date TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

#### Tabla: reminders
```sql
CREATE TABLE reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  medication_id INTEGER,
  reminder_time TEXT NOT NULL,
  days_of_week TEXT DEFAULT '[1,2,3,4,5,6,7]',
  is_active BOOLEAN DEFAULT 1,
  last_taken DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (medication_id) REFERENCES medications (id) ON DELETE CASCADE
);
```

#### Tabla: goals
```sql
CREATE TABLE goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  deadline TEXT,
  is_completed BOOLEAN DEFAULT 0,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Medicamentos
- `GET /api/medications` - Obtener medicamentos
- `POST /api/medications` - Crear medicamento
- `PUT /api/medications/:id` - Actualizar medicamento
- `DELETE /api/medications/:id` - Eliminar medicamento

### Recordatorios
- `GET /api/reminders` - Obtener recordatorios
- `POST /api/reminders` - Crear recordatorio

### Metas
- `GET /api/goals` - Obtener metas
- `POST /api/goals` - Crear meta
- `PUT /api/goals/:id` - Actualizar meta
- `DELETE /api/goals/:id` - Eliminar meta

### Health Check
- `GET /api/health` - Verificar estado del servidor

## 👤 Usuario de Prueba

El servidor crea automáticamente un usuario de prueba:
- **Usuario:** `testuser`
- **Contraseña:** `test123`

## 🔍 Verificación de Conexión

### 1. Iniciar Servidor
```bash
node server-sqlite.js
```

Deberías ver:
```
🚀 Servidor SQLite ejecutándose en puerto 3000
📊 Base de datos: C:\MediSafe\medisafe.db
🔗 API disponible en: http://localhost:3000
🏥 Health check: http://localhost:3000/api/health
👤 Usuario de prueba: testuser / test123
```

### 2. Probar Health Check
```bash
curl http://localhost:3000/api/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "database": "SQLite",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "message": "Servidor SQLite funcionando correctamente"
}
```

### 3. Probar Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

## 🧪 Testing

### Archivo de Prueba
Abrir `test-sqlite-connection.html` en el navegador para:

1. **Verificar conexión** - Probar si el servidor está disponible
2. **Health check** - Verificar estado del servidor
3. **Test autenticación** - Probar login con usuario de prueba
4. **Test medicamentos** - Probar CRUD de medicamentos

### Funciones de Prueba
- ✅ Conexión al servidor
- ✅ Health check
- ✅ Autenticación JWT
- ✅ CRUD de medicamentos
- ✅ CRUD de recordatorios
- ✅ CRUD de metas

## 🔄 Migración desde localStorage

El script `script-sqlite.js` incluye una función para migrar datos desde localStorage:

```javascript
// Migrar datos existentes
await medisafe.migrateFromLocalStorage();
```

## 🛠️ Solución de Problemas

### Error: "Cannot find module 'sqlite3'"
```bash
npm install sqlite3
```

### Error: "Port 3000 is already in use"
Cambiar puerto en `config.env`:
```env
PORT=3001
```

### Error: "CORS policy"
Verificar `CORS_ORIGIN` en `config.env`:
```env
CORS_ORIGIN=http://localhost:5500
```

### Error: "Database is locked"
- Cerrar otras instancias del servidor
- Verificar permisos de escritura en el directorio

## 📊 Monitoreo

### Logs del Servidor
El servidor muestra logs detallados:
- ✅ Conexiones exitosas
- ❌ Errores de conexión
- 🔐 Intentos de autenticación
- 📋 Operaciones CRUD

### Base de Datos
- Archivo: `medisafe.db`
- Tamaño: Se expande automáticamente
- Backup: Copiar `medisafe.db` para respaldo

## 🔒 Seguridad

### JWT
- Tokens expiran en 24 horas
- Secret configurable en `config.env`
- Renovación automática en el cliente

### CORS
- Configurado para desarrollo local
- Ajustar `CORS_ORIGIN` para producción

### Rate Limiting
- 100 requests por 15 minutos
- Protección contra spam

## 🚀 Producción

### Variables de Entorno
```env
PORT=3000
JWT_SECRET=secreto_muy_seguro_aqui
CORS_ORIGIN=https://tudominio.com
NODE_ENV=production
```

### Proceso PM2
```bash
npm install -g pm2
pm2 start server-sqlite.js --name medisafe-sqlite
pm2 save
pm2 startup
```

## 📝 Notas Importantes

1. **SQLite es perfecto para desarrollo** y aplicaciones pequeñas
2. **No requiere instalación** de servidor de base de datos
3. **Base de datos en archivo único** - fácil de respaldar
4. **Transacciones ACID** garantizadas
5. **Concurrencia limitada** - máximo 1 escritura simultánea

## ✅ Estado de Conexión

La conexión está **DEFINITIVAMENTE ESTABLECIDA** cuando:

1. ✅ Servidor ejecutándose en puerto 3000
2. ✅ Base de datos SQLite creada
3. ✅ Health check responde correctamente
4. ✅ Login funciona con usuario de prueba
5. ✅ CRUD de medicamentos funciona
6. ✅ Frontend puede conectarse y autenticarse

¡La conexión SQLite está lista para usar! 🎉 