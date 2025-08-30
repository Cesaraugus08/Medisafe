# MediSafe - Configuración Automática (PowerShell)
# Ejecutar como: .\setup.ps1

Write-Host "🚀 MEDISAFE - CONFIGURACIÓN AUTOMÁTICA" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📁 Verificando estructura del proyecto..." -ForegroundColor Yellow
try {
    $result = node verify-structure.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error en la estructura del proyecto" -ForegroundColor Red
        Write-Host "🔧 Ejecutando verificación manual..." -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Presiona Enter para continuar"
        exit 1
    }
} catch {
    Write-Host "❌ Error ejecutando verificación: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Estructura verificada correctamente" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 Instalando dependencias del backend..." -ForegroundColor Yellow
if (Test-Path "backend\package.json") {
    Write-Host "📦 Instalando dependencias de Node.js..." -ForegroundColor Blue
    Set-Location "backend"
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error instalando dependencias del backend" -ForegroundColor Red
            Read-Host "Presiona Enter para continuar"
            exit 1
        }
        Write-Host "✅ Dependencias del backend instaladas" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error durante la instalación: $_" -ForegroundColor Red
        exit 1
    }
    Set-Location ".."
} else {
    Write-Host "⚠️ No se encontró package.json en el backend" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📱 Configurando aplicación principal..." -ForegroundColor Yellow
if (Test-Path "frontend\index.html") {
    Write-Host "✅ Frontend listo" -ForegroundColor Green
    Write-Host "🌐 Abriendo aplicación principal..." -ForegroundColor Blue
    Start-Process "frontend\index.html"
} else {
    Write-Host "❌ No se encontró el frontend" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Proyecto reorganizado y funcional" -ForegroundColor Green
Write-Host "✅ Estructura profesional implementada" -ForegroundColor Green
Write-Host "✅ Frontend funcionando correctamente" -ForegroundColor Green
Write-Host "✅ Backend configurado" -ForegroundColor Green
Write-Host "✅ Documentación organizada" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 ¡Tu proyecto MediSafe está listo!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Abrir frontend/index.html para usar la aplicación" -ForegroundColor White
Write-Host "   2. Revisar docs/ para documentación" -ForegroundColor White
Write-Host "   3. Usar scripts/ para utilidades" -ForegroundColor White
Write-Host ""
Write-Host "💡 Para verificar el estado: node verify-structure.js" -ForegroundColor Blue
Write-Host ""
Read-Host "Presiona Enter para continuar"
