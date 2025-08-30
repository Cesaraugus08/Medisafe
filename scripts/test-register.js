const fetch = require('node-fetch');

async function testRegister() {
  const url = 'http://localhost:3000/api/auth/register';
  const body = {
    username: 'pruebaai',
    password: 'test123',
    email: 'pruebaai@medisafe.com'
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Respuesta:', data);
  } catch (err) {
    console.error('Error en fetch:', err);
  }
}

testRegister(); 