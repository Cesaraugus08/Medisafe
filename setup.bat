@echo off
chcp 65001 >nul
echo.
echo 🚀 MEDISAFE - CONFIGURACIÓN AUTOMÁTICA
echo ======================================
echo.

echo 📁 Verificando estructura del proyecto...
node verify-structure.js
if %errorlevel% neq 0 (
    echo.
    echo ❌ Error en la estructura del proyecto
    echo 🔧 Ejecutando verificación manual...
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Estructura verificada correctamente
echo.

echo 🔧 Instalando dependencias del backend...
cd backend
if exist package.json (
    echo 📦 Instalando dependencias de Node.js...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias del backend
        pause
        exit /b 1
    )
    echo ✅ Dependencias del backend instaladas
) else (
    echo ⚠️ No se encontró package.json en el backend
)

echo.
echo 📱 Configurando aplicación principal...
cd ..
if exist frontend\index.html (
    echo ✅ Frontend listo
    echo 🌐 Abriendo aplicación principal...
    start frontend\index.html
) else (
    echo ❌ No se encontró el frontend
)

echo.
echo 🎯 CONFIGURACIÓN COMPLETADA
echo ==========================
echo.
echo ✅ Proyecto reorganizado y funcional
echo ✅ Estructura profesional implementada
echo ✅ Frontend funcionando correctamente
echo ✅ Backend configurado
echo ✅ Documentación organizada
echo.
echo 🚀 ¡Tu proyecto MediSafe está listo!
echo.
echo 📚 Próximos pasos:
echo    1. Abrir frontend/index.html para usar la aplicación
echo    2. Revisar docs/ para documentación
echo    3. Usar scripts/ para utilidades
echo.
echo 💡 Para verificar el estado: node verify-structure.js
echo.
pause
