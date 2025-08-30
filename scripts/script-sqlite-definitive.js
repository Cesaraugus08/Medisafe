// MediSafe SQLite Frontend - Conexión Definitiva
// Este script reemplaza completamente localStorage con SQLite

const API_BASE_URL = 'http://localhost:3000/api';

// Configuración de la aplicación
let currentUser = null;
let isAuthenticated = false;

// Funciones de utilidad
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

function debugLog(message) {
    console.log(`[MediSafe SQLite] ${message}`);
}

// Funciones de autenticación
async function registerUser(username, password, email) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, email })
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            isAuthenticated = true;
            showNotification('✅ Usuario registrado exitosamente', 'success');
            return true;
        } else {
            showNotification(`❌ Error: ${data.message}`, 'error');
            return false;
        }
    } catch (error) {
        debugLog(`Error en registro: ${error.message}`);
        showNotification('❌ Error de conexión con la base de datos', 'error');
        return false;
    }
}

async function loginUser(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            isAuthenticated = true;
            showNotification('✅ Inicio de sesión exitoso', 'success');
            return true;
        } else {
            showNotification(`❌ Error: ${data.message}`, 'error');
            return false;
        }
    } catch (error) {
        debugLog(`Error en login: ${error.message}`);
        showNotification('❌ Error de conexión con la base de datos', 'error');
        return false;
    }
}

function logoutUser() {
    localStorage.removeItem('token');
    currentUser = null;
    isAuthenticated = false;
    showNotification('👋 Sesión cerrada', 'info');
    window.location.reload();
}

// Funciones de medicamentos
async function getMedications() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('❌ No hay sesión activa', 'error');
            return [];
        }

        const response = await fetch(`${API_BASE_URL}/medications`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const medications = await response.json();
            debugLog(`Medicamentos obtenidos: ${medications.length}`);
            return medications;
        } else {
            showNotification('❌ Error al obtener medicamentos', 'error');
            return [];
        }
    } catch (error) {
        debugLog(`Error obteniendo medicamentos: ${error.message}`);
        showNotification('❌ Error de conexión', 'error');
        return [];
    }
}

async function saveMedication(medication) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('❌ No hay sesión activa', 'error');
            return false;
        }

        const response = await fetch(`${API_BASE_URL}/medications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(medication)
        });

        const data = await response.json();
        
        if (response.ok) {
            showNotification('✅ Medicamento guardado exitosamente', 'success');
            return true;
        } else {
            showNotification(`❌ Error: ${data.message}`, 'error');
            return false;
        }
    } catch (error) {
        debugLog(`Error guardando medicamento: ${error.message}`);
        showNotification('❌ Error de conexión', 'error');
        return false;
    }
}

async function updateMedication(id, medication) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('❌ No hay sesión activa', 'error');
            return false;
        }

        const response = await fetch(`${API_BASE_URL}/medications/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(medication)
        });

        const data = await response.json();
        
        if (response.ok) {
            showNotification('✅ Medicamento actualizado exitosamente', 'success');
            return true;
        } else {
            showNotification(`❌ Error: ${data.message}`, 'error');
            return false;
        }
    } catch (error) {
        debugLog(`Error actualizando medicamento: ${error.message}`);
        showNotification('❌ Error de conexión', 'error');
        return false;
    }
}

async function deleteMedication(id) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('❌ No hay sesión activa', 'error');
            return false;
        }

        const response = await fetch(`${API_BASE_URL}/medications/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showNotification('✅ Medicamento eliminado exitosamente', 'success');
            return true;
        } else {
            const data = await response.json();
            showNotification(`❌ Error: ${data.message}`, 'error');
            return false;
        }
    } catch (error) {
        debugLog(`Error eliminando medicamento: ${error.message}`);
        showNotification('❌ Error de conexión', 'error');
        return false;
    }
}

// Funciones de recordatorios
async function getReminders() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return [];
        }

        const response = await fetch(`${API_BASE_URL}/reminders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const reminders = await response.json();
            debugLog(`Recordatorios obtenidos: ${reminders.length}`);
            return reminders;
        } else {
            return [];
        }
    } catch (error) {
        debugLog(`Error obteniendo recordatorios: ${error.message}`);
        return [];
    }
}

async function saveReminder(reminder) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('❌ No hay sesión activa', 'error');
            return false;
        }

        const response = await fetch(`${API_BASE_URL}/reminders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reminder)
        });

        const data = await response.json();
        
        if (response.ok) {
            showNotification('✅ Recordatorio guardado exitosamente', 'success');
            return true;
        } else {
            showNotification(`❌ Error: ${data.message}`, 'error');
            return false;
        }
    } catch (error) {
        debugLog(`Error guardando recordatorio: ${error.message}`);
        showNotification('❌ Error de conexión', 'error');
        return false;
    }
}

// Funciones de metas
async function getGoals() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return [];
        }

        const response = await fetch(`${API_BASE_URL}/goals`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const goals = await response.json();
            debugLog(`Metas obtenidas: ${goals.length}`);
            return goals;
        } else {
            return [];
        }
    } catch (error) {
        debugLog(`Error obteniendo metas: ${error.message}`);
        return [];
    }
}

async function saveGoal(goal) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('❌ No hay sesión activa', 'error');
            return false;
        }

        const response = await fetch(`${API_BASE_URL}/goals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(goal)
        });

        const data = await response.json();
        
        if (response.ok) {
            showNotification('✅ Meta guardada exitosamente', 'success');
            return true;
        } else {
            showNotification(`❌ Error: ${data.message}`, 'error');
            return false;
        }
    } catch (error) {
        debugLog(`Error guardando meta: ${error.message}`);
        showNotification('❌ Error de conexión', 'error');
        return false;
    }
}

// Verificar conexión con el servidor
async function checkServerConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            debugLog('✅ Conexión con servidor SQLite establecida');
            return true;
        } else {
            debugLog('❌ Servidor no responde correctamente');
            return false;
        }
    } catch (error) {
        debugLog(`❌ Error de conexión: ${error.message}`);
        return false;
    }
}

// Inicialización de la aplicación
async function initializeApp() {
    debugLog('🚀 Inicializando MediSafe con SQLite...');
    
    // Verificar conexión
    const isConnected = await checkServerConnection();
    if (!isConnected) {
        showNotification('❌ No se puede conectar con la base de datos SQLite', 'error');
        return;
    }
    
    // Verificar token existente
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                currentUser = data.user;
                isAuthenticated = true;
                debugLog('✅ Sesión restaurada');
            } else {
                localStorage.removeItem('token');
                debugLog('❌ Token inválido, sesión cerrada');
            }
        } catch (error) {
            debugLog(`Error verificando token: ${error.message}`);
            localStorage.removeItem('token');
        }
    }
    
    debugLog('✅ Aplicación inicializada');
}

// Exportar funciones para uso global
window.MediSafeSQLite = {
    // Autenticación
    registerUser,
    loginUser,
    logoutUser,
    
    // Medicamentos
    getMedications,
    saveMedication,
    updateMedication,
    deleteMedication,
    
    // Recordatorios
    getReminders,
    saveReminder,
    
    // Metas
    getGoals,
    saveGoal,
    
    // Utilidades
    checkServerConnection,
    showNotification,
    debugLog,
    
    // Estado
    getCurrentUser: () => currentUser,
    isAuthenticated: () => isAuthenticated
};

// Inicializar cuando se carga el script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

debugLog('📦 Script SQLite cargado y listo'); 