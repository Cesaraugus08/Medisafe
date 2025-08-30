const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('../config/database');

class AuthController {
  async register(req, res) {
    try {
      const { username, password, email } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await database.get(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );

      if (existingUser) {
        return res.status(400).json({
          error: 'Usuario ya existe',
          message: 'El nombre de usuario ya está registrado en el sistema'
        });
      }

      // Hash de la contraseña
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Crear usuario
      const result = await database.run(
        'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
        [username, passwordHash, email || null]
      );

      // Generar token JWT
      const token = jwt.sign(
        {
          userId: result.lastID,
          username: username
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '24h' }
      );

      // Obtener usuario creado (sin password)
      const newUser = await database.get(
        'SELECT id, username, email, created_at FROM users WHERE id = ?',
        [result.lastID]
      );

      return res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: newUser,
        token: token
      });

    } catch (error) {
      console.error('Error en registro:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al procesar el registro'
      });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Buscar usuario
      const user = await database.get(
        'SELECT id, username, password_hash, email FROM users WHERE username = ?',
        [username]
      );

      if (!user) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          message: 'Usuario o contraseña incorrectos'
        });
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          message: 'Usuario o contraseña incorrectos'
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '24h' }
      );

      // Actualizar última actividad
      await database.run(
        'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      // Retornar respuesta (sin password_hash)
      const { password_hash, ...userWithoutPassword } = user;
      
      return res.json({
        message: 'Login exitoso',
        user: userWithoutPassword,
        token: token
      });

    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al procesar el login'
      });
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.userId;

      const user = await database.get(
        'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
          message: 'El usuario especificado no existe'
        });
      }

      return res.json({
        message: 'Perfil obtenido exitosamente',
        user: user
      });

    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al obtener el perfil'
      });
    }
  }
}

module.exports = new AuthController();
