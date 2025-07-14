const API_BASE_URL = 'http://localhost:3000/api';

async function debugReminder() {
    try {
        console.log('🔍 Debugging reminder creation...');
        
        // 1. Crear usuario
        const testUser = {
            username: 'debuguser_' + Date.now(),
            password: 'testpass123',
            email: 'debug@example.com'
        };
        
        console.log('1️⃣ Creating user...');
        const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        
        if (!registerResponse.ok) {
            const error = await registerResponse.json();
            console.log('❌ Register error:', error);
            return;
        }
        
        const registerData = await registerResponse.json();
        const token = registerData.token;
        console.log('✅ User created, token:', token.substring(0, 20) + '...');
        
        // 2. Crear recordatorio
        const testReminder = {
            title: 'Test Reminder',
            description: 'Test Description',
            date: new Date().toISOString().split('T')[0],
            reminder_time: '08:00'
        };
        
        console.log('2️⃣ Creating reminder with data:', testReminder);
        const reminderResponse = await fetch(`${API_BASE_URL}/reminders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testReminder)
        });
        
        if (!reminderResponse.ok) {
            const error = await reminderResponse.json();
            console.log('❌ Reminder creation error:', error);
            console.log('❌ Status:', reminderResponse.status);
            return;
        }
        
        const reminderData = await reminderResponse.json();
        console.log('✅ Reminder created successfully:', reminderData);
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

debugReminder(); 