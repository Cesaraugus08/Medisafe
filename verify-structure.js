#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando estructura del proyecto MediSafe...\n');

// Archivos y carpetas que deben existir
const requiredStructure = {
    'frontend/': [
        'index.html',
        'style.css', 
        'script.js',
        'emailjs-config.js',
        'config.js'
    ],
    'backend/': [
        'src/',
        'src/config/',
        'src/controllers/',
        'src/routes/',
        'src/middleware/',
        'src/db/',
        'package.json',
        'config.env.example'
    ],
    'mobile/': [
        'README.md'
    ],
    'docs/': [
        'README.md',
        'README-PostgreSQL.md',
        'README-SQLite.md',
        'EMAILJS_SETUP.md',
        'INSTALACION-POSTGRESQL.md'
    ],
    'scripts/': [
        'README.md',
        'server.js',
        'server-sqlite.js',
        'init-database.js'
    ],
    '': [
        'README.md',
        'package.json',
        '.gitignore',
        'index.html'
    ]
};

let allGood = true;
let totalFiles = 0;
let existingFiles = 0;

// Verificar cada carpeta y archivo
Object.entries(requiredStructure).forEach(([folder, files]) => {
    const folderPath = folder === '' ? '.' : folder;
    
    if (!fs.existsSync(folderPath)) {
        console.log(`❌ Carpeta no encontrada: ${folderPath}`);
        allGood = false;
        return;
    }
    
    files.forEach(file => {
        totalFiles++;
        const filePath = path.join(folderPath, file);
        
        if (fs.existsSync(filePath)) {
            existingFiles++;
            console.log(`✅ ${filePath}`);
        } else {
            console.log(`❌ ${filePath} - NO ENCONTRADO`);
            allGood = false;
        }
    });
    
    console.log(''); // Línea en blanco entre carpetas
});

// Resumen
console.log('📊 RESUMEN DE VERIFICACIÓN:');
console.log(`📁 Total de archivos verificados: ${totalFiles}`);
console.log(`✅ Archivos encontrados: ${existingFiles}`);
console.log(`❌ Archivos faltantes: ${totalFiles - existingFiles}`);

if (allGood) {
    console.log('\n🎉 ¡ESTRUCTURA DEL PROYECTO VERIFICADA CORRECTAMENTE!');
    console.log('🚀 El proyecto está listo para usar.');
} else {
    console.log('\n⚠️ Se encontraron problemas en la estructura.');
    console.log('🔧 Revisa los archivos marcados con ❌ arriba.');
}

// Verificar que el frontend funcione
console.log('\n🔧 Verificando funcionalidad del frontend...');
try {
    const frontendIndex = fs.readFileSync('frontend/index.html', 'utf8');
    
    // Verificar referencias a archivos CSS y JS
    const hasStyleCSS = frontendIndex.includes('style.css');
    const hasScriptJS = frontendIndex.includes('script.js');
    const hasEmailJS = frontendIndex.includes('emailjs-config.js');
    
    console.log(`✅ Referencia a style.css: ${hasStyleCSS ? 'SÍ' : 'NO'}`);
    console.log(`✅ Referencia a script.js: ${hasScriptJS ? 'SÍ' : 'NO'}`);
    console.log(`✅ Referencia a emailjs-config.js: ${hasEmailJS ? 'SÍ' : 'NO'}`);
    
    if (hasStyleCSS && hasScriptJS && hasEmailJS) {
        console.log('🎉 Frontend configurado correctamente');
    } else {
        console.log('⚠️ Problemas en la configuración del frontend');
        allGood = false;
    }
    
} catch (error) {
    console.log(`❌ Error leyendo frontend/index.html: ${error.message}`);
    allGood = false;
}

// Estado final
console.log(`\n🏁 ESTADO FINAL: ${allGood ? '✅ EXITOSO' : '❌ CON PROBLEMAS'}`);

// Código de salida para scripts
process.exit(allGood ? 0 : 1);
