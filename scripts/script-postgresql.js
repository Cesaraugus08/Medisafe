// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Variables globales
let currentUser = null;
let authToken = null;

// Utilidades de API
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en API request:', error);
    showNotification(`Error: ${error.message}`, 'error');
    throw error;
  }
}

// Funciones de autenticación
async function registerUser(username, password, email) {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email })
    });
    
    currentUser = response.user;
    authToken = response.token;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showNotification('Usuario registrado exitosamente', 'success');
    return response;
  } catch (error) {
    throw error;
  }
}

async function loginUser(username, password) {
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    currentUser = response.user;
    authToken = response.token;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showNotification('Login exitoso', 'success');
    return response;
  } catch (error) {
    throw error;
  }
}

function logout() {
  currentUser = null;
  authToken = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  showAuth();
  showNotification('Sesión cerrada', 'info');
}

// Funciones de medicamentos
async function getMeds() {
  try {
    const meds = await apiRequest('/medications');
    return meds;
  } catch (error) {
    console.error('Error obteniendo medicamentos:', error);
    return [];
  }
}

async function saveMed(medication) {
  try {
    const response = await apiRequest('/medications', {
      method: 'POST',
      body: JSON.stringify(medication)
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function updateMed(id, medication) {
  try {
    const response = await apiRequest(`/medications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medication)
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function deleteMed(id) {
  try {
    await apiRequest(`/medications/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    throw error;
  }
}

// Funciones de recordatorios
async function getReminders() {
  try {
    const reminders = await apiRequest('/reminders');
    return reminders;
  } catch (error) {
    console.error('Error obteniendo recordatorios:', error);
    return [];
  }
}

async function saveReminder(reminder) {
  try {
    const response = await apiRequest('/reminders', {
      method: 'POST',
      body: JSON.stringify(reminder)
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function updateReminder(id, reminder) {
  try {
    const response = await apiRequest(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reminder)
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function deleteReminder(id) {
  try {
    await apiRequest(`/reminders/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    throw error;
  }
}

// Funciones de metas
async function getGoals() {
  try {
    const goals = await apiRequest('/goals');
    return goals;
  } catch (error) {
    console.error('Error obteniendo metas:', error);
    return [];
  }
}

async function saveGoal(goal) {
  try {
    const response = await apiRequest('/goals', {
      method: 'POST',
      body: JSON.stringify(goal)
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function updateGoal(id, goal) {
  try {
    const response = await apiRequest(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goal)
    });
    return response;
  } catch (error) {
    throw error;
  }
}

async function deleteGoal(id) {
  try {
    await apiRequest(`/goals/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    throw error;
  }
}

// Funciones de utilidad (mantienen la misma interfaz)
function daysToExpiry(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  const expiry = new Date(dateStr);
  const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  return diff;
}

function formatTimeToAMPM(timeStr) {
  if (!timeStr) return '-';
  const [hour, minute] = timeStr.split(':');
  let h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${minute} ${ampm}`;
}

// Función de notificaciones
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

// Función para cerrar modales
function forceCloseModal(modalId) {
  const modalElement = document.getElementById(modalId);
  if (!modalElement) return;
  
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  if (modalInstance) {
    modalInstance.hide();
  }
  
  try {
    const newModal = new bootstrap.Modal(modalElement);
    newModal.hide();
  } catch (error) {
    console.log('Método 2 falló:', error);
  }
  
  setTimeout(() => {
    modalElement.classList.remove('show');
    modalElement.style.display = 'none';
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.removeAttribute('aria-modal');
    
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }, 100);
}

// Funciones de navegación
function showAuth() {
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('med-list-section').classList.add('hidden');
}

function showApp() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('med-list-section').classList.remove('hidden');
  renderMeds();
  
  setTimeout(setupDebugButton, 500);
  setTimeout(startReminderChecker, 1000);
}

// Renderizado de medicamentos (actualizado para API)
async function renderMeds() {
  try {
    const meds = await getMeds();
    const medList = document.getElementById('med-list');
    
    if (meds.length === 0) {
      medList.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-capsule display-1 text-muted"></i>
          <h4 class="mt-3 text-muted">No hay medicamentos registrados</h4>
          <p class="text-muted">Agrega tu primer medicamento para comenzar</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    meds.forEach((med, index) => {
      const daysUntilExpiry = daysToExpiry(med.expiry_date);
      const expiryClass = daysUntilExpiry !== null && daysUntilExpiry <= 30 ? 'text-danger' : 'text-muted';
      const expiryText = daysUntilExpiry !== null ? 
        (daysUntilExpiry < 0 ? `Expirado hace ${Math.abs(daysUntilExpiry)} días` :
         daysUntilExpiry === 0 ? 'Expira hoy' :
         `Expira en ${daysUntilExpiry} días`) : 'Sin fecha de expiración';
      
      html += `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title mb-0">${med.name}</h5>
                <div class="btn-group" role="group">
                  <button class="btn btn-sm btn-outline-primary" onclick="openEditMedModal(${med.id})">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" onclick="deleteMedication(${med.id})">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <p class="card-text"><strong>Dosis:</strong> ${med.dose}</p>
              <p class="card-text"><strong>Frecuencia:</strong> ${med.frequency}</p>
              <p class="card-text"><strong>Horario:</strong> ${formatTimeToAMPM(med.time)}</p>
              <p class="card-text ${expiryClass}"><strong>Expiración:</strong> ${expiryText}</p>
              ${med.notes ? `<p class="card-text"><small class="text-muted">${med.notes}</small></p>` : ''}
            </div>
            <div class="card-footer bg-transparent">
              <button class="btn btn-sm btn-outline-info w-100" onclick="showDetailModal(${JSON.stringify(med).replace(/"/g, '&quot;')})">
                <i class="bi bi-info-circle me-1"></i>Ver Detalles
              </button>
            </div>
          </div>
        </div>
      `;
    });
    
    medList.innerHTML = html;
  } catch (error) {
    console.error('Error renderizando medicamentos:', error);
    showNotification('Error cargando medicamentos', 'error');
  }
}

// Funciones de gestión de medicamentos
async function openEditMedModal(id) {
  try {
    const meds = await getMeds();
    const med = meds.find(m => m.id === id);
    
    if (!med) {
      showNotification('Medicamento no encontrado', 'error');
      return;
    }
    
    document.getElementById('med-name').value = med.name;
    document.getElementById('med-dose').value = med.dose;
    document.getElementById('med-freq').value = med.frequency;
    document.getElementById('med-time').value = med.time;
    document.getElementById('med-expiry').value = med.expiry_date || '';
    document.getElementById('med-notes').value = med.notes || '';
    
    // Configurar el formulario para actualizar
    const form = document.getElementById('med-form');
    form.onsubmit = async function(e) {
      e.preventDefault();
      
      try {
        const updatedMed = {
          name: document.getElementById('med-name').value,
          dose: document.getElementById('med-dose').value,
          frequency: document.getElementById('med-freq').value,
          time: document.getElementById('med-time').value,
          expiry_date: document.getElementById('med-expiry').value || null,
          notes: document.getElementById('med-notes').value
        };
        
        await updateMed(id, updatedMed);
        renderMeds();
        forceCloseModal('modal');
        showNotification('Medicamento actualizado exitosamente', 'success');
      } catch (error) {
        showNotification('Error actualizando medicamento', 'error');
      }
    };
    
    const modal = new bootstrap.Modal(document.getElementById('modal'));
    modal.show();
  } catch (error) {
    showNotification('Error cargando medicamento', 'error');
  }
}

async function deleteMedication(id) {
  if (confirm('¿Estás seguro de que quieres eliminar este medicamento?')) {
    try {
      await deleteMed(id);
      renderMeds();
      showNotification('Medicamento eliminado exitosamente', 'success');
    } catch (error) {
      showNotification('Error eliminando medicamento', 'error');
    }
  }
}

// Manejador del formulario de medicamentos
const defaultMedFormHandler = async function(e) {
  e.preventDefault();
  
  try {
    const medication = {
      name: document.getElementById('med-name').value,
      dose: document.getElementById('med-dose').value,
      frequency: document.getElementById('med-freq').value,
      time: document.getElementById('med-time').value,
      expiry_date: document.getElementById('med-expiry').value || null,
      notes: document.getElementById('med-notes').value
    };
    
    await saveMed(medication);
    renderMeds();
    forceCloseModal('modal');
    document.getElementById('med-form').reset();
    showNotification('Medicamento guardado exitosamente', 'success');
  } catch (error) {
    showNotification('Error guardando medicamento', 'error');
  }
};

// Inicialización
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Inicializando MediSafe con PostgreSQL...');
  
  // Verificar si hay token guardado
  const savedToken = localStorage.getItem('authToken');
  const savedUser = localStorage.getItem('currentUser');
  
  if (savedToken && savedUser) {
    try {
      authToken = savedToken;
      currentUser = JSON.parse(savedUser);
      
      // Verificar si el token sigue siendo válido
      await apiRequest('/medications');
      showApp();
      showNotification('Sesión restaurada', 'info');
    } catch (error) {
      console.log('Token inválido, mostrando login');
      logout();
    }
  } else {
    showAuth();
  }
  
  // Configurar event listeners de autenticación
  setupAuthEventListeners();
  
  // Configurar event listeners de medicamentos
  setupMedicationEventListeners();
});

// Configuración de event listeners de autenticación
function setupAuthEventListeners() {
  // Registro
  document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const email = document.getElementById('register-email').value;
    
    try {
      await registerUser(username, password, email);
      showApp();
    } catch (error) {
      showNotification(error.message, 'error');
    }
  });
  
  // Login
  document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
      await loginUser(username, password);
      showApp();
    } catch (error) {
      showNotification(error.message, 'error');
    }
  });
  
  // Logout
  document.getElementById('logout-btn').addEventListener('click', logout);
  
  // Navegación entre login/registro
  document.getElementById('show-register').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('login-box').classList.add('hidden');
    document.getElementById('register-box').classList.remove('hidden');
  });
  
  document.getElementById('show-login').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('register-box').classList.add('hidden');
    document.getElementById('login-box').classList.remove('hidden');
  });
}

// Configuración de event listeners de medicamentos
function setupMedicationEventListeners() {
  // Botón agregar medicamento
  document.getElementById('add-med-btn').addEventListener('click', function() {
    const modal = new bootstrap.Modal(document.getElementById('modal'));
    document.getElementById('med-form').reset();
    document.getElementById('med-form').onsubmit = defaultMedFormHandler;
    modal.show();
  });
  
  // Cerrar modal
  document.getElementById('close-modal').addEventListener('click', function() {
    forceCloseModal('modal');
    document.getElementById('med-form').reset();
    document.getElementById('med-form').onsubmit = defaultMedFormHandler;
  });
}

// Funciones adicionales (placeholder para compatibilidad)
function setupDebugButton() {
  // Implementar si es necesario
}

function startReminderChecker() {
  // Implementar si es necesario
}

function showDetailModal(med) {
  // Implementar si es necesario
} 