# Instalación de PostgreSQL en Windows para MediSafe

## Paso 1: Descargar PostgreSQL

1. Ve a la página oficial de PostgreSQL: https://www.postgresql.org/download/windows/
2. Haz clic en "Download the installer"
3. Selecciona la versión más reciente (actualmente 15.x o 16.x)
4. Descarga el instalador para Windows x86-64

## Paso 2: Instalar PostgreSQL

1. **Ejecuta el instalador como Administrador**
   - Haz clic derecho en el archivo descargado
   - Selecciona "Ejecutar como administrador"

2. **Configuración del instalador:**
   - **Directorio de instalación:** Mantén el predeterminado (`C:\Program Files\PostgreSQL\15\`)
   - **Contraseña del usuario postgres:** Usa `postgres` (o la que prefieras, pero recuerda actualizar config.env)
   - **Puerto:** Mantén 5432 (predeterminado)
   - **Locale:** Mantén el predeterminado
   - **Stack Builder:** Puedes desmarcarlo si no lo necesitas

3. **Componentes a instalar:**
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (interfaz gráfica)
   - ✅ Command Line Tools
   - ✅ Stack Builder (opcional)

## Paso 3: Verificar la instalación

1. Abre PowerShell como Administrador
2. Navega a tu proyecto: `cd C:\MediSafe`
3. Ejecuta el script de configuración:
   ```powershell
   .\setup-postgresql.ps1
   ```

## Paso 4: Configurar la aplicación

1. **Actualiza config.env** con tu contraseña:
   ```env
   DB_PASSWORD=postgres
   ```

2. **Inicializa la base de datos:**
   ```powershell
   node init-database.js
   ```

3. **Migra datos de localStorage (opcional):**
   ```powershell
   node migrate-localStorage-to-postgresql.js
   ```

## Paso 5: Ejecutar la aplicación

1. **Inicia el servidor:**
   ```powershell
   npm start
   ```

2. **Abre la aplicación:**
   - Ve a `http://localhost:3000` para el API
   - Abre `index.html` en tu navegador

## Solución de problemas

### Error: "pg_isready no se reconoce"
- PostgreSQL no está instalado o no está en el PATH
- Reinstala PostgreSQL y asegúrate de marcar "Command Line Tools"

### Error: "Connection refused"
- El servicio de PostgreSQL no está ejecutándose
- Abre Servicios de Windows y inicia "postgresql-x64-15"

### Error: "Authentication failed"
- Verifica la contraseña en config.env
- Usa la contraseña que configuraste durante la instalación

### Error: "Database does not exist"
- Ejecuta: `node init-database.js`
- O crea manualmente: `createdb -U postgres medisafe`

## Verificación final

Para verificar que todo funciona:

1. **Prueba la conexión:**
   ```powershell
   psql -h localhost -U postgres -d medisafe -c "SELECT version();"
   ```

2. **Ejecuta el servidor:**
   ```powershell
   npm start
   ```

3. **Prueba el API:**
   - Abre `test-postgresql-setup.html` en tu navegador
   - Verifica que las operaciones CRUD funcionen

## Comandos útiles

```powershell
# Verificar si PostgreSQL está ejecutándose
Get-Service postgresql*

# Iniciar servicio manualmente
Start-Service postgresql-x64-15

# Conectar a la base de datos
psql -h localhost -U postgres -d medisafe

# Ver tablas
\dt

# Salir de psql
\q
```

## pgAdmin (Interfaz gráfica)

Si instalaste pgAdmin, puedes:

1. Abrir pgAdmin desde el menú de inicio
2. Conectar al servidor localhost
3. Usar la contraseña que configuraste
4. Navegar a la base de datos "medisafe"
5. Ver y editar datos directamente

---

**Nota:** Si tienes problemas, asegúrate de:
- Ejecutar PowerShell como Administrador
- Tener Node.js instalado
- Tener todas las dependencias instaladas (`npm install`)
- Que el firewall no bloquee el puerto 5432 