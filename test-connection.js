const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

console.log('🔍 === Test de Conexión PostgreSQL ===');
console.log('');

// Verificar variables de entorno
console.log('📋 Verificando configuración:');
console.log(`   Host: ${process.env.DB_HOST || 'No configurado'}`);
console.log(`   Puerto: ${process.env.DB_PORT || 'No configurado'}`);
console.log(`   Base de datos: ${process.env.DB_NAME || 'No configurado'}`);
console.log(`   Usuario: ${process.env.DB_USER || 'No configurado'}`);
console.log(`   Contraseña: ${process.env.DB_PASSWORD ? 'Configurada' : 'No configurada'}`);
console.log('');

// Intentar conexión
async function testConnection() {
  try {
    console.log('🔌 Intentando conectar a PostgreSQL...');
    
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // Test de conexión
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    // Test de consulta
    const result = await client.query('SELECT version()');
    console.log('✅ Consulta de prueba exitosa');
    console.log(`   Versión: ${result.rows[0].version.split(' ')[0]}`);
    
    // Verificar tablas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas encontradas:');
    if (tablesResult.rows.length === 0) {
      console.log('   ⚠️ No hay tablas. Ejecuta: node init-database.js');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
      });
    }
    
    client.release();
    await pool.end();
    
    console.log('');
    console.log('🎉 Todo está configurado correctamente!');
    console.log('💡 Puedes ejecutar: npm start');
    
  } catch (error) {
    console.log('❌ Error de conexión:');
    console.log(`   ${error.message}`);
    console.log('');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🔧 Soluciones:');
      console.log('   1. Instala PostgreSQL desde: https://www.postgresql.org/download/windows/');
      console.log('   2. Asegúrate de que el servicio esté ejecutándose');
      console.log('   3. Verifica que el puerto 5432 esté disponible');
    } else if (error.code === '28P01') {
      console.log('🔧 Soluciones:');
      console.log('   1. Verifica la contraseña en config.env');
      console.log('   2. Usa la contraseña que configuraste durante la instalación');
    } else if (error.code === '3D000') {
      console.log('🔧 Soluciones:');
      console.log('   1. Ejecuta: node init-database.js');
      console.log('   2. O crea la base de datos manualmente');
    }
    
    console.log('');
    console.log('📖 Para más ayuda, consulta: INSTALACION-POSTGRESQL.md');
  }
}

testConnection(); 