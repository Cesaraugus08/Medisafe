# Scripts de Utilidad

## 📜 Scripts Disponibles

Esta carpeta contiene scripts útiles para el desarrollo y mantenimiento del proyecto MediSafe.

## 🔧 Scripts de Base de Datos

### `init-database.js`
Inicializa la base de datos SQLite con las tablas necesarias.

```bash
node init-database.js
```

### `migrate-localStorage-to-postgresql.js`
Migra datos desde localStorage a PostgreSQL.

```bash
node migrate-localStorage-to-postgresql.js
```

### `script-sqlite.js` / `script-postgresql.js`
Scripts de prueba para diferentes bases de datos.

## 🚀 Scripts de Servidor

### `server.js` / `server-sqlite.js`
Servidores de desarrollo con diferentes configuraciones de base de datos.

### `start-sqlite-server.bat`
Script de Windows para iniciar el servidor SQLite.

## 🧪 Scripts de Prueba

### `test-*.js`
Scripts para probar diferentes funcionalidades de la API.

### `debug-reminder.js`
Script para depurar el sistema de recordatorios.

## 📊 Scripts de Mantenimiento

### `clean-users.js`
Limpia usuarios de prueba de la base de datos.

### `simple-test.js`
Pruebas básicas de conectividad.

## ⚠️ Notas Importantes

- Ejecuta los scripts desde el directorio raíz del proyecto
- Asegúrate de tener las dependencias instaladas
- Revisa la configuración antes de ejecutar scripts de migración
- Los scripts de prueba pueden modificar datos en la base de datos
