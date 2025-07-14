// Utilidades para localStorage
function getMeds() {
  const meds = JSON.parse(localStorage.getItem('medications') || '[]');
  // Migrar medicamentos existentes que no tienen ID
  let needsMigration = false;
  meds.forEach(med => {
    if (!med.id) {
      med.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      needsMigration = true;
    }
  });
  if (needsMigration) {
    saveMeds(meds);
  }
  return meds;
}
function saveMeds(meds) {
  localStorage.setItem('medications', JSON.stringify(meds));
}

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

// --- Gestión de usuarios con localStorage ---
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function setCurrentUser(username) {
  localStorage.setItem('currentUser', username);
}
function getCurrentUser() {
  return localStorage.getItem('currentUser');
}

// --- Función de notificaciones ---
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

// --- Función para cerrar modales de manera definitiva ---
function forceCloseModal(modalId) {
  const modalElement = document.getElementById(modalId);
  if (!modalElement) return;
  
  // Método 1: Usar Bootstrap Modal API
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  if (modalInstance) {
    modalInstance.hide();
  }
  
  // Método 2: Crear nueva instancia y cerrar
  try {
    const newModal = new bootstrap.Modal(modalElement);
    newModal.hide();
  } catch (error) {
    console.log('Método 2 falló:', error);
  }
  
  // Método 3: Forzar cierre manual removiendo clases
  setTimeout(() => {
    modalElement.classList.remove('show');
    modalElement.style.display = 'none';
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.removeAttribute('aria-modal');
    
    // Remover backdrop
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    
    // Habilitar scroll del body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }, 100);
}

// --- Mostrar/Ocultar secciones ---
function showAuth() {
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('med-list-section').classList.add('hidden');
}
function showApp() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('med-list-section').classList.remove('hidden');
  renderMeds();
  
  // Configurar botón de debug después de mostrar la app
  setTimeout(setupDebugButton, 500);
  
  // Iniciar verificador de recordatorios cuando se muestra la aplicación
  setTimeout(startReminderChecker, 1000);
}

// --- Registro con localStorage ---
document.getElementById('show-register').onclick = function(e) {
  e.preventDefault();
  document.getElementById('login-box').classList.add('hidden');
  document.getElementById('register-box').classList.remove('hidden');
};
document.getElementById('show-login').onclick = function(e) {
  e.preventDefault();
  document.getElementById('register-box').classList.add('hidden');
  document.getElementById('login-box').classList.remove('hidden');
};











// Event listener centralizado para todos los botones de navegación
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Configurando event listeners para botones de navegación...');
  
  // Función optimizada para manejar la navegación entre pasos
  function navigateToStep(targetStep) {
    // Ocultar todos los pasos de una vez
    const allSteps = [
      'reset-methods',
      'reset-password-form',
      'verification-section',
      'success-message'
    ];
    
    allSteps.forEach(stepId => {
      const step = document.getElementById(stepId);
      if (step) step.classList.add('hidden');
    });
    
    // Mostrar el paso objetivo inmediatamente
    const targetElement = document.getElementById(targetStep);
    if (targetElement) {
      targetElement.classList.remove('hidden');
    }
  }
  
  // Event delegation para botones de navegación
  document.addEventListener('click', function(e) {
    const target = e.target;
    
    // Botones de "Volver"
    if (target.matches('[data-back-to]')) {
      e.preventDefault();
      const backTo = target.dataset.backTo;
      navigateToStep(backTo);
      return;
    }
    
    // Botones de "Atrás"
    if (target.matches('[id*="back-to-step"]')) {
      e.preventDefault();
      const stepNumber = target.id.match(/\d+/)[0];
      const previousStep = `reset-step-${parseInt(stepNumber) - 1}`;
      navigateToStep(previousStep);
      return;
    }
    
    // Botones de "Cambiar Método"
    if (target.matches('[id*="back-to-methods"]')) {
      e.preventDefault();
      navigateToStep('reset-methods');
      return;
    }
  });
});

// --- Registro con localStorage ---
document.getElementById('register-form').onsubmit = function(e) {
  e.preventDefault();
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value;
  if (!username || !password) return;
  let users = getUsers();
  if (users.find(u => u.username === username)) {
    alert('El usuario ya existe');
    return;
  }
  users.push({ username, password });
  saveUsers(users);
  setCurrentUser(username);
  showApp();
};

// --- Login con localStorage ---
document.getElementById('login-form').onsubmit = function(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  let users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    alert('Usuario o contraseña incorrectos');
    return;
  }
  setCurrentUser(username);
  showApp();
};

// --- Logout ---
// Event listener principal para logout
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Configurando event listeners para logout...');
  
  // Función robusta para detectar y configurar el botón de logout
  function setupLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      console.log('✅ Botón de logout encontrado, configurando event listeners...');
      
      // Limpiar event listeners existentes clonando el elemento
      const newLogoutBtn = logoutBtn.cloneNode(true);
      logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
      
      // Múltiples event listeners para asegurar que funcione
      newLogoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🚪 Botón de logout clickeado (addEventListener)');
        logout();
      });
      
      newLogoutBtn.addEventListener('mousedown', function(e) {
        e.preventDefault();
        console.log('🚪 Botón de logout mousedown');
        logout();
      });
      
      // También onclick como respaldo
      newLogoutBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🚪 Botón de logout onclick');
        logout();
      };
      
      console.log('✅ Botón de logout configurado con múltiples event listeners');
    } else {
      console.error('❌ Botón de logout no encontrado en el DOM');
    }
  }
  
  // Configurar el botón cuando se carga la página
  setupLogoutButton();
  
  // Event delegation global para logout
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'logout-btn') {
      e.preventDefault();
      e.stopPropagation();
      console.log('🚪 Botón de logout clickeado (event delegation)');
      logout();
    }
  });
  
  // Event delegation específico para elementos dentro del dropdown
  document.addEventListener('click', function(e) {
    const target = e.target;
    if (target && (target.id === 'logout-btn' || target.closest('#logout-btn'))) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🚪 Botón de logout clickeado (dropdown delegation)');
      logout();
    }
  });
  
  console.log('✅ Event listeners para logout configurados');
});

