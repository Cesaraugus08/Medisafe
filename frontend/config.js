// Configuración del Frontend MediSafe
const CONFIG = {
  // URL del backend
  API_BASE_URL: 'http://localhost:3000',
  
  // Configuración de EmailJS
  EMAILJS: {
    PUBLIC_KEY: 'tu_public_key',
    SERVICE_ID: 'tu_service_id',
    TEMPLATE_ID: 'tu_template_id'
  },
  
  // Configuración de la aplicación
  APP: {
    NAME: 'MediSafe',
    VERSION: '1.0.0',
    DESCRIPTION: 'Sistema de Gestión de Medicamentos'
  },
  
  // Configuración de notificaciones
  NOTIFICATIONS: {
    AUTO_HIDE_DELAY: 5000,
    POSITION: 'top-right'
  },
  
  // Configuración de recordatorios
  REMINDERS: {
    DEFAULT_TIME: '09:00',
    CHECK_INTERVAL: 60000 // 1 minuto
  }
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else {
  window.CONFIG = CONFIG;
}
