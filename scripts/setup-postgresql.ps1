# Script de configuración de PostgreSQL para MediSafe
# Ejecutar como administrador

Write-Host "=== Configuración de PostgreSQL para MediSafe ===" -ForegroundColor Green

# Verificar si PostgreSQL está instalado
Write-Host "Verificando instalación de PostgreSQL..." -ForegroundColor Yellow

try {
    $pgVersion = & psql --version 2>$null
    if ($pgVersion) {
        Write-Host "✅ PostgreSQL ya está instalado" -ForegroundColor Green
        Write-Host $pgVersion -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ PostgreSQL no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para instalar PostgreSQL:" -ForegroundColor Yellow
    Write-Host "1. Ve a https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "2. Descarga el instalador para Windows" -ForegroundColor White
    Write-Host "3. Ejecuta el instalador como administrador" -ForegroundColor White
    Write-Host "4. Usa la contraseña: 'postgres' (o la que prefieras)" -ForegroundColor White
    Write-Host "5. Mantén el puerto por defecto (5432)" -ForegroundColor White
    Write-Host "6. Instala pgAdmin si quieres una interfaz gráfica" -ForegroundColor White
    Write-Host ""
    Write-Host "Después de instalar, ejecuta este script nuevamente." -ForegroundColor Yellow
    exit 1
}

# Verificar si el servicio está ejecutándose
Write-Host "Verificando servicio de PostgreSQL..." -ForegroundColor Yellow
$service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($service) {
    if ($service.Status -eq "Running") {
        Write-Host "✅ Servicio de PostgreSQL está ejecutándose" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Servicio de PostgreSQL no está ejecutándose" -ForegroundColor Yellow
        Write-Host "Iniciando servicio..." -ForegroundColor Yellow
        Start-Service $service.Name
        Write-Host "✅ Servicio iniciado" -ForegroundColor Green
    }
} else {
    Write-Host "❌ No se encontró el servicio de PostgreSQL" -ForegroundColor Red
    Write-Host "Asegúrate de que PostgreSQL esté instalado correctamente" -ForegroundColor Yellow
    exit 1
}

# Verificar conexión
Write-Host "Probando conexión a PostgreSQL..." -ForegroundColor Yellow
try {
    $testConnection = & psql -h localhost -p 5432 -U postgres -d postgres -c "SELECT version();" 2>$null
    if ($testConnection) {
        Write-Host "✅ Conexión exitosa a PostgreSQL" -ForegroundColor Green
    } else {
        Write-Host "❌ No se pudo conectar a PostgreSQL" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al conectar con PostgreSQL" -ForegroundColor Red
    Write-Host "Verifica que el servicio esté ejecutándose y las credenciales sean correctas" -ForegroundColor Yellow
}

# Crear base de datos si no existe
Write-Host "Creando base de datos 'medisafe'..." -ForegroundColor Yellow
try {
    & psql -h localhost -p 5432 -U postgres -d postgres -c "CREATE DATABASE medisafe;" 2>$null
    Write-Host "✅ Base de datos 'medisafe' creada" -ForegroundColor Green
} catch {
    Write-Host "⚠️ La base de datos 'medisafe' ya existe o hubo un error" -ForegroundColor Yellow
}

# Ejecutar script de inicialización
Write-Host "Ejecutando script de inicialización..." -ForegroundColor Yellow
if (Test-Path "init-database.js") {
    Write-Host "Ejecutando init-database.js..." -ForegroundColor Yellow
    & node init-database.js
} else {
    Write-Host "❌ No se encontró init-database.js" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Configuración completada ===" -ForegroundColor Green
Write-Host "Ahora puedes ejecutar el servidor con: npm start" -ForegroundColor Cyan 