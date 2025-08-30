// EJEMPLO de configuración de EmailJS para MediSafe
// Copia este archivo como emailjs-config.js y reemplaza con tus credenciales reales

const EMAILJS_CONFIG = {
  // Ejemplo de User ID (reemplaza con el tuyo real)
  USER_ID: "user_abc123def456", // Ejemplo: user_abc123def456
  
  // Ejemplo de Service ID (reemplaza con el tuyo real)
  SERVICE_ID: "service_xyz789", // Ejemplo: service_xyz789
  
  // Ejemplo de Template ID (reemplaza con el tuyo real)
  TEMPLATE_ID: "template_123456" // Ejemplo: template_123456
};

// Función para inicializar EmailJS con las credenciales
function initializeEmailJS() {
  console.log('🔧 Inicializando EmailJS...');
  
  if (typeof emailjs === 'undefined') {
    console.error('❌ EmailJS no está cargado');
    return false;
  }
  
  // Verificar si las credenciales están configuradas
  if (!EMAILJS_CONFIG.USER_ID || EMAILJS_CONFIG.USER_ID === "TU_USER_ID_AQUI") {
    console.warn('⚠️ EmailJS no configurado. Usando modo de demostración.');
    return false;
  }
  
  try {
    emailjs.init(EMAILJS_CONFIG.USER_ID);
    console.log('✅ EmailJS inicializado con credenciales reales');
    console.log('📧 User ID:', EMAILJS_CONFIG.USER_ID);
    console.log('📧 Service ID:', EMAILJS_CONFIG.SERVICE_ID);
    console.log('📧 Template ID:', EMAILJS_CONFIG.TEMPLATE_ID);
    return true;
  } catch (error) {
    console.error('❌ Error inicializando EmailJS:', error);
    return false;
  }
}

// Función para enviar email de verificación
function sendVerificationEmail(toEmail, code) {
  console.log('📧 Intentando enviar email a:', toEmail);
  console.log('🔐 Código generado:', code);
  
  // Verificar si EmailJS está configurado
  if (!EMAILJS_CONFIG.USER_ID || EMAILJS_CONFIG.USER_ID === "TU_USER_ID_AQUI") {
    console.warn('⚠️ EmailJS no configurado. Usando fallback.');
    return Promise.reject('EmailJS no configurado - usando modo de demostración');
  }
  
  // Verificar que emailjs esté disponible
  if (typeof emailjs === 'undefined') {
    console.error('❌ EmailJS no está cargado');
    return Promise.reject('EmailJS no está cargado');
  }
  
  const templateParams = {
    to_email: toEmail,
    verification_code: code,
    user_name: toEmail.split('@')[0],
    app_name: 'MediSafe',
    reset_link: window.location.href,
    current_date: new Date().toLocaleDateString('es-ES')
  };
  
  console.log('📧 Parámetros del template:', templateParams);
  
  return emailjs.send(
    EMAILJS_CONFIG.SERVICE_ID,
    EMAILJS_CONFIG.TEMPLATE_ID,
    templateParams
  );
}

// Función de prueba para verificar la configuración
function testEmailJSConfiguration() {
  console.log('🧪 Probando configuración de EmailJS...');
  
  const isConfigured = EMAILJS_CONFIG.USER_ID !== "TU_USER_ID_AQUI" &&
                      EMAILJS_CONFIG.SERVICE_ID !== "TU_SERVICE_ID_AQUI" &&
                      EMAILJS_CONFIG.TEMPLATE_ID !== "TU_TEMPLATE_ID_AQUI";
  
  if (isConfigured) {
    console.log('✅ EmailJS está configurado correctamente');
    return true;
  } else {
    console.log('⚠️ EmailJS no está configurado - usando modo de demostración');
    return false;
  }
}

// Exportar configuración para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EMAILJS_CONFIG, initializeEmailJS, sendVerificationEmail, testEmailJSConfiguration };
} 