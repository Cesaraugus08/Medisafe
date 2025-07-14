// Test Final SQLite - MediSafe
// Script para verificar toda la funcionalidad de la conexión SQLite

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

async function testHealthCheck() {
  console.log('🏥 Probando Health Check...');
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health Check exitoso:', data);
      return true;
    } else {
      console.log('❌ Health Check fallido:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Error en Health Check:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('🔐 Probando Login...');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'test123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login exitoso:', data.user.username);
      return data.token;
    } else {
      console.log('❌ Login fallido:', data.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Error en Login:', error.message);
    return null;
  }
}

async function testMedications(token) {
  console.log('💊 Probando Medicamentos...');
  
  if (!token) {
    console.log('❌ No hay token para probar medicamentos');
    return false;
  }
  
  try {
    // Obtener medicamentos
    const getResponse = await fetch(`${API_BASE}/medications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const medications = await getResponse.json();
    console.log(`✅ ${medications.length} medicamentos obtenidos`);
    
    // Agregar medicamento de prueba
    const addResponse = await fetch(`${API_BASE}/medications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Medicamento ' + Date.now(),
        dose: '1 tableta',
        frequency: 'Cada 8 horas',
        time: '08:00',
        expiry_date: '2024-12-31',
        notes: 'Medicamento de prueba para SQLite'
      })
    });
    
    const newMedication = await addResponse.json();
    console.log('✅ Medicamento agregado:', newMedication.name);
    
    return true;
  } catch (error) {
    console.log('❌ Error en medicamentos:', error.message);
    return false;
  }
}

async function testGoals(token) {
  console.log('🎯 Probando Metas...');
  
  if (!token) {
    console.log('❌ No hay token para probar metas');
    return false;
  }
  
  try {
    // Obtener metas
    const getResponse = await fetch(`${API_BASE}/goals`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const goals = await getResponse.json();
    console.log(`✅ ${goals.length} metas obtenidas`);
    
    // Agregar meta de prueba
    const addResponse = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Meta ' + Date.now(),
        description: 'Meta de prueba para SQLite',
        deadline: '2024-12-31'
      })
    });
    
    const newGoal = await addResponse.json();
    console.log('✅ Meta agregada:', newGoal.title);
    
    return true;
  } catch (error) {
    console.log('❌ Error en metas:', error.message);
    return false;
  }
}

async function testReminders(token) {
  console.log('⏰ Probando Recordatorios...');
  
  if (!token) {
    console.log('❌ No hay token para probar recordatorios');
    return false;
  }
  
  try {
    // Obtener recordatorios
    const getResponse = await fetch(`${API_BASE}/reminders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const reminders = await getResponse.json();
    console.log(`✅ ${reminders.length} recordatorios obtenidos`);
    
    return true;
  } catch (error) {
    console.log('❌ Error en recordatorios:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando Test Final SQLite...\n');
  
  // Test 1: Health Check
  const healthOk = await testHealthCheck();
  console.log('');
  
  if (!healthOk) {
    console.log('❌ El servidor no está disponible. Asegúrate de ejecutar: node server-sqlite.js');
    return;
  }
  
  // Test 2: Login
  const token = await testLogin();
  console.log('');
  
  if (!token) {
    console.log('❌ No se pudo autenticar. Verifica el usuario de prueba.');
    return;
  }
  
  // Test 3: Medicamentos
  const medicationsOk = await testMedications(token);
  console.log('');
  
  // Test 4: Metas
  const goalsOk = await testGoals(token);
  console.log('');
  
  // Test 5: Recordatorios
  const remindersOk = await testReminders(token);
  console.log('');
  
  // Resumen
  console.log('📊 RESUMEN DEL TEST:');
  console.log('==================');
  console.log(`✅ Health Check: ${healthOk ? 'PASÓ' : 'FALLÓ'}`);
  console.log(`✅ Login: ${token ? 'PASÓ' : 'FALLÓ'}`);
  console.log(`✅ Medicamentos: ${medicationsOk ? 'PASÓ' : 'FALLÓ'}`);
  console.log(`✅ Metas: ${goalsOk ? 'PASÓ' : 'FALLÓ'}`);
  console.log(`✅ Recordatorios: ${remindersOk ? 'PASÓ' : 'FALLÓ'}`);
  console.log('');
  
  const allTestsPassed = healthOk && token && medicationsOk && goalsOk && remindersOk;
  
  if (allTestsPassed) {
    console.log('🎉 ¡TODOS LOS TESTS PASARON!');
    console.log('✅ La conexión SQLite está DEFINITIVAMENTE ESTABLECIDA');
    console.log('');
    console.log('📋 Próximos pasos:');
    console.log('1. Abrir test-sqlite-connection.html en el navegador');
    console.log('2. Usar script-sqlite.js en tu aplicación principal');
    console.log('3. Migrar datos desde localStorage si es necesario');
  } else {
    console.log('❌ Algunos tests fallaron. Revisa los errores arriba.');
  }
}

// Ejecutar tests
runAllTests().catch(console.error); 