console.log('🔍 Iniciando test de conexión...');

try {
  const { Pool } = require('pg');
  require('dotenv').config({ path: './config.env' });
  
  console.log('✅ Módulos cargados correctamente');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Puerto: ${process.env.DB_PORT}`);
  console.log(`Base de datos: ${process.env.DB_NAME}`);
  console.log(`Usuario: ${process.env.DB_USER}`);
  
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  
  console.log('🔌 Intentando conectar...');
  
  pool.query('SELECT 1 as test', (err, result) => {
    if (err) {
      console.log('❌ Error de conexión:', err.message);
      console.log('💡 Instala PostgreSQL desde: https://www.postgresql.org/download/windows/');
    } else {
      console.log('✅ Conexión exitosa!');
      console.log('🎉 PostgreSQL está funcionando correctamente');
    }
    pool.end();
  });
  
} catch (error) {
  console.log('❌ Error:', error.message);
} 