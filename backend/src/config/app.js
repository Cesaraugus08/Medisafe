const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// Configuración de seguridad
app.use(helmet());

// Configuración CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir llamadas desde file:// (origin null) y cualquier origen
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // máximo 200 requests por ventana
  message: {
    error: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos'
  }
});
app.use(limiter);

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'MediSafe Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = app;
