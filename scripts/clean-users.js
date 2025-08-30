const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'medisafe.db');
const db = new sqlite3.Database(dbPath);

// Eliminar todos los usuarios excepto testuser
db.run("DELETE FROM users WHERE username != 'testuser'", function(err) {
  if (err) {
    console.error('Error eliminando usuarios:', err);
  } else {
    console.log('Usuarios eliminados correctamente (excepto testuser)');
  }
  db.close();
}); 