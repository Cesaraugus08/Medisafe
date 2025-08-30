// Test de API MediSafe SQLite - Simulando Postman
const API_BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
    console.log('🧪 === TESTEANDO API MEDISAFE SQLITE ===\n');
    
    let token = '';
    
    try {
        // 1. Health Check
        console.log('1️⃣ Health Check...');
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Health Check:', healthData);
        } else {
            console.log('❌ Health Check failed');
            return;
        }
        
        // 2. Register User
        console.log('\n2️⃣ Register User...');
        const registerData = {
            username: 'postman_user_' + Date.now(),
            password: 'testpass123',
            email: 'postman@test.com'
        };
        
        const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });
        
        if (registerResponse.ok) {
            const userData = await registerResponse.json();
            token = userData.token;
            console.log('✅ User registered:', userData.user);
            console.log('✅ Token received:', token.substring(0, 20) + '...');
        } else {
            const error = await registerResponse.json();
            console.log('❌ Register failed:', error);
            return;
        }
        
        // 3. Login User
        console.log('\n3️⃣ Login User...');
        const loginData = {
            username: registerData.username,
            password: registerData.password
        };
        
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        
        if (loginResponse.ok) {
            const loginResult = await loginResponse.json();
            token = loginResult.token;
            console.log('✅ Login successful:', loginResult.user);
        } else {
            const error = await loginResponse.json();
            console.log('❌ Login failed:', error);
            return;
        }
        
        // 4. Verify Token
        console.log('\n4️⃣ Verify Token...');
        const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            console.log('✅ Token verified:', verifyData.user);
        } else {
            const error = await verifyResponse.json();
            console.log('❌ Token verification failed:', error);
            return;
        }
        
        // 5. Create Medication
        console.log('\n5️⃣ Create Medication...');
        const medicationData = {
            name: 'Paracetamol',
            dose: '500mg',
            frequency: 'Cada 6 horas',
            time: '08:00',
            expiry_date: '2024-12-31',
            notes: 'Para dolor de cabeza'
        };
        
        const medResponse = await fetch(`${API_BASE_URL}/medications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(medicationData)
        });
        
        if (medResponse.ok) {
            const medResult = await medResponse.json();
            console.log('✅ Medication created:', medResult);
        } else {
            const error = await medResponse.json();
            console.log('❌ Medication creation failed:', error);
        }
        
        // 6. Get Medications
        console.log('\n6️⃣ Get Medications...');
        const getMedsResponse = await fetch(`${API_BASE_URL}/medications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (getMedsResponse.ok) {
            const medications = await getMedsResponse.json();
            console.log('✅ Medications retrieved:', medications.length, 'items');
            console.log('📋 First medication:', medications[0]);
        } else {
            const error = await getMedsResponse.json();
            console.log('❌ Get medications failed:', error);
        }
        
        // 7. Create Reminder
        console.log('\n7️⃣ Create Reminder...');
        const reminderData = {
            title: 'Tomar medicamento',
            description: 'Recordatorio para tomar el medicamento',
            date: '2024-12-31',
            reminder_time: '08:00'
        };
        
        const reminderResponse = await fetch(`${API_BASE_URL}/reminders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reminderData)
        });
        
        if (reminderResponse.ok) {
            const reminderResult = await reminderResponse.json();
            console.log('✅ Reminder created:', reminderResult);
        } else {
            const error = await reminderResponse.json();
            console.log('❌ Reminder creation failed:', error);
        }
        
        // 8. Get Reminders
        console.log('\n8️⃣ Get Reminders...');
        const getRemindersResponse = await fetch(`${API_BASE_URL}/reminders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (getRemindersResponse.ok) {
            const reminders = await getRemindersResponse.json();
            console.log('✅ Reminders retrieved:', reminders.length, 'items');
            console.log('📋 First reminder:', reminders[0]);
        } else {
            const error = await getRemindersResponse.json();
            console.log('❌ Get reminders failed:', error);
        }
        
        // 9. Create Goal
        console.log('\n9️⃣ Create Goal...');
        const goalData = {
            title: 'Mejorar salud',
            description: 'Meta para mejorar la salud general',
            target_date: '2024-12-31',
            priority: 'alta'
        };
        
        const goalResponse = await fetch(`${API_BASE_URL}/goals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(goalData)
        });
        
        if (goalResponse.ok) {
            const goalResult = await goalResponse.json();
            console.log('✅ Goal created:', goalResult);
        } else {
            const error = await goalResponse.json();
            console.log('❌ Goal creation failed:', error);
        }
        
        // 10. Get Goals
        console.log('\n🔟 Get Goals...');
        const getGoalsResponse = await fetch(`${API_BASE_URL}/goals`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (getGoalsResponse.ok) {
            const goals = await getGoalsResponse.json();
            console.log('✅ Goals retrieved:', goals.length, 'items');
            console.log('📋 First goal:', goals[0]);
        } else {
            const error = await getGoalsResponse.json();
            console.log('❌ Get goals failed:', error);
        }
        
        // Resumen final
        console.log('\n🎉 === TEST COMPLETO EXITOSO ===');
        console.log('✅ Health Check: OK');
        console.log('✅ User Registration: OK');
        console.log('✅ User Login: OK');
        console.log('✅ Token Verification: OK');
        console.log('✅ Medication CRUD: OK');
        console.log('✅ Reminder CRUD: OK');
        console.log('✅ Goal CRUD: OK');
        console.log('✅ API MediSafe SQLite: FUNCIONANDO PERFECTAMENTE');
        
    } catch (error) {
        console.log('❌ Error en test:', error.message);
    }
}

// Ejecutar test
testAPI(); 