const app = require('./config/app');
const database = require('./config/database');
const authRoutes = require('./routes/auth.routes');
require('dotenv').config({ path: './config.env' });

const PORT = process.env.BACKEND_PORT || 4000;

// Rutas de la API
app.use('/api/v1/auth', authRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Ocurrió un error inesperado'
  });
});

// Ruta 404 para endpoints no encontrados
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.originalUrl} no existe`,
    availableEndpoints: [
      'GET /api/v1/health',
      'POST /api/v1/auth/register',
      'POST /api/v1/auth/login',
      'GET /api/v1/auth/profile'
    ]
  });
});

// Inicializar servidor
database.init().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Backend MediSafe iniciado en puerto ${PORT}`);
    console.log(`📊 Base de datos: SQLite`);
    console.log(`🔗 API disponible en: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/v1/health`);
    console.log(`👤 Endpoints de auth: http://localhost:${PORT}/api/v1/auth`);
  });

  // Manejo de cierre graceful
  process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando backend MediSafe...');
    try {
      server.close();
      await database.close();
      console.log('✅ Base de datos cerrada correctamente');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error cerrando base de datos:', error);
      process.exit(1);
    }
  });
}).catch((err) => {
  console.error('❌ Error inicializando backend:', err);
  process.exit(1);
});

 