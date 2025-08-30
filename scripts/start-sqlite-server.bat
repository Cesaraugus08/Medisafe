@echo off
echo ========================================
echo    MediSafe SQLite Server Starter
echo ========================================
echo.

echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo Error: No se pudieron instalar las dependencias
        pause
        exit /b 1
    )
)

echo.
echo Iniciando servidor SQLite...
echo Puerto: 3000
echo Base de datos: medisafe.db
echo.
echo Para detener el servidor, presiona Ctrl+C
echo.

node server-sqlite.js

pause 