// Función de logout mejorada
function logout() {
  console.log('🚪 Iniciando proceso de logout...');
  
  try {
    // Verificar si estamos en proceso de guardado de configuración
    if (window.isSavingConfig) {
      console.log('⚠️ Logout bloqueado durante el guardado de configuración');
      return;
    }
    
    // Obtener usuario actual antes de eliminarlo
    const currentUser = getCurrentUser();
    console.log('👤 Usuario actual:', currentUser);
    
    // Limpiar datos de sesión
    localStorage.removeItem('currentUser');
    console.log('🗑️ Datos de sesión eliminados');
    
    // Detener verificador de recordatorios si existe
    if (typeof stopReminderChecker === 'function') {
      stopReminderChecker();
      console.log('🔕 Verificador de recordatorios detenido');
    }
    
    // Mostrar notificación de logout
    if (currentUser) {
      showNotification(`👋 ¡Hasta luego, ${currentUser}!`, 'info');
    }
    
    // Limpiar formularios de login
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');
    
    if (loginUsername) loginUsername.value = '';
    if (loginPassword) loginPassword.value = '';
    console.log('🧹 Formularios de login limpiados');
    
    // Mostrar pantalla de autenticación
    showAuth();
    console.log('🔐 Pantalla de autenticación mostrada');
    
    console.log('✅ Logout completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante el logout:', error);
    showNotification('❌ Error al cerrar sesión', 'error');
    
    // Fallback: mostrar pantalla de autenticación de todas formas
    try {
      showAuth();
    } catch (fallbackError) {
      console.error('❌ Error en fallback:', fallbackError);
    }
  }
}

// --- Renderizado de medicamentos ---
function renderMeds() {
  const medList = document.getElementById('med-list');
  medList.innerHTML = '';
  const meds = getMeds();
  if (meds.length === 0) {
    medList.innerHTML = '<li>No hay medicamentos registrados.</li>';
    return;
  }
  meds.forEach((med, idx) => {
    const li = document.createElement('li');
    let classes = [];
    const days = daysToExpiry(med.expiry);
    if (days !== null) {
      if (days < 0) classes.push('expired');
      else if (days <= 7) classes.push('warning');
    }
    li.className = classes.join(' ');
    li.innerHTML = `<strong>${med.name}</strong> <span>Dosis: ${med.dose}</span> <span>Frecuencia: ${med.freq}</span> <span>Horario: ${formatTimeToAMPM(med.time)}</span> <span>Caducidad: ${med.expiry || '-'}</span> <span>Notas: ${med.notes || '-'}</span> <button data-idx="${idx}" class="edit-btn">Editar</button> <button data-idx="${idx}" class="delete-btn">Eliminar</button>`;
    li.onclick = function(e) {
      if (e.target.classList.contains('delete-btn') || e.target.classList.contains('edit-btn')) return;
      showDetailModal(med);
    };
    medList.appendChild(li);
    

  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      const idx = this.getAttribute('data-idx');
      const meds = getMeds();
      meds.splice(idx, 1);
      saveMeds(meds);
      renderMeds();
    };
  });
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      const idx = this.getAttribute('data-idx');
      openEditMedModal(idx);
    };
  });
}

function openEditMedModal(idx) {
  const meds = getMeds();
  const med = meds[idx];
  document.getElementById('med-name').value = med.name;
  document.getElementById('med-dose').value = med.dose;
  document.getElementById('med-freq').value = med.freq;
  document.getElementById('med-time').value = med.time;
  document.getElementById('med-expiry').value = med.expiry;
  document.getElementById('med-notes').value = med.notes;
  const modal = new bootstrap.Modal(document.getElementById('modal'));
  document.getElementById('med-form').onsubmit = function(e) {
    e.preventDefault();
    const updatedMed = {
      id: med.id, // Mantener el ID original
      name: document.getElementById('med-name').value,
      dose: document.getElementById('med-dose').value,
      freq: document.getElementById('med-freq').value,
      time: document.getElementById('med-time').value,
      expiry: document.getElementById('med-expiry').value,
      notes: document.getElementById('med-notes').value
    };
    meds[idx] = updatedMed;
    saveMeds(meds);
    renderMeds();
    
    // CERRAR EL MODAL DE MANERA DEFINITIVA
    forceCloseModal('modal');
    
    // Limpiar el formulario
    document.getElementById('med-form').reset();
    document.getElementById('med-form').onsubmit = defaultMedFormHandler;
    
    // Mostrar notificación de éxito
    showNotification(`✅ Medicamento "${updatedMed.name}" actualizado exitosamente`, 'success');
  };
  modal.show();
}

const defaultMedFormHandler = function(e) {
  e.preventDefault();
  e.stopPropagation();
  
  console.log('🔧 Guardando medicamento...');
  
  const med = {
    id: Date.now().toString(), // Generar ID único
    name: document.getElementById('med-name').value,
    dose: document.getElementById('med-dose').value,
    freq: document.getElementById('med-freq').value,
    time: document.getElementById('med-time').value,
    expiry: document.getElementById('med-expiry').value,
    notes: document.getElementById('med-notes').value
  };
  
  console.log('📝 Datos del medicamento:', med);
  
  const meds = getMeds();
  meds.push(med);
  saveMeds(meds);
  renderMeds();
  
  // El verificador de notificaciones se eliminó con la funcionalidad de recordatorios
  
  console.log('🚪 Cerrando modal...');
  
  // CERRAR EL MODAL DE MANERA DEFINITIVA - MÚLTIPLES MÉTODOS
  const modalElement = document.getElementById('modal');
  
  // Método 1: Bootstrap API
  try {
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
      console.log('✅ Modal cerrado con Bootstrap API');
    }
  } catch (error) {
    console.log('❌ Error con Bootstrap API:', error);
  }
  
  // Método 2: Crear nueva instancia
  try {
    const newModal = new bootstrap.Modal(modalElement);
    newModal.hide();
    console.log('✅ Modal cerrado con nueva instancia');
  } catch (error) {
    console.log('❌ Error con nueva instancia:', error);
  }
  
  // Método 3: Forzar cierre manual
  setTimeout(() => {
    console.log('🔧 Forzando cierre manual...');
    
    // Remover clases de Bootstrap
    modalElement.classList.remove('show');
    modalElement.style.display = 'none';
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.removeAttribute('aria-modal');
    
    // Remover backdrop
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
      backdrop.remove();
    });
    
    // Restaurar body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    console.log('✅ Cierre manual completado');
  }, 50);
  
  // Limpiar el formulario
  document.getElementById('med-form').reset();
  document.getElementById('med-form').onsubmit = defaultMedFormHandler;
  
  // Mostrar notificación de éxito
  showNotification(`✅ Medicamento "${med.name}" guardado exitosamente`, 'success');
  
  console.log('✅ Proceso completado');
};
document.getElementById('med-form').onsubmit = defaultMedFormHandler;

