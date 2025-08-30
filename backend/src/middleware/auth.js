const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acceso requerido',
      message: 'Debes incluir el token en el header Authorization: Bearer <token>'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expirado',
          message: 'Tu sesión ha expirado, inicia sesión nuevamente'
        });
      }
      return res.status(403).json({ 
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }

    req.user = user;
    next();
  });
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
      if (!err) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
