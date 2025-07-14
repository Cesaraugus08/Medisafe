// MediSafe Frontend - Conexión SQLite Definitiva
// Este script reemplaza localStorage con conexión a SQLite

class MediSafeSQLite {
  constructor() {
    this.apiBase = 'http://localhost:3000/api';
    this.token = localStorage.getItem('authToken');
    this.currentUser = null;
    this.isConnected = false;
    
    // Configurar headers por defecto
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      this.defaultHeaders['Authorization'] = `Bearer ${this.token}`;
    }
  }

  // Método para establecer conexión con el servidor
  async connect() {
    try {
      console.log('🔌 Conectando con servidor SQLite...');
      
      // Verificar si el servidor está disponible
      const response = await fetch(`${this.apiBase}/health`, {
        method: 'GET',
        headers: this.defaultHeaders
      });
      
      if (response.ok) {
        this.isConnected = true;
        console.log('✅ Conexión con SQLite establecida');
        return true;
      } else {
        throw new Error('Servidor no disponible');
      }
    } catch (error) {
      console.error('❌ Error conectando con SQLite:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Método para hacer requests autenticados
  async authenticatedRequest(endpoint, options = {}) {
    if (!this.token) {
      throw new Error('No hay token de autenticación');
    }

    const headers = {
      ...this.defaultHeaders,
      'Authorization': `Bearer ${this.token}`,
      ...options.headers
    };

    const response = await fetch(`${this.apiBase}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token expirado
      this.logout();
      throw new Error('Sesión expirada');
    }

    return response;
  }

  // Autenticación
  async login(username, password) {
    try {
      console.log('🔐 Iniciando sesión...');
      
      const response = await fetch(`${this.apiBase}/auth/login`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.token;
        this.currentUser = data.user;
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // Actualizar headers
        this.defaultHeaders['Authorization'] = `Bearer ${this.token}`;
        
        console.log('✅ Login exitoso:', this.currentUser.username);
        return { success: true, user: this.currentUser };
      } else {
        throw new Error(data.error || 'Error en login');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      return { success: false, error: error.message };
    }
  }

  async register(username, password, email) {
    try {
      console.log('📝 Registrando usuario...');
      
      const response = await fetch(`${this.apiBase}/auth/register`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({ username, password, email })
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.token;
        this.currentUser = data.user;
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // Actualizar headers
        this.defaultHeaders['Authorization'] = `Bearer ${this.token}`;
        
        console.log('✅ Registro exitoso:', this.currentUser.username);
        return { success: true, user: this.currentUser };
      } else {
        throw new Error(data.error || 'Error en registro');
      }
    } catch (error) {
      console.error('❌ Error en registro:', error);
      return { success: false, error: error.message };
    }
  }

  logout() {
    console.log('🚪 Cerrando sesión...');
    this.token = null;
    this.currentUser = null;
    this.isConnected = false;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    delete this.defaultHeaders['Authorization'];
  }

  // Gestión de medicamentos
  async getMedications() {
    try {
      console.log('📋 Obteniendo medicamentos...');
      
      const response = await this.authenticatedRequest('/medications');
      const medications = await response.json();
      
      console.log(`✅ ${medications.length} medicamentos obtenidos`);
      return medications;
    } catch (error) {
      console.error('❌ Error obteniendo medicamentos:', error);
      return [];
    }
  }

  async addMedication(medication) {
    try {
      console.log('💊 Agregando medicamento...');
      
      const response = await this.authenticatedRequest('/medications', {
        method: 'POST',
        body: JSON.stringify({
          name: medication.name,
          dose: medication.dose,
          frequency: medication.freq,
          time: medication.time,
          expiry_date: medication.expiry,
          notes: medication.notes
        })
      });

      const newMedication = await response.json();
      
      console.log('✅ Medicamento agregado:', newMedication.name);
      return newMedication;
    } catch (error) {
      console.error('❌ Error agregando medicamento:', error);
      throw error;
    }
  }

  async updateMedication(id, medication) {
    try {
      console.log('✏️ Actualizando medicamento...');
      
      const response = await this.authenticatedRequest(`/medications/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: medication.name,
          dose: medication.dose,
          frequency: medication.freq,
          time: medication.time,
          expiry_date: medication.expiry,
          notes: medication.notes
        })
      });

      const updatedMedication = await response.json();
      
      console.log('✅ Medicamento actualizado:', updatedMedication.name);
      return updatedMedication;
    } catch (error) {
      console.error('❌ Error actualizando medicamento:', error);
      throw error;
    }
  }

  async deleteMedication(id) {
    try {
      console.log('🗑️ Eliminando medicamento...');
      
      const response = await this.authenticatedRequest(`/medications/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        console.log('✅ Medicamento eliminado');
        return true;
      } else {
        throw new Error('Error eliminando medicamento');
      }
    } catch (error) {
      console.error('❌ Error eliminando medicamento:', error);
      throw error;
    }
  }

  // Gestión de recordatorios
  async getReminders() {
    try {
      console.log('⏰ Obteniendo recordatorios...');
      
      const response = await this.authenticatedRequest('/reminders');
      const reminders = await response.json();
      
      console.log(`✅ ${reminders.length} recordatorios obtenidos`);
      return reminders;
    } catch (error) {
      console.error('❌ Error obteniendo recordatorios:', error);
      return [];
    }
  }

  async addReminder(reminder) {
    try {
      console.log('⏰ Agregando recordatorio...');
      
      const response = await this.authenticatedRequest('/reminders', {
        method: 'POST',
        body: JSON.stringify({
          medication_id: reminder.medicationId,
          reminder_time: reminder.time,
          days_of_week: JSON.stringify(reminder.days || [1,2,3,4,5,6,7])
        })
      });

      const newReminder = await response.json();
      
      console.log('✅ Recordatorio agregado');
      return newReminder;
    } catch (error) {
      console.error('❌ Error agregando recordatorio:', error);
      throw error;
    }
  }

  // Gestión de metas
  async getGoals() {
    try {
      console.log('🎯 Obteniendo metas...');
      
      const response = await this.authenticatedRequest('/goals');
      const goals = await response.json();
      
      console.log(`✅ ${goals.length} metas obtenidas`);
      return goals;
    } catch (error) {
      console.error('❌ Error obteniendo metas:', error);
      return [];
    }
  }

  async addGoal(goal) {
    try {
      console.log('🎯 Agregando meta...');
      
      const response = await this.authenticatedRequest('/goals', {
        method: 'POST',
        body: JSON.stringify({
          title: goal.title,
          description: goal.description,
          deadline: goal.deadline
        })
      });

      const newGoal = await response.json();
      
      console.log('✅ Meta agregada:', newGoal.title);
      return newGoal;
    } catch (error) {
      console.error('❌ Error agregando meta:', error);
      throw error;
    }
  }

  // Verificar estado de conexión
  async checkConnection() {
    try {
      const response = await fetch(`${this.apiBase}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Migrar datos de localStorage a SQLite
  async migrateFromLocalStorage() {
    try {
      console.log('🔄 Migrando datos de localStorage a SQLite...');
      
      // Obtener datos de localStorage
      const localMedications = JSON.parse(localStorage.getItem('medications') || '[]');
      const localGoals = JSON.parse(localStorage.getItem('goals') || '[]');
      
      console.log(`📋 Migrando ${localMedications.length} medicamentos`);
      console.log(`🎯 Migrando ${localGoals.length} metas`);
      
      // Migrar medicamentos
      for (const med of localMedications) {
        await this.addMedication(med);
      }
      
      // Migrar metas
      for (const goal of localGoals) {
        await this.addGoal(goal);
      }
      
      console.log('✅ Migración completada');
      return true;
    } catch (error) {
      console.error('❌ Error en migración:', error);
      return false;
    }
  }
}

// Inicializar la aplicación
const medisafe = new MediSafeSQLite();

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
  notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
}

// Función para verificar conexión al cargar la página
async function initializeApp() {
  console.log('🚀 Inicializando MediSafe con SQLite...');
  
  // Verificar conexión
  const isConnected = await medisafe.checkConnection();
  
  if (isConnected) {
    console.log('✅ Servidor SQLite disponible');
    
    // Verificar si hay token guardado
    const token = localStorage.getItem('authToken');
    if (token) {
      medisafe.token = token;
      medisafe.defaultHeaders['Authorization'] = `Bearer ${token}`;
      
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        medisafe.currentUser = JSON.parse(userData);
        console.log('👤 Usuario autenticado:', medisafe.currentUser.username);
      }
    }
  } else {
    console.warn('⚠️ Servidor SQLite no disponible');
    showNotification('Servidor SQLite no disponible. Verifica que el servidor esté ejecutándose.', 'warning');
  }
}

// Exportar para uso global
window.MediSafeSQLite = MediSafeSQLite;
window.medisafe = medisafe;
window.showNotification = showNotification;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeApp);

console.log('📦 MediSafe SQLite Frontend cargado'); 