// --- Botón para agregar medicamento ---
document.getElementById('add-med-btn').onclick = function() {
  const modal = new bootstrap.Modal(document.getElementById('modal'));
  document.getElementById('med-form').reset();
  document.getElementById('med-form').onsubmit = defaultMedFormHandler;
  modal.show();
};

// --- Cerrar modal de medicamento ---
document.getElementById('close-modal').onclick = function() {
  const modal = bootstrap.Modal.getInstance(document.getElementById('modal'));
  if (modal) {
    modal.hide();
  }
  document.getElementById('med-form').reset();
  document.getElementById('med-form').onsubmit = defaultMedFormHandler;
};

// --- Modal de detalle ---
function showDetailModal(med) {
  // Simulación de efectos y recomendaciones (en real, consultar API o base de datos)
  const efectos = {
    'Paracetamol': 'Náuseas, erupciones cutáneas, daño hepático en dosis altas.',
    'Ibuprofeno': 'Dolor estomacal, mareos, retención de líquidos.',
    'Amoxicilina': 'Diarrea, náuseas, reacciones alérgicas.',
    'default': 'Consultar el prospecto o a su médico.'
  };
  const recomendaciones = {
    'Paracetamol': 'Tomar con alimentos, no exceder 4g/día.',
    'Ibuprofeno': 'Tomar con alimentos, evitar en caso de úlcera.',
    'Amoxicilina': 'Completar todo el tratamiento, tomar con agua.',
    'default': 'Seguir las indicaciones del médico.'
  };
  
  const modal = new bootstrap.Modal(document.getElementById('detail-modal'));
  document.getElementById('detail-med-name').textContent = med.name;
  document.getElementById('detail-med-dose').textContent = med.dose;
  document.getElementById('detail-med-freq').textContent = med.freq;
  document.getElementById('detail-med-time').textContent = formatTimeToAMPM(med.time);
  document.getElementById('detail-med-expiry').textContent = med.expiry || 'No especificada';
  document.getElementById('detail-med-notes').textContent = med.notes || 'Sin notas';
  document.getElementById('detail-med-effects').textContent = efectos[med.name] || efectos.default;
  document.getElementById('detail-med-recommendations').textContent = recomendaciones[med.name] || recomendaciones.default;
  modal.show();
}

// --- Cerrar modal de detalle ---
document.getElementById('close-detail').onclick = function() {
  const modal = bootstrap.Modal.getInstance(document.getElementById('detail-modal'));
  if (modal) {
    modal.hide();
  }
};







// --- Inicialización ---
window.onload = function() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    showApp();
  } else {
    showAuth();
  }
  
  // Configurar botón de logout
  setupLogoutButton();
};

// --- Configurar botón de debug ---
function setupDebugButton() {
  const debugBtn = document.getElementById('debug-btn');
  if (debugBtn) {
    debugBtn.addEventListener('click', function() {
      console.log('🔍 === DEBUG INFO ===');
      console.log('Usuario actual:', getCurrentUser());
      console.log('Medicamentos:', getMeds());
      console.log('Tamaño de fuente:', getCurrentFontSize());
      console.log('=== FIN DEBUG ===');
    });
  }
}

// --- Funcionalidad de la barra de accesibilidad ---

// Función para obtener recordatorios
function getReminders() {
  return JSON.parse(localStorage.getItem('reminders') || '[]');
}

// Función para guardar recordatorios
function saveReminders(reminders) {
  localStorage.setItem('reminders', JSON.stringify(reminders));
}

// Función para obtener metas
function getGoals() {
  return JSON.parse(localStorage.getItem('goals') || '[]');
}

// Función para guardar metas
function saveGoals(goals) {
  localStorage.setItem('goals', JSON.stringify(goals));
}

// Event listener para el botón de recordatorios
document.addEventListener('DOMContentLoaded', function() {
  const remindersBtn = document.getElementById('reminders-btn');
  if (remindersBtn) {
    remindersBtn.addEventListener('click', function() {
      const modal = new bootstrap.Modal(document.getElementById('reminders-modal'));
      
      // Cargar medicamentos en el select
      const medSelect = document.getElementById('reminder-med');
      const meds = getMeds();
      medSelect.innerHTML = '<option value="">Seleccionar medicamento</option>';
      meds.forEach(med => {
        medSelect.innerHTML += `<option value="${med.id}">${med.name}</option>`;
      });
      
      // Cargar recordatorios existentes
      loadReminders();
      
      modal.show();
    });
  }
  
  // Event listener para el botón de logros
  const achievementsBtn = document.getElementById('achievements-btn');
  if (achievementsBtn) {
    achievementsBtn.addEventListener('click', function() {
      const modal = new bootstrap.Modal(document.getElementById('achievements-modal'));
      
      // Configurar event listeners para las pestañas del modal
      setTimeout(() => {
        setupAchievementsModalEvents();
      }, 100);
      
      modal.show();
    });
  }
  
  // Event listener para el botón de compartir
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function() {
      const modal = new bootstrap.Modal(document.getElementById('share-modal'));
      
      // Generar texto de la lista de medicamentos
      generateShareText();
      
      modal.show();
    });
  }
  
  // Event listener para el botón de tamaño de fuente
  const fontSizeBtn = document.getElementById('font-size-btn');
  if (fontSizeBtn) {
    fontSizeBtn.addEventListener('click', function() {
      showFontSizeModal();
    });
  }
});

