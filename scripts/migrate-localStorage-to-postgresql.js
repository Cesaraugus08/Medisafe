const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Función para simular localStorage en Node.js
function getLocalStorageData() {
  console.log('📋 Datos de localStorage a migrar:');
  
  // Simular datos de localStorage (el usuario debe proporcionar estos datos)
  const mockData = {
    users: [
      {
        username: 'usuario1',
        password: 'password123',
        email: 'usuario1@example.com'
      },
      {
        username: 'usuario2', 
        password: 'password456',
        email: 'usuario2@example.com'
      }
    ],
    medications: [
      {
        name: 'Paracetamol',
        dose: '500mg',
        frequency: 'Cada 6 horas',
        time: '08:00',
        expiry_date: '2024-12-31',
        notes: 'Para dolor de cabeza'
      },
      {
        name: 'Ibuprofeno',
        dose: '400mg',
        frequency: 'Cada 8 horas',
        time: '12:00',
        expiry_date: '2024-11-30',
        notes: 'Para inflamación'
      }
    ],
    reminders: [
      {
        medication_name: 'Paracetamol',
        reminder_time: '08:00',
        days_of_week: [1, 2, 3, 4, 5, 6, 7]
      }
    ],
    goals: [
      {
        title: 'Tomar medicamentos a tiempo',
        description: 'Mantener un horario consistente',
        deadline: '2024-12-31',
        is_completed: false
      }
    ]
  };
  
  return mockData;
}

async function migrateData() {
  try {
    console.log('🚀 Iniciando migración de localStorage a PostgreSQL...');
    
    const localStorageData = getLocalStorageData();
    
    // Migrar usuarios
    console.log('\n👥 Migrando usuarios...');
    const userIds = {};
    
    for (const user of localStorageData.users) {
      try {
        // Verificar si el usuario ya existe
        const existingUser = await pool.query(
          'SELECT id FROM users WHERE username = $1',
          [user.username]
        );
        
        if (existingUser.rows.length > 0) {
          console.log(`⚠️  Usuario ${user.username} ya existe, saltando...`);
          userIds[user.username] = existingUser.rows[0].id;
          continue;
        }
        
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Crear usuario
        const newUser = await pool.query(
          'INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING id',
          [user.username, hashedPassword, user.email]
        );
        
        userIds[user.username] = newUser.rows[0].id;
        console.log(`✅ Usuario ${user.username} migrado (ID: ${newUser.rows[0].id})`);
        
      } catch (error) {
        console.error(`❌ Error migrando usuario ${user.username}:`, error.message);
      }
    }
    
    // Usar el primer usuario como usuario principal para medicamentos
    const primaryUserId = Object.values(userIds)[0];
    
    // Migrar medicamentos
    console.log('\n💊 Migrando medicamentos...');
    const medicationIds = {};
    
    for (const med of localStorageData.medications) {
      try {
        const newMed = await pool.query(
          'INSERT INTO medications (user_id, name, dose, frequency, time, expiry_date, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          [primaryUserId, med.name, med.dose, med.frequency, med.time, med.expiry_date, med.notes]
        );
        
        medicationIds[med.name] = newMed.rows[0].id;
        console.log(`✅ Medicamento ${med.name} migrado (ID: ${newMed.rows[0].id})`);
        
      } catch (error) {
        console.error(`❌ Error migrando medicamento ${med.name}:`, error.message);
      }
    }
    
    // Migrar recordatorios
    console.log('\n⏰ Migrando recordatorios...');
    
    for (const reminder of localStorageData.reminders) {
      try {
        const medicationId = medicationIds[reminder.medication_name];
        
        if (!medicationId) {
          console.log(`⚠️  Medicamento ${reminder.medication_name} no encontrado, saltando recordatorio...`);
          continue;
        }
        
        const newReminder = await pool.query(
          'INSERT INTO reminders (user_id, medication_id, reminder_time, days_of_week) VALUES ($1, $2, $3, $4) RETURNING id',
          [primaryUserId, medicationId, reminder.reminder_time, reminder.days_of_week]
        );
        
        console.log(`✅ Recordatorio para ${reminder.medication_name} migrado (ID: ${newReminder.rows[0].id})`);
        
      } catch (error) {
        console.error(`❌ Error migrando recordatorio para ${reminder.medication_name}:`, error.message);
      }
    }
    
    // Migrar metas
    console.log('\n🎯 Migrando metas...');
    
    for (const goal of localStorageData.goals) {
      try {
        const newGoal = await pool.query(
          'INSERT INTO goals (user_id, title, description, deadline, is_completed) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [primaryUserId, goal.title, goal.description, goal.deadline, goal.is_completed]
        );
        
        console.log(`✅ Meta "${goal.title}" migrada (ID: ${newGoal.rows[0].id})`);
        
      } catch (error) {
        console.error(`❌ Error migrando meta "${goal.title}":`, error.message);
      }
    }
    
    console.log('\n🎉 Migración completada exitosamente!');
    console.log('\n📊 Resumen de migración:');
    console.log(`   - Usuarios migrados: ${Object.keys(userIds).length}`);
    console.log(`   - Medicamentos migrados: ${Object.keys(medicationIds).length}`);
    console.log(`   - Recordatorios migrados: ${localStorageData.reminders.length}`);
    console.log(`   - Metas migradas: ${localStorageData.goals.length}`);
    
    console.log('\n🔑 Credenciales de acceso:');
    console.log(`   Usuario: ${localStorageData.users[0].username}`);
    console.log(`   Contraseña: ${localStorageData.users[0].password}`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await pool.end();
  }
}

// Función para migrar datos reales de localStorage
async function migrateRealLocalStorageData(localStorageData) {
  try {
    console.log('🚀 Migrando datos reales de localStorage...');
    
    if (!localStorageData.users || localStorageData.users.length === 0) {
      console.log('⚠️  No hay usuarios para migrar');
      return;
    }
    
    // Usar el primer usuario como usuario principal
    const primaryUser = localStorageData.users[0];
    
    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [primaryUser.username]
    );
    
    let userId;
    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
      console.log(`✅ Usuario ${primaryUser.username} ya existe (ID: ${userId})`);
    } else {
      // Crear usuario (sin contraseña hasheada ya que viene de localStorage)
      const hashedPassword = await bcrypt.hash(primaryUser.password || 'default123', 10);
      
      const newUser = await pool.query(
        'INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING id',
        [primaryUser.username, hashedPassword, primaryUser.email || null]
      );
      
      userId = newUser.rows[0].id;
      console.log(`✅ Usuario ${primaryUser.username} creado (ID: ${userId})`);
    }
    
    // Migrar medicamentos
    if (localStorageData.medications && localStorageData.medications.length > 0) {
      console.log(`\n💊 Migrando ${localStorageData.medications.length} medicamentos...`);
      
      for (const med of localStorageData.medications) {
        try {
          const newMed = await pool.query(
            'INSERT INTO medications (user_id, name, dose, frequency, time, expiry_date, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [userId, med.name, med.dose, med.freq || med.frequency, med.time, med.expiry || med.expiry_date, med.notes]
          );
          
          console.log(`✅ Medicamento ${med.name} migrado (ID: ${newMed.rows[0].id})`);
          
        } catch (error) {
          console.error(`❌ Error migrando medicamento ${med.name}:`, error.message);
        }
      }
    }
    
    // Migrar metas
    if (localStorageData.goals && localStorageData.goals.length > 0) {
      console.log(`\n🎯 Migrando ${localStorageData.goals.length} metas...`);
      
      for (const goal of localStorageData.goals) {
        try {
          const newGoal = await pool.query(
            'INSERT INTO goals (user_id, title, description, deadline, is_completed) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [userId, goal.title, goal.description, goal.deadline, goal.is_completed || false]
          );
          
          console.log(`✅ Meta "${goal.title}" migrada (ID: ${newGoal.rows[0].id})`);
          
        } catch (error) {
          console.error(`❌ Error migrando meta "${goal.title}":`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Migración de datos reales completada!');
    console.log(`\n🔑 Credenciales de acceso:`);
    console.log(`   Usuario: ${primaryUser.username}`);
    console.log(`   Contraseña: ${primaryUser.password || 'default123'}`);
    
  } catch (error) {
    console.error('❌ Error durante la migración de datos reales:', error);
  } finally {
    await pool.end();
  }
}

// Función principal
async function main() {
  console.log('🔄 Herramienta de Migración localStorage → PostgreSQL');
  console.log('==================================================');
  
  const args = process.argv.slice(2);
  
  if (args.includes('--real-data')) {
    // Para migrar datos reales, el usuario debe proporcionar los datos
    console.log('\n📝 Para migrar datos reales de localStorage, proporciona los datos en formato JSON:');
    console.log('Ejemplo de formato esperado:');
    console.log(JSON.stringify({
      users: [{ username: 'usuario1', password: 'pass123', email: 'user@example.com' }],
      medications: [{ name: 'Medicamento', dose: '1', frequency: 'Diario', time: '08:00', expiry_date: '2024-12-31', notes: 'Notas' }],
      goals: [{ title: 'Meta', description: 'Descripción', deadline: '2024-12-31', is_completed: false }]
    }, null, 2));
    
    console.log('\n💡 Para usar datos de ejemplo, ejecuta sin --real-data');
    return;
  }
  
  // Migrar datos de ejemplo
  await migrateData();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { migrateData, migrateRealLocalStorageData }; 