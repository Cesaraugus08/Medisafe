const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la base de datos
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5500',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por ventana
});
app.use(limiter);

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rutas de autenticación
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await pool.query(
      'INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, hashedPassword, email]
    );

    // Generar token
    const token = jwt.sign(
      { userId: newUser.rows[0].id, username: newUser.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username,
        email: newUser.rows[0].email
      },
      token
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Buscar usuario
    const user = await pool.query(
      'SELECT id, username, password_hash, email FROM users WHERE username = $1',
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.rows[0].id, username: user.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email
      },
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de medicamentos
app.get('/api/medications', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM medications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo medicamentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Nueva ruta: Obtener medicamento por ID
app.get('/api/medications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM medications WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medicamento no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo medicamento por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/medications', authenticateToken, async (req, res) => {
  try {
    const { name, dose, frequency, time, expiry_date, notes } = req.body;

    if (!name || !dose || !frequency || !time) {
      return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }

    const result = await pool.query(
      'INSERT INTO medications (user_id, name, dose, frequency, time, expiry_date, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.userId, name, dose, frequency, time, expiry_date, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando medicamento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/medications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dose, frequency, time, expiry_date, notes } = req.body;

    const result = await pool.query(
      'UPDATE medications SET name = $1, dose = $2, frequency = $3, time = $4, expiry_date = $5, notes = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 AND user_id = $8 RETURNING *',
      [name, dose, frequency, time, expiry_date, notes, id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medicamento no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando medicamento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/medications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM medications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medicamento no encontrado' });
    }

    res.json({ message: 'Medicamento eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando medicamento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de recordatorios
app.get('/api/reminders', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, m.name as medication_name 
       FROM reminders r 
       JOIN medications m ON r.medication_id = m.id 
       WHERE r.user_id = $1 
       ORDER BY r.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo recordatorios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/reminders', authenticateToken, async (req, res) => {
  try {
    const { medication_id, reminder_time, days_of_week } = req.body;

    if (!medication_id || !reminder_time) {
      return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }

    const result = await pool.query(
      'INSERT INTO reminders (user_id, medication_id, reminder_time, days_of_week) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.userId, medication_id, reminder_time, days_of_week || [1,2,3,4,5,6,7]]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando recordatorio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/reminders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reminder_time, days_of_week, is_active } = req.body;

    const result = await pool.query(
      'UPDATE reminders SET reminder_time = $1, days_of_week = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND user_id = $5 RETURNING *',
      [reminder_time, days_of_week, is_active, id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recordatorio no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando recordatorio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/reminders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM reminders WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recordatorio no encontrado' });
    }

    res.json({ message: 'Recordatorio eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando recordatorio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de metas
app.get('/api/goals', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo metas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/goals', authenticateToken, async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Título es requerido' });
    }

    const result = await pool.query(
      'INSERT INTO goals (user_id, title, description, deadline) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.userId, title, description, deadline]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando meta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, is_completed } = req.body;

    const result = await pool.query(
      'UPDATE goals SET title = $1, description = $2, deadline = $3, is_completed = $4, completed_at = CASE WHEN $4 = true THEN CURRENT_TIMESTAMP ELSE completed_at END, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND user_id = $6 RETURNING *',
      [title, description, deadline, is_completed, id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meta no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando meta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meta no encontrada' });
    }

    res.json({ message: 'Meta eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando meta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MediSafe API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor MediSafe ejecutándose en puerto ${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor...');
  pool.end();
  process.exit(0);
}); 