// Función para cargar recordatorios
function loadReminders() {
  const remindersList = document.getElementById('reminders-list');
  const reminders = getReminders();
  
  if (reminders.length === 0) {
    remindersList.innerHTML = '<p class="text-muted">No hay recordatorios programados.</p>';
    return;
  }
  
  let html = '';
  reminders.forEach((reminder, index) => {
    const meds = getMeds();
    const med = meds.find(m => m.id === reminder.medId);
    const medName = med ? med.name : 'Medicamento no encontrado';
    
    html += `
      <div class="reminder-item mb-3 p-3 border rounded">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h6 class="mb-1">${medName}</h6>
            <p class="mb-1 text-muted">Hora: ${reminder.time}</p>
            <p class="mb-0 text-muted">Días: ${reminder.days.join(', ')}</p>
          </div>
          <button class="btn btn-sm btn-danger" onclick="deleteReminder(${index})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;
  });
  
  remindersList.innerHTML = html;
}

// Función para eliminar recordatorio
function deleteReminder(index) {
  const reminders = getReminders();
  reminders.splice(index, 1);
  saveReminders(reminders);
  loadReminders();
  showNotification('Recordatorio eliminado', 'success');
}

// Event listener para el formulario de recordatorios
document.addEventListener('DOMContentLoaded', function() {
  const reminderForm = document.getElementById('reminder-form');
  if (reminderForm) {
    reminderForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const medId = document.getElementById('reminder-med').value;
      const time = document.getElementById('reminder-time').value;
      
      if (!medId || !time) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
      }
      
      // Obtener días seleccionados
      const days = [];
      const dayCheckboxes = document.querySelectorAll('input[id^="day-"]:checked');
      dayCheckboxes.forEach(checkbox => {
        days.push(parseInt(checkbox.value));
      });
      
      if (days.length === 0) {
        showNotification('Selecciona al menos un día', 'error');
        return;
      }
      
      const reminder = {
        id: Date.now().toString(),
        medId: medId,
        time: time,
        days: days,
        active: true
      };
      
      const reminders = getReminders();
      reminders.push(reminder);
      saveReminders(reminders);
      
      reminderForm.reset();
      loadReminders();
      showNotification('Recordatorio creado exitosamente', 'success');
    });
  }
  
  // Event listener para el formulario de metas
  const goalsForm = document.getElementById('goals-form');
  if (goalsForm) {
    goalsForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const title = document.getElementById('goal-title').value;
      const description = document.getElementById('goal-description').value;
      const deadline = document.getElementById('goal-deadline').value;
      
      if (!title) {
        showNotification('Por favor ingresa un título para la meta', 'error');
        return;
      }
      
      const goal = {
        id: Date.now().toString(),
        title: title,
        description: description,
        deadline: deadline,
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      const goals = getGoals();
      goals.push(goal);
      saveGoals(goals);
      
      goalsForm.reset();
      showNotification('Meta agregada exitosamente', 'success');
      
      // Recargar la lista de metas si estamos en esa pestaña
      if (document.getElementById('goals-content').classList.contains('active')) {
        loadGoalsList();
      }
    });
  }
  
  // Event listener para limpiar formulario de metas
  const clearGoalFormBtn = document.getElementById('clear-goal-form');
  if (clearGoalFormBtn) {
    clearGoalFormBtn.addEventListener('click', function() {
      document.getElementById('goals-form').reset();
      showNotification('Formulario limpiado', 'info');
    });
  }
  
  // Event listener para actualizar lista de metas
  const refreshGoalsBtn = document.getElementById('refresh-goals-btn');
  if (refreshGoalsBtn) {
    refreshGoalsBtn.addEventListener('click', function() {
      loadGoalsList();
      showNotification('Lista de metas actualizada', 'success');
    });
  }
  
  // Event listeners para las pestañas del modal de logros
  document.addEventListener('DOMContentLoaded', function() {
    setupAchievementsModalEvents();
  });
});

// Función para configurar los event listeners del modal de logros
function setupAchievementsModalEvents() {
  console.log('🔧 Configurando event listeners del modal de logros...');
  
  // Event listener para la pestaña de metas
  const goalsTab = document.getElementById('goals-tab');
  if (goalsTab) {
    goalsTab.addEventListener('click', function() {
      console.log('🎯 Pestaña de metas clickeada');
      // Cargar metas cuando se hace clic en la pestaña
      setTimeout(() => {
        loadGoalsList();
        console.log('✅ Lista de metas cargada');
      }, 200);
    });
  }
  
  // Event listener para la pestaña de nueva meta
  const addGoalTab = document.getElementById('add-goal-tab');
  if (addGoalTab) {
    addGoalTab.addEventListener('click', function() {
      console.log('🎯 Pestaña de nueva meta clickeada');
      // Limpiar formulario cuando se hace clic en la pestaña
      const form = document.getElementById('goals-form');
      if (form) {
        form.reset();
        console.log('✅ Formulario limpiado');
      }
    });
  }
  
  // Event listener para el botón de actualizar metas
  const refreshGoalsBtn = document.getElementById('refresh-goals-btn');
  if (refreshGoalsBtn) {
    refreshGoalsBtn.addEventListener('click', function() {
      console.log('🎯 Botón actualizar metas clickeado');
      loadGoalsList();
      showNotification('Lista de metas actualizada', 'success');
    });
  }
  
  // Event listener para limpiar formulario de metas
  const clearGoalFormBtn = document.getElementById('clear-goal-form');
  if (clearGoalFormBtn) {
    clearGoalFormBtn.addEventListener('click', function() {
      console.log('🎯 Botón limpiar formulario clickeado');
      const form = document.getElementById('goals-form');
      if (form) {
        form.reset();
        showNotification('Formulario limpiado', 'info');
      }
    });
  }
  
  console.log('✅ Event listeners del modal de logros configurados');
}

// --- Funcionalidad de compartir lista de medicamentos ---

// Función para generar texto de la lista de medicamentos
function generateShareText() {
  const meds = getMeds();
  const currentUser = getCurrentUser();
  const currentDate = new Date().toLocaleDateString('es-ES');
  
  let shareText = `LISTA DE MEDICAMENTOS\n`;
  shareText += `Paciente: ${currentUser}\n`;
  shareText += `Fecha: ${currentDate}\n`;
  shareText += `Generado desde MediSafe\n\n`;
  
  if (meds.length === 0) {
    shareText += `No hay medicamentos registrados.\n`;
  } else {
    shareText += `MEDICAMENTOS:\n`;
    shareText += `================\n\n`;
    
    meds.forEach((med, index) => {
      const days = daysToExpiry(med.expiry);
      let expiryStatus = '';
      
      if (days !== null) {
        if (days < 0) {
          expiryStatus = ' (VENCIDO)';
        } else if (days <= 7) {
          expiryStatus = ` (Caduca en ${days} días)`;
        }
      }
      
      shareText += `${index + 1}. ${med.name}\n`;
      shareText += `   Dosis: ${med.dose}\n`;
      shareText += `   Frecuencia: ${med.freq}\n`;
      shareText += `   Horario: ${formatTimeToAMPM(med.time)}\n`;
      shareText += `   Caducidad: ${med.expiry || 'No especificada'}${expiryStatus}\n`;
      if (med.notes) {
        shareText += `   Notas: ${med.notes}\n`;
      }
      shareText += `\n`;
    });
  }
  
  shareText += `\n---\n`;
  shareText += `Esta información fue generada automáticamente desde MediSafe.\n`;
  shareText += `Por favor, consulta con un profesional de la salud antes de tomar cualquier decisión médica.`;
  
  document.getElementById('share-text').value = shareText;
}

// Agregar función para compartir por WhatsApp
function shareViaWhatsApp() {
  const shareText = document.getElementById('share-text').value;
  
  if (!shareText || shareText.trim() === '') {
    showNotification('❌ No hay contenido para compartir', 'error');
    return;
  }
  
  // Codificar el texto para WhatsApp
  const encodedText = encodeURIComponent(shareText);
  
  // Crear URL de WhatsApp Web
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  
  // Abrir WhatsApp en nueva ventana
  window.open(whatsappUrl, '_blank');
  
  showNotification('✅ Abriendo WhatsApp para compartir', 'success');
}

// Event listener para copiar al portapapeles
document.addEventListener('DOMContentLoaded', function() {
  const copyShareBtn = document.getElementById('copy-share');
  if (copyShareBtn) {
    copyShareBtn.addEventListener('click', function() {
      const shareText = document.getElementById('share-text');
      shareText.select();
      
      try {
        document.execCommand('copy');
        showNotification('✅ Lista copiada al portapapeles', 'success');
      } catch (err) {
        // Fallback para navegadores modernos
        navigator.clipboard.writeText(shareText.value).then(function() {
          showNotification('✅ Lista copiada al portapapeles', 'success');
        }).catch(function() {
          showNotification('❌ Error al copiar al portapapeles', 'error');
        });
      }
    });
  }
  
  // Event listener para descargar PDF
  const downloadPdfBtn = document.getElementById('download-pdf');
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', function() {
      downloadAsPDF();
    });
  }
  
  // Event listener para descargar Word
  const downloadWordBtn = document.getElementById('download-word');
  if (downloadWordBtn) {
    downloadWordBtn.addEventListener('click', function() {
      downloadAsWord();
    });
  }
  
  // Event listener para descargar Excel
  const downloadExcelBtn = document.getElementById('download-excel');
  if (downloadExcelBtn) {
    downloadExcelBtn.addEventListener('click', function() {
      downloadAsExcel();
    });
  }
  
  // Event listener para el botón de WhatsApp
  const whatsappShareBtn = document.getElementById('whatsapp-share');
  if (whatsappShareBtn) {
    whatsappShareBtn.addEventListener('click', function() {
      shareViaWhatsApp();
    });
  }

});

// Función para descargar como PDF
function downloadAsPDF() {
  const meds = getMeds();
  const currentUser = getCurrentUser();
  const currentDate = new Date().toLocaleDateString('es-ES');
  
  // Crear nuevo documento PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Configurar fuente y tamaño
  doc.setFont('helvetica');
  doc.setFontSize(16);
  
  // Título
  doc.text('Lista de Medicamentos', 105, 20, { align: 'center' });
  
  // Información del paciente
  doc.setFontSize(12);
  doc.text(`Paciente: ${currentUser}`, 20, 35);
  doc.text(`Fecha: ${currentDate}`, 20, 45);
  
  if (meds.length === 0) {
    doc.text('No hay medicamentos registrados.', 20, 60);
  } else {
    // Preparar datos para la tabla
    const tableData = [];
    meds.forEach((med, index) => {
      const days = daysToExpiry(med.expiry);
      let expiryStatus = '';
      
      if (days !== null) {
        if (days < 0) {
          expiryStatus = 'VENCIDO';
        } else if (days <= 7) {
          expiryStatus = `Caduca en ${days} días`;
        } else {
          expiryStatus = 'Válido';
        }
      }
      
      tableData.push([
        index + 1,
        med.name,
        med.dose,
        med.freq,
        formatTimeToAMPM(med.time),
        med.expiry || 'No especificada',
        expiryStatus,
        med.notes || ''
      ]);
    });
    
    // Crear tabla
    doc.autoTable({
      startY: 60,
      head: [['#', 'Medicamento', 'Dosis', 'Frecuencia', 'Horario', 'Caducidad', 'Estado', 'Notas']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [40, 167, 69] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 20 },
        7: { cellWidth: 35 }
      }
    });
  }
  
  // Pie de página
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.text('Generado desde MediSafe', 105, pageHeight - 20, { align: 'center' });
  doc.text('Consulta con un profesional de la salud antes de tomar cualquier decisión médica.', 105, pageHeight - 15, { align: 'center' });
  
  // Descargar archivo
  doc.save(`medicamentos_${currentUser}_${currentDate.replace(/\//g, '-')}.pdf`);
  showNotification('✅ Lista descargada como PDF', 'success');
}

// Función para descargar como Word (DOCX)
function downloadAsWord() {
  const meds = getMeds();
  const currentUser = getCurrentUser();
  const currentDate = new Date().toLocaleDateString('es-ES');
  
  // Crear contenido HTML para Word
  let htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Lista de Medicamentos</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #28a745; color: white; }
        .expired { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Lista de Medicamentos</h1>
        <p><strong>Paciente:</strong> ${currentUser}</p>
        <p><strong>Fecha:</strong> ${currentDate}</p>
      </div>
  `;
  
  if (meds.length === 0) {
    htmlContent += `<p>No hay medicamentos registrados.</p>`;
  } else {
    htmlContent += `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Medicamento</th>
            <th>Dosis</th>
            <th>Frecuencia</th>
            <th>Horario</th>
            <th>Caducidad</th>
            <th>Estado</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    meds.forEach((med, index) => {
      const days = daysToExpiry(med.expiry);
      let expiryClass = '';
      let expiryStatus = '';
      
      if (days !== null) {
        if (days < 0) {
          expiryClass = 'expired';
          expiryStatus = 'VENCIDO';
        } else if (days <= 7) {
          expiryClass = 'warning';
          expiryStatus = `Caduca en ${days} días`;
        } else {
          expiryStatus = 'Válido';
        }
      }
      
      htmlContent += `
        <tr>
          <td>${index + 1}</td>
          <td>${med.name}</td>
          <td>${med.dose}</td>
          <td>${med.freq}</td>
          <td>${formatTimeToAMPM(med.time)}</td>
          <td>${med.expiry || 'No especificada'}</td>
          <td class="${expiryClass}">${expiryStatus}</td>
          <td>${med.notes || ''}</td>
        </tr>
      `;
    });
    
    htmlContent += `
        </tbody>
      </table>
    `;
  }
  
  htmlContent += `
      <div class="footer">
        <p>Generado desde MediSafe</p>
        <p>Consulta con un profesional de la salud antes de tomar cualquier decisión médica.</p>
      </div>
    </body>
    </html>
  `;
  
  // Crear blob y descargar
  const blob = new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `medicamentos_${currentUser}_${currentDate.replace(/\//g, '-')}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification('✅ Lista descargada como documento Word', 'success');
}

// Función para descargar como Excel
function downloadAsExcel() {
  const meds = getMeds();
  const currentUser = getCurrentUser();
  const currentDate = new Date().toLocaleDateString('es-ES');
  
  // Crear workbook y worksheet
  const wb = XLSX.utils.book_new();
  
  // Preparar datos para Excel
  const excelData = [
    ['Lista de Medicamentos'],
    [''],
    ['Paciente:', currentUser],
    ['Fecha:', currentDate],
    [''],
    ['#', 'Medicamento', 'Dosis', 'Frecuencia', 'Horario', 'Caducidad', 'Estado', 'Notas']
  ];
  
  if (meds.length === 0) {
    excelData.push(['No hay medicamentos registrados']);
  } else {
    meds.forEach((med, index) => {
      const days = daysToExpiry(med.expiry);
      let expiryStatus = '';
      
      if (days !== null) {
        if (days < 0) {
          expiryStatus = 'VENCIDO';
        } else if (days <= 7) {
          expiryStatus = `Caduca en ${days} días`;
        } else {
          expiryStatus = 'Válido';
        }
      }
      
      excelData.push([
        index + 1,
        med.name,
        med.dose,
        med.freq,
        formatTimeToAMPM(med.time),
        med.expiry || 'No especificada',
        expiryStatus,
        med.notes || ''
      ]);
    });
  }
  
  // Crear worksheet
  const ws = XLSX.utils.aoa_to_sheet(excelData);
  
  // Configurar estilos y formato
  ws['!cols'] = [
    { width: 5 },   // #
    { width: 30 },  // Medicamento
    { width: 20 },  // Dosis
    { width: 20 },  // Frecuencia
    { width: 15 },  // Horario
    { width: 15 },  // Caducidad
    { width: 15 },  // Estado
    { width: 40 }   // Notas
  ];
  
  // Agregar worksheet al workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Medicamentos');
  
  // Descargar archivo
  XLSX.writeFile(wb, `medicamentos_${currentUser}_${currentDate.replace(/\//g, '-')}.xlsx`);
  showNotification('✅ Lista descargada como archivo Excel', 'success');
}



// Función para cerrar el modal de compartir
function closeShareModal() {
  const modal = bootstrap.Modal.getInstance(document.getElementById('share-modal'));
  if (modal) {
    modal.hide();
  }
}

// --- Funciones para manejar metas personales ---

// Función para cargar la lista de metas
function loadGoalsList() {
  const goalsList = document.getElementById('goals-list');
  if (!goalsList) return;
  
  const goals = getGoals();
  
  if (goals.length === 0) {
    goalsList.innerHTML = `
      <div class="goal-empty-state">
        <i class="bi bi-target"></i>
        <h6>No tienes metas creadas</h6>
        <p>Haz clic en "Nueva Meta" para crear tu primera meta personal</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  goals.forEach((goal, index) => {
    const goalStatus = getGoalStatus(goal);
    const daysUntilDeadline = getDaysUntilDeadline(goal.deadline);
    
    html += `
      <div class="goal-item ${goalStatus.class}">
        <div class="goal-header">
          <div class="goal-title">${goal.title}</div>
          <span class="goal-status ${goalStatus.status}">${goalStatus.text}</span>
        </div>
        ${goal.description ? `<div class="goal-description">${goal.description}</div>` : ''}
        <div class="goal-meta">
          <div class="goal-deadline ${goalStatus.deadlineClass}">
            <i class="bi bi-calendar-event"></i>
            ${goal.deadline ? `Fecha límite: ${formatDate(goal.deadline)}` : 'Sin fecha límite'}
            ${daysUntilDeadline !== null ? ` (${formatDaysUntilDeadline(daysUntilDeadline)})` : ''}
          </div>
          <div>
            <i class="bi bi-clock"></i>
            Creada: ${formatDate(goal.createdAt)}
          </div>
        </div>
        <div class="goal-actions">
          <button class="btn btn-sm btn-success" onclick="toggleGoalCompletion('${goal.id}')">
            <i class="bi bi-check-circle me-1"></i>
            ${goal.completed ? 'Desmarcar' : 'Completar'}
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteGoal('${goal.id}')">
            <i class="bi bi-trash me-1"></i>
            Eliminar
          </button>
          <button class="btn btn-sm btn-info" onclick="editGoal('${goal.id}')">
            <i class="bi bi-pencil me-1"></i>
            Editar
          </button>
        </div>
      </div>
    `;
  });
  
  goalsList.innerHTML = html;
}

// Función para obtener el estado de una meta
function getGoalStatus(goal) {
  if (goal.completed) {
    return {
      class: 'completed',
      status: 'completed',
      text: 'Completada',
      deadlineClass: ''
    };
  }
  
  if (!goal.deadline) {
    return {
      class: '',
      status: 'pending',
      text: 'Pendiente',
      deadlineClass: ''
    };
  }
  
  const daysUntilDeadline = getDaysUntilDeadline(goal.deadline);
  
  if (daysUntilDeadline === null) {
    return {
      class: '',
      status: 'pending',
      text: 'Pendiente',
      deadlineClass: ''
    };
  }
  
  if (daysUntilDeadline < 0) {
    return {
      class: 'overdue',
      status: 'overdue',
      text: 'Vencida',
      deadlineClass: 'overdue'
    };
  }
  
  if (daysUntilDeadline <= 3) {
    return {
      class: 'urgent',
      status: 'pending',
      text: 'Urgente',
      deadlineClass: 'urgent'
    };
  }
  
  return {
    class: '',
    status: 'pending',
    text: 'Pendiente',
    deadlineClass: ''
  };
}

// Función para obtener días hasta la fecha límite
function getDaysUntilDeadline(deadline) {
  if (!deadline) return null;
  
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Función para formatear días hasta la fecha límite
function formatDaysUntilDeadline(days) {
  if (days < 0) {
    return `${Math.abs(days)} días vencida`;
  } else if (days === 0) {
    return 'Vence hoy';
  } else if (days === 1) {
    return 'Vence mañana';
  } else {
    return `${days} días restantes`;
  }
}

// Función para formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Función para alternar el estado de completado de una meta
function toggleGoalCompletion(goalId) {
  const goals = getGoals();
  const goalIndex = goals.findIndex(g => g.id === goalId);
  
  if (goalIndex === -1) {
    showNotification('Meta no encontrada', 'error');
    return;
  }
  
  goals[goalIndex].completed = !goals[goalIndex].completed;
  
  if (goals[goalIndex].completed) {
    goals[goalIndex].completedAt = new Date().toISOString();
  } else {
    delete goals[goalIndex].completedAt;
  }
  
  saveGoals(goals);
  loadGoalsList();
  
  const status = goals[goalIndex].completed ? 'completada' : 'marcada como pendiente';
  showNotification(`Meta "${goals[goalIndex].title}" ${status}`, 'success');
}

// Función para eliminar una meta
function deleteGoal(goalId) {
  const goals = getGoals();
  const goalIndex = goals.findIndex(g => g.id === goalId);
  
  if (goalIndex === -1) {
    showNotification('Meta no encontrada', 'error');
    return;
  }
  
  const goalTitle = goals[goalIndex].title;
  
  if (confirm(`¿Estás seguro de que quieres eliminar la meta "${goalTitle}"?`)) {
    goals.splice(goalIndex, 1);
    saveGoals(goals);
    loadGoalsList();
    showNotification(`Meta "${goalTitle}" eliminada`, 'success');
  }
}

// Función para editar una meta
function editGoal(goalId) {
  const goals = getGoals();
  const goal = goals.find(g => g.id === goalId);
  
  if (!goal) {
    showNotification('Meta no encontrada', 'error');
    return;
  }
  
  // Llenar el formulario con los datos de la meta
  document.getElementById('goal-title').value = goal.title;
  document.getElementById('goal-description').value = goal.description || '';
  document.getElementById('goal-deadline').value = goal.deadline || '';
  
  // Cambiar a la pestaña de nueva meta
  const addGoalTab = document.getElementById('add-goal-tab');
  if (addGoalTab) {
    const tab = new bootstrap.Tab(addGoalTab);
    tab.show();
  }
  
  // Cambiar el texto del botón
  const submitBtn = document.querySelector('#goals-form button[type="submit"]');
  if (submitBtn) {
    submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Actualizar Meta';
    submitBtn.classList.remove('btn-success');
    submitBtn.classList.add('btn-warning');
  }
  
  // Modificar el event listener del formulario para actualizar en lugar de crear
  const form = document.getElementById('goals-form');
  const originalSubmitHandler = form.onsubmit;
  
  form.onsubmit = function(e) {
    e.preventDefault();
    
    const title = document.getElementById('goal-title').value;
    const description = document.getElementById('goal-description').value;
    const deadline = document.getElementById('goal-deadline').value;
    
    if (!title) {
      showNotification('Por favor ingresa un título para la meta', 'error');
      return;
    }
    
    // Actualizar la meta existente
    goal.title = title;
    goal.description = description;
    goal.deadline = deadline;
    
    saveGoals(goals);
    loadGoalsList();
    
    // Restaurar el formulario y el event listener original
    form.reset();
    form.onsubmit = originalSubmitHandler;
    
    // Restaurar el botón
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Crear Meta';
      submitBtn.classList.remove('btn-warning');
      submitBtn.classList.add('btn-success');
    }
    
    showNotification(`Meta "${goal.title}" actualizada exitosamente`, 'success');
  };
}

// Funciones para restablecimiento de contraseña REAL
let verificationCode = null;
let codeExpiration = null;



// Configuración de EmailJS para envío real de emails
// Inicializar EmailJS cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Inicializando sistema de restablecimiento de contraseña...');
  
  // Verificar si EmailJS está disponible
  if (typeof emailjs !== 'undefined') {
    console.log('✅ EmailJS está cargado');
  } else {
    console.warn('⚠️ EmailJS no está cargado');
  }
  
  // Inicializar EmailJS con configuración
  if (typeof initializeEmailJS === 'function') {
    const initialized = initializeEmailJS();
    if (initialized) {
      console.log('✅ EmailJS inicializado correctamente');
    } else {
      console.log('⚠️ EmailJS no pudo inicializarse - usando modo de demostración');
    }
  } else {
    console.log('⚠️ Función initializeEmailJS no disponible');
  }
  
  // Probar configuración
  if (typeof testEmailJSConfiguration === 'function') {
    testEmailJSConfiguration();
  }
  
  console.log('✅ Sistema de restablecimiento de contraseña inicializado');
});

// --- Sistema de Notificaciones de Recordatorios ---

// Variable global para el verificador de recordatorios
let reminderChecker = null;
let lastNotificationTime = {};

// Función para iniciar el verificador de recordatorios
function startReminderChecker() {
  console.log('🔔 Iniciando verificador de recordatorios...');
  
  // Detener verificador existente si hay uno
  if (reminderChecker) {
    clearInterval(reminderChecker);
  }
  
  // Verificar cada minuto
  reminderChecker = setInterval(checkReminders, 60000); // 60000ms = 1 minuto
  
  // Verificar inmediatamente al iniciar
  checkReminders();
  
  console.log('✅ Verificador de recordatorios iniciado');
}

// Función para detener el verificador de recordatorios
function stopReminderChecker() {
  if (reminderChecker) {
    clearInterval(reminderChecker);
    reminderChecker = null;
    console.log('🛑 Verificador de recordatorios detenido');
  }
}

// Función principal para verificar recordatorios
function checkReminders() {
  const reminders = getReminders();
  const meds = getMeds();
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Tiempo en minutos
  
  console.log('🔍 Verificando recordatorios...', {
    totalReminders: reminders.length,
    currentDay: currentDay,
    currentTime: currentTime
  });
  
  reminders.forEach(reminder => {
    if (!reminder.active) return;
    
    // Verificar si es el día correcto
    if (!reminder.days.includes(currentDay)) return;
    
    // Obtener información del medicamento
    const med = meds.find(m => m.id === reminder.medId);
    if (!med) return;
    
    // Convertir hora del recordatorio a minutos
    const [reminderHour, reminderMinute] = reminder.time.split(':').map(Number);
    const reminderTime = reminderHour * 60 + reminderMinute;
    
    // Calcular diferencia de tiempo
    const timeDiff = currentTime - reminderTime;
    
    // Verificar si es hora de tomar el medicamento (con tolerancia de 5 minutos)
    if (timeDiff >= 0 && timeDiff <= 5) {
      showReminderNotification(med, reminder, 'due');
    }
    // Verificar si se pasó la hora (más de 5 minutos)
    else if (timeDiff > 5 && timeDiff <= 60) { // Hasta 1 hora después
      showReminderNotification(med, reminder, 'overdue');
    }
    // Verificar si se pasó mucho tiempo (más de 1 hora)
    else if (timeDiff > 60) {
      showReminderNotification(med, reminder, 'very-overdue');
    }
  });
}

// Función para mostrar notificación de recordatorio
function showReminderNotification(med, reminder, status) {
  const reminderKey = `${reminder.id}-${reminder.time}`;
  const now = new Date();
  const lastNotification = lastNotificationTime[reminderKey];
  
  // Evitar notificaciones duplicadas (máximo una cada 5 minutos)
  if (lastNotification && (now - lastNotification) < 300000) { // 5 minutos
    return;
  }
  
  let title, message, type, icon;
  
  switch (status) {
    case 'due':
      title = '⏰ Hora de tomar tu medicamento';
      message = `Es hora de tomar ${med.name} (${med.dose})`;
      type = 'warning';
      icon = '⏰';
      break;
      
    case 'overdue':
      title = '⚠️ Medicamento pendiente';
      message = `Se pasó la hora de tomar ${med.name} (${med.dose})`;
      type = 'error';
      icon = '⚠️';
      break;
      
    case 'very-overdue':
      title = '🚨 Medicamento muy retrasado';
      message = `Hace más de una hora que deberías haber tomado ${med.name} (${med.dose})`;
      type = 'error';
      icon = '🚨';
      break;
  }
  
  // Mostrar notificación en pantalla
  showNotification(`${icon} ${title}\n${message}`, type);
  
  // Mostrar notificación del navegador si está disponible
  showBrowserNotification(title, message);
  
  // Registrar tiempo de la notificación
  lastNotificationTime[reminderKey] = now;
  
  console.log('🔔 Notificación de recordatorio mostrada:', {
    medicamento: med.name,
    status: status,
    hora: reminder.time
  });
}

// Función para mostrar notificación del navegador
function showBrowserNotification(title, message) {
  // Verificar si las notificaciones están disponibles
  if (!('Notification' in window)) {
    console.log('❌ Notificaciones del navegador no disponibles');
    return;
  }
  
  // Verificar si tenemos permiso
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/favicon.ico', // Icono de la aplicación
      badge: '/favicon.ico',
      tag: 'medication-reminder',
      requireInteraction: true, // La notificación no se cierra automáticamente
      actions: [
        {
          action: 'take',
          title: '✅ Tomar Medicamento'
        },
        {
          action: 'snooze',
          title: '⏰ Recordar en 10 min'
        }
      ]
    });
  } else if (Notification.permission !== 'denied') {
    // Solicitar permiso
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showBrowserNotification(title, message);
      }
    });
  }
}

// Función para marcar recordatorio como tomado
function markReminderAsTaken(reminderId) {
  const reminders = getReminders();
  const reminder = reminders.find(r => r.id === reminderId);
  
  if (reminder) {
    // Agregar timestamp de cuando se tomó
    reminder.lastTaken = new Date().toISOString();
    saveReminders(reminders);
    
    showNotification('✅ Medicamento marcado como tomado', 'success');
    console.log('✅ Recordatorio marcado como tomado:', reminderId);
  }
}

// Función para posponer recordatorio
function snoozeReminder(reminderId) {
  const reminders = getReminders();
  const reminder = reminders.find(r => r.id === reminderId);
  
  if (reminder) {
    // Agregar timestamp de posposición
    reminder.snoozedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutos
    saveReminders(reminders);
    
    showNotification('⏰ Recordatorio pospuesto por 10 minutos', 'info');
    console.log('⏰ Recordatorio pospuesto:', reminderId);
  }
}

// Función para obtener estadísticas de recordatorios
function getReminderStats() {
  const reminders = getReminders();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let totalReminders = 0;
  let takenReminders = 0;
  let overdueReminders = 0;
  
  reminders.forEach(reminder => {
    if (!reminder.active) return;
    
    const med = getMeds().find(m => m.id === reminder.medId);
    if (!med) return;
    
    // Contar recordatorios de hoy
    if (reminder.days.includes(now.getDay())) {
      totalReminders++;
      
      // Verificar si se tomó hoy
      if (reminder.lastTaken) {
        const takenDate = new Date(reminder.lastTaken);
        if (takenDate >= today) {
          takenReminders++;
        }
      }
      
      // Verificar si está retrasado
      const [reminderHour, reminderMinute] = reminder.time.split(':').map(Number);
      const reminderTime = new Date(today);
      reminderTime.setHours(reminderHour, reminderMinute, 0, 0);
      
      if (now > reminderTime && !reminder.lastTaken) {
        overdueReminders++;
      }
    }
  });
  
  return {
    total: totalReminders,
    taken: takenReminders,
    overdue: overdueReminders,
    compliance: totalReminders > 0 ? Math.round((takenReminders / totalReminders) * 100) : 0
  };
}

// Event listener para solicitar permisos de notificación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  // Solicitar permisos de notificación si no están configurados
  if ('Notification' in window && Notification.permission === 'default') {
    console.log('🔔 Solicitando permisos de notificación...');
    Notification.requestPermission();
  }
  
  // Iniciar verificador de recordatorios cuando se muestra la aplicación
  if (getCurrentUser()) {
    startReminderChecker();
  }
});

// Event listener para manejar clics en notificaciones del navegador
if ('Notification' in window) {
  navigator.serviceWorker?.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'notification-click') {
      const action = event.data.action;
      const reminderId = event.data.reminderId;
      
      if (action === 'take') {
        markReminderAsTaken(reminderId);
      } else if (action === 'snooze') {
        snoozeReminder(reminderId);
      }
    }
  });
}