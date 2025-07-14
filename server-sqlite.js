const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de SQLite
const dbPath = path.join(__dirname, 'medisafe.db');
const db = new sqlite3.Database(dbPath);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5500',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Endpoint de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: 'SQLite',
    timestamp: new Date().toISOString(),
    message: 'Servidor SQLite funcionando correctamente'
  });
});

// Inicializar base de datos SQLite
function initSQLiteDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabla de usuarios
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabla de medicamentos
      db.run(`
        CREATE TABLE IF NOT EXISTS medications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          name TEXT NOT NULL,
          dose TEXT NOT NULL,
          frequency TEXT NOT NULL,
          time TEXT NOT NULL,
          expiry_date TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Tabla de recordatorios
      db.run(`
        CREATE TABLE IF NOT EXISTS reminders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          title TEXT NOT NULL,
          description TEXT,
          date TEXT NOT NULL,
          reminder_time TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Tabla de metas
      db.run(`
        CREATE TABLE IF NOT EXISTS goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          title TEXT NOT NULL,
          description TEXT,
          deadline TEXT,
          priority TEXT DEFAULT 'media',
          is_completed BOOLEAN DEFAULT 0,
          completed_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Crear usuario de prueba
      db.get('SELECT id FROM users WHERE username = ?', ['testuser'], (err, row) => {
        if (!row) {
          bcrypt.hash('test123', 10).then(hash => {
            db.run(
              'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
              ['testuser', hash, 'test@medisafe.com']
            );
            console.log('✅ Usuario de prueba creado (testuser/test123)');
          });
        }
      });

      console.log('✅ Base de datos SQLite inicializada');
      resolve();
    });
  });
}

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
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
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (row) {
        return res.status(400).json({ error: 'El usuario ya existe' });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      db.run(
        'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
        [username, hashedPassword, email],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error interno del servidor' });
          }

          // Generar token
          const token = jwt.sign(
            { userId: this.lastID, username },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '24h' }
          );

          res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: { id: this.lastID, username, email },
            token
          });
        }
      );
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
    db.get(
      'SELECT id, username, password_hash, email FROM users WHERE username = ?',
      [username],
      async (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!row) {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, row.password_hash);
        if (!validPassword) {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token
        const token = jwt.sign(
          { userId: row.id, username: row.username },
          process.env.JWT_SECRET || 'default_secret',
          { expiresIn: '24h' }
        );

        res.json({
          message: 'Login exitoso',
          user: {
            id: row.id,
            username: row.username,
            email: row.email
          },
          token
        });
      }
    );

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para verificar token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  // Buscar información del usuario
  db.get(
    'SELECT id, username, email FROM users WHERE id = ?',
    [req.user.userId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        message: 'Token válido',
        user: {
          id: row.id,
          username: row.username,
          email: row.email
        }
      });
    }
  );
});

// Rutas de medicamentos
app.get('/api/medications', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM medications WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.json(rows);
    }
  );
});

app.post('/api/medications', authenticateToken, (req, res) => {
  const { name, dose, frequency, time, expiry_date, notes } = req.body;

  if (!name || !dose || !frequency || !time) {
    return res.status(400).json({ error: 'Campos requeridos faltantes' });
  }

  db.run(
    'INSERT INTO medications (user_id, name, dose, frequency, time, expiry_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user.userId, name, dose, frequency, time, expiry_date, notes],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      // Obtener el medicamento creado
      db.get('SELECT * FROM medications WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put('/api/medications/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, dose, frequency, time, expiry_date, notes } = req.body;

  if (!name || !dose || !frequency || !time) {
    return res.status(400).json({ error: 'Campos requeridos faltantes' });
  }

  db.run(
    'UPDATE medications SET name = ?, dose = ?, frequency = ?, time = ?, expiry_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [name, dose, frequency, time, expiry_date, notes, id, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Medicamento no encontrado' });
      }

      // Obtener el medicamento actualizado
      db.get('SELECT * FROM medications WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(row);
      });
    }
  );
});

app.delete('/api/medications/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM medications WHERE id = ? AND user_id = ?',
    [id, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Medicamento no encontrado' });
      }

      res.json({ message: 'Medicamento eliminado exitosamente' });
    }
  );
});

// Rutas de recordatorios
app.get('/api/reminders', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM reminders WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.json(rows);
    }
  );
});

app.post('/api/reminders', authenticateToken, (req, res) => {
  const { title, description, date, reminder_time } = req.body;

  if (!title || !description || !date || !reminder_time) {
    return res.status(400).json({ error: 'Campos requeridos faltantes' });
  }

  db.run(
    'INSERT INTO reminders (user_id, title, description, reminder_time, date) VALUES (?, ?, ?, ?, ?)',
    [req.user.userId, title, description, reminder_time, date],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      // Obtener el recordatorio creado
      db.get('SELECT * FROM reminders WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.status(201).json(row);
      });
    }
  );
});

// Rutas de metas
app.get('/api/goals', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.json(rows);
    }
  );
});

app.post('/api/goals', authenticateToken, (req, res) => {
  const { title, description, target_date, priority } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Título es requerido' });
  }

  db.run(
    'INSERT INTO goals (user_id, title, description, deadline, priority) VALUES (?, ?, ?, ?, ?)',
    [req.user.userId, title, description, target_date, priority],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      // Obtener la meta creada
      db.get('SELECT * FROM goals WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put('/api/goals/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, deadline, is_completed } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Título es requerido' });
  }

  const completedAt = is_completed ? 'CURRENT_TIMESTAMP' : 'NULL';

  db.run(
    'UPDATE goals SET title = ?, description = ?, deadline = ?, is_completed = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [title, description, deadline, is_completed ? 1 : 0, completedAt, id, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Meta no encontrada' });
      }

      // Obtener la meta actualizada
      db.get('SELECT * FROM goals WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(row);
      });
    }
  );
});

app.delete('/api/goals/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM goals WHERE id = ? AND user_id = ?',
    [id, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Meta no encontrada' });
      }

      res.json({ message: 'Meta eliminada exitosamente' });
    }
  );
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Inicializar base de datos y iniciar servidor
initSQLiteDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor SQLite ejecutándose en puerto ${PORT}`);
    console.log(`📊 Base de datos: ${dbPath}`);
    console.log(`🔗 API disponible en: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`👤 Usuario de prueba: testuser / test123`);
  });
}).catch(err => {
  console.error('❌ Error inicializando base de datos:', err);
  process.exit(1);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor SQLite...');
  db.close((err) => {
    if (err) {
      console.error('❌ Error cerrando base de datos:', err);
    } else {
      console.log('✅ Base de datos cerrada correctamente');
    }
    process.exit(0);
  });
}); 