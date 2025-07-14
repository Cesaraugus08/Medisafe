// Ejemplos de cómo usar fetch desde el cliente para conectar con la API MediSafe SQLite

const API_BASE_URL = 'http://localhost:3000/api';

// ===== EJEMPLOS DE AUTENTICACIÓN =====

// 1. Registrar un usuario
async function registerUser(username, password, email) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
                email: email
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Usuario registrado:', data.user);
            // Guardar el token en localStorage
            localStorage.setItem('token', data.token);
            return data;
        } else {
            const error = await response.json();
            console.error('❌ Error al registrar:', error);
            throw new Error(error.error);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        throw error;
    }
}

// 2. Iniciar sesión
async function loginUser(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Login exitoso:', data.user);
            // Guardar el token en localStorage
            localStorage.setItem('token', data.token);
            return data;
        } else {
            const error = await response.json();
            console.error('❌ Error en login:', error);
            throw new Error(error.error);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        throw error;
    }
}

// 3. Verificar token
async function verifyToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No hay token disponible');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Token válido:', data.user);
            return data;
        } else {
            localStorage.removeItem('token');
            throw new Error('Token inválido');
        }
    } catch (error) {
        console.error('Error verificando token:', error);
        throw error;
    }
}

// ===== EJEMPLOS DE MEDICAMENTOS =====

// 4. Obtener medicamentos del usuario
async function getMedications() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No hay token disponible');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/medications`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const medications = await response.json();
            console.log('✅ Medicamentos obtenidos:', medications);
            return medications;
        } else {
            const error = await response.json();
            console.error('❌ Error obteniendo medicamentos:', error);
            throw new Error(error.error);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        throw error;
    }
}

// 5. Crear un medicamento
async function createMedication(medicationData) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No hay token disponible');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/medications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(medicationData)
        });

        if (response.ok) {
            const medication = await response.json();
            console.log('✅ Medicamento creado:', medication);
            return medication;
        } else {
            const error = await response.json();
            console.error('❌ Error creando medicamento:', error);
            throw new Error(error.error);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        throw error;
    }
}

// 6. Actualizar un medicamento
async function updateMedication(id, medicationData) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No hay token disponible');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/medications/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(medicationData)
        });

        if (response.ok) {
            const medication = await response.json();
            console.log('✅ Medicamento actualizado:', medication);
            return medication;
        } else {
            const error = await response.json();
            console.error('❌ Error actualizando medicamento:', error);
            throw new Error(error.error);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        throw error;
    }
}

// 7. Eliminar un medicamento
async function deleteMedication(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No hay token disponible');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/medications/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            console.log('✅ Medicamento eliminado');
            return true;
        } else {
            const error = await response.json();
            console.error('❌ Error eliminando medicamento:', error);
            throw new Error(error.error);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        throw error;
    }
}

// ===== EJEMPLOS DE RECORDATORIOS =====

// 8. Obtener recordatorios
async function getReminders() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No hay token disponible');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/reminders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const reminders = await response.json();
            console.log('✅ Recordatorios obtenidos:', reminders);
            return reminders;
        } else {
            const error = await response.json();
            console.error('❌ Error obteniendo recordatorios:', error);
            throw new Error(error.error);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        throw error;
    }
}

// 9. Crear recordatorio
async function createReminder(reminderData) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No hay token disponible');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/reminders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reminderData)
        });

        if (response.ok) {
            const reminder = await response.json();
            console.log('✅ Recordatorio creado:', reminder);
            return reminder;
        } else {
            const error = await response.json();
            console.error('❌ Error creando recordatorio:', error);
            throw new Error(error.error);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        throw error;
    }
}

// ===== EJEMPLOS DE METAS =====

// 10. Obtener metas
async function getGoals() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No hay token disponible');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/goals`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const goals = await response.json();
            console.log('✅ Metas obtenidas:', goals);
            return goals;
        } else {
            const error = await response.json();
            console.error('❌ Error obteniendo metas:', error);
            throw new Error(error.error);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        throw error;
    }
}

// 11. Crear meta
async function createGoal(goalData) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No hay token disponible');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/goals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(goalData)
        });

        if (response.ok) {
            const goal = await response.json();
            console.log('✅ Meta creada:', goal);
            return goal;
        } else {
            const error = await response.json();
            console.error('❌ Error creando meta:', error);
            throw new Error(error.error);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        throw error;
    }
}

// ===== EJEMPLOS DE USO EN HTML =====

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
    
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

// Ejemplo de uso en formulario de login
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const result = await loginUser(username, password);
        showNotification('✅ Login exitoso', 'success');
        // Redirigir o actualizar la interfaz
        window.location.href = '/dashboard.html';
    } catch (error) {
        showNotification(`❌ Error: ${error.message}`, 'error');
    }
}

// Ejemplo de uso en formulario de medicamento
async function handleCreateMedication(event) {
    event.preventDefault();
    
    const medicationData = {
        name: document.getElementById('med-name').value,
        dose: document.getElementById('med-dose').value,
        frequency: document.getElementById('med-freq').value,
        time: document.getElementById('med-time').value,
        expiry_date: document.getElementById('med-expiry').value,
        notes: document.getElementById('med-notes').value
    };
    
    try {
        const result = await createMedication(medicationData);
        showNotification('✅ Medicamento creado exitosamente', 'success');
        // Limpiar formulario y actualizar lista
        event.target.reset();
        loadMedications();
    } catch (error) {
        showNotification(`❌ Error: ${error.message}`, 'error');
    }
}

// Ejemplo de carga de medicamentos
async function loadMedications() {
    try {
        const medications = await getMedications();
        const container = document.getElementById('medications-list');
        
        if (medications.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay medicamentos registrados.</p>';
            return;
        }
        
        let html = '<div class="list-group">';
        medications.forEach(med => {
            html += `
                <div class="list-group-item">
                    <h6 class="mb-1">${med.name}</h6>
                    <p class="mb-1">Dosis: ${med.dose} | Frecuencia: ${med.frequency} | Hora: ${med.time}</p>
                    <small class="text-muted">Caducidad: ${med.expiry_date}</small>
                    <button class="btn btn-sm btn-danger float-end" onclick="deleteMedication(${med.id})">Eliminar</button>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    } catch (error) {
        showNotification(`❌ Error cargando medicamentos: ${error.message}`, 'error');
    }
}

// Exportar funciones para uso global
window.MediSafeAPI = {
    // Autenticación
    registerUser,
    loginUser,
    verifyToken,
    
    // Medicamentos
    getMedications,
    createMedication,
    updateMedication,
    deleteMedication,
    
    // Recordatorios
    getReminders,
    createReminder,
    
    // Metas
    getGoals,
    createGoal,
    
    // Utilidades
    showNotification,
    handleLogin,
    handleCreateMedication,
    loadMedications
};

console.log('📦 API Client cargado y listo para usar'); 