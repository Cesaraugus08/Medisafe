const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function initDatabase() {
  try {
    console.log('🔧 Inicializando base de datos PostgreSQL...');

    // Crear tabla de usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla users creada');

    // Crear tabla de medicamentos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        dose VARCHAR(100) NOT NULL,
        frequency VARCHAR(100) NOT NULL,
        time TIME NOT NULL,
        expiry_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla medications creada');

    // Crear tabla de recordatorios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        medication_id INTEGER REFERENCES medications(id) ON DELETE CASCADE,
        reminder_time TIME NOT NULL,
        days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}',
        is_active BOOLEAN DEFAULT true,
        last_taken TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla reminders creada');

    // Crear tabla de metas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        deadline DATE,
        is_completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla goals creada');

    // Crear índices para mejorar rendimiento
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
      CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
      CREATE INDEX IF NOT EXISTS idx_reminders_medication_id ON reminders(medication_id);
      CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
      CREATE INDEX IF NOT EXISTS idx_goals_deadline ON goals(deadline);
    `);
    console.log('✅ Índices creados');

    // Crear usuario de prueba si no existe
    const testUserResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      ['testuser']
    );

    if (testUserResult.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('test123', 10);
      
      await pool.query(
        'INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3)',
        ['testuser', hashedPassword, 'test@medisafe.com']
      );
      console.log('✅ Usuario de prueba creado (testuser/test123)');
    }

    console.log('🎉 Base de datos inicializada correctamente');
    console.log('📋 Tablas creadas:');
    console.log('   - users');
    console.log('   - medications');
    console.log('   - reminders');
    console.log('   - goals');

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase(); 