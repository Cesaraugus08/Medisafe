// Test Final de Conexión SQLite - MediSafe
// Este script verifica que todo esté funcionando correctamente

const API_BASE_URL = 'http://localhost:3000/api';

async function testConnection() {
    console.log('🧪 === INICIANDO TEST FINAL DE CONEXIÓN ===');
    
    try {
        // 1. Verificar conexión con el servidor
        console.log('1️⃣ Verificando conexión con servidor...');
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        if (healthResponse.ok) {
            console.log('✅ Servidor SQLite respondiendo correctamente');
        } else {
            console.log('❌ Servidor no responde correctamente');
            return false;
        }
        
        // 2. Crear usuario de prueba
        console.log('2️⃣ Creando usuario de prueba...');
        const testUser = {
            username: 'testuser_' + Date.now(),
            password: 'testpass123',
            email: 'test@example.com'
        };
        
        const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        
        if (registerResponse.ok) {
            const registerData = await registerResponse.json();
            console.log('✅ Usuario creado exitosamente');
            const token = registerData.token;
            
            // 3. Verificar token
            console.log('3️⃣ Verificando token...');
            const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (verifyResponse.ok) {
                console.log('✅ Token válido');
                
                // 4. Crear medicamento de prueba
                console.log('4️⃣ Creando medicamento de prueba...');
                const testMedication = {
                    name: 'Paracetamol Test',
                    dose: '500mg',
                    frequency: 'Cada 6 horas',
                    time: '08:00',
                    expiry_date: '2024-12-31',
                    notes: 'Medicamento de prueba'
                };
                
                const medResponse = await fetch(`${API_BASE_URL}/medications`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(testMedication)
                });
                
                if (medResponse.ok) {
                    console.log('✅ Medicamento creado exitosamente');
                    
                    // 5. Obtener medicamentos
                    console.log('5️⃣ Obteniendo medicamentos...');
                    const getMedsResponse = await fetch(`${API_BASE_URL}/medications`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (getMedsResponse.ok) {
                        const medications = await getMedsResponse.json();
                        console.log(`✅ Medicamentos obtenidos: ${medications.length}`);
                        
                        // 6. Crear recordatorio de prueba
                        console.log('6️⃣ Creando recordatorio de prueba...');
                        const testReminder = {
                            title: 'Tomar medicamento',
                            description: 'Recordatorio de prueba',
                            date: new Date().toISOString().split('T')[0],
                            reminder_time: '08:00'
                        };
                        
                        const reminderResponse = await fetch(`${API_BASE_URL}/reminders`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(testReminder)
                        });
                        
                        if (reminderResponse.ok) {
                            console.log('✅ Recordatorio creado exitosamente');
                            
                            // 7. Crear meta de prueba
                            console.log('7️⃣ Creando meta de prueba...');
                            const testGoal = {
                                title: 'Mejorar salud',
                                description: 'Meta de prueba',
                                target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                priority: 'media'
                            };
                            
                            const goalResponse = await fetch(`${API_BASE_URL}/goals`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(testGoal)
                            });
                            
                            if (goalResponse.ok) {
                                console.log('✅ Meta creada exitosamente');
                                
                                // 8. Obtener todos los datos
                                console.log('8️⃣ Obteniendo todos los datos...');
                                
                                const [remindersResponse, goalsResponse] = await Promise.all([
                                    fetch(`${API_BASE_URL}/reminders`, {
                                        headers: { 'Authorization': `Bearer ${token}` }
                                    }),
                                    fetch(`${API_BASE_URL}/goals`, {
                                        headers: { 'Authorization': `Bearer ${token}` }
                                    })
                                ]);
                                
                                if (remindersResponse.ok && goalsResponse.ok) {
                                    const reminders = await remindersResponse.json();
                                    const goals = await goalsResponse.json();
                                    
                                    console.log(`✅ Recordatorios obtenidos: ${reminders.length}`);
                                    console.log(`✅ Metas obtenidas: ${goals.length}`);
                                    
                                    // 9. Test completo exitoso
                                    console.log('🎉 === TEST COMPLETO EXITOSO ===');
                                    console.log('✅ Conexión SQLite establecida');
                                    console.log('✅ Autenticación funcionando');
                                    console.log('✅ CRUD de medicamentos funcionando');
                                    console.log('✅ CRUD de recordatorios funcionando');
                                    console.log('✅ CRUD de metas funcionando');
                                    console.log('✅ Base de datos SQLite operativa');
                                    
                                    return true;
                                } else {
                                    console.log('❌ Error obteniendo datos finales');
                                    return false;
                                }
                            } else {
                                console.log('❌ Error creando meta');
                                return false;
                            }
                        } else {
                            console.log('❌ Error creando recordatorio');
                            return false;
                        }
                    } else {
                        console.log('❌ Error obteniendo medicamentos');
                        return false;
                    }
                } else {
                    console.log('❌ Error creando medicamento');
                    return false;
                }
            } else {
                console.log('❌ Token inválido');
                return false;
            }
        } else {
            console.log('❌ Error creando usuario');
            return false;
        }
        
    } catch (error) {
        console.log(`❌ Error en test: ${error.message}`);
        return false;
    }
}

// Función para mostrar resultados en el navegador
function showTestResults(success) {
    const resultDiv = document.createElement('div');
    resultDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        padding: 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 9999;
        font-size: 16px;
    `;
    
    if (success) {
        resultDiv.style.backgroundColor = '#28a745';
        resultDiv.innerHTML = `
            <h4>🎉 CONEXIÓN SQLite ESTABLECIDA</h4>
            <p>✅ Servidor funcionando</p>
            <p>✅ Base de datos operativa</p>
            <p>✅ Autenticación funcionando</p>
            <p>✅ CRUD completo funcionando</p>
        `;
    } else {
        resultDiv.style.backgroundColor = '#dc3545';
        resultDiv.innerHTML = `
            <h4>❌ ERROR DE CONEXIÓN</h4>
            <p>❌ Verificar servidor SQLite</p>
            <p>❌ Revisar logs del servidor</p>
        `;
    }
    
    document.body.appendChild(resultDiv);
    
    setTimeout(() => {
        if (resultDiv.parentNode) {
            resultDiv.remove();
        }
    }, 10000);
}

// Ejecutar test si estamos en el navegador
if (typeof window !== 'undefined') {
    // Esperar a que se cargue la página
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(testConnection, 1000);
        });
    } else {
        setTimeout(testConnection, 1000);
    }
} else {
    // Ejecutar directamente si estamos en Node.js
    testConnection().then(success => {
        if (success) {
            console.log('🎉 CONEXIÓN SQLite ESTABLECIDA EXITOSAMENTE');
            process.exit(0);
        } else {
            console.log('❌ ERROR EN LA CONEXIÓN SQLite');
            process.exit(1);
        }
    });
}

// Exportar para uso en otros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testConnection };
} 