# MediSafe - Sistema de Gestión de Medicamentos

## 📁 Estructura del Proyecto

```
MediSafe/
├── frontend/           # Aplicación web frontend
│   ├── index.html     # Página principal
│   ├── style.css      # Estilos CSS
│   ├── script.js      # Lógica JavaScript principal
│   └── test-*.html    # Archivos de prueba
├── backend/            # API backend
│   ├── src/           # Código fuente del backend
│   ├── config/        # Configuraciones
│   ├── controllers/   # Controladores
│   ├── routes/        # Rutas de la API
│   ├── middleware/    # Middleware
│   ├── db/            # Base de datos
│   └── package.json   # Dependencias del backend
├── mobile/             # Aplicación móvil
│   └── medisafe-mobile/
├── docs/               # Documentación
│   ├── README-*.md    # Documentación específica
│   ├── EMAILJS_SETUP.md
│   └── INSTALACION-*.md
├── scripts/            # Scripts de utilidad
│   ├── *.js           # Scripts JavaScript
│   ├── *.bat          # Scripts de Windows
│   └── *.ps1          # Scripts de PowerShell
└── README.md           # Este archivo
```

## 🚀 Inicio Rápido

### Frontend
```bash
cd frontend
# Abrir index.html en el navegador
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### Móvil
```bash
cd mobile/medisafe-mobile
npm install
npm start
```

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend**: Node.js, Express.js, SQLite/PostgreSQL
- **Móvil**: React Native
- **Base de Datos**: SQLite (desarrollo), PostgreSQL (producción)

## 📋 Funcionalidades

- ✅ Gestión de medicamentos
- ✅ Sistema de recordatorios
- ✅ Autenticación de usuarios
- ✅ Logros y metas
- ✅ Exportación de datos
- ✅ Sincronización médica
- ✅ Interfaz accesible

## 🔧 Configuración

1. Copia `backend/config.env.example` a `backend/config.env`
2. Configura las variables de entorno
3. Ejecuta `npm run init-db` para inicializar la base de datos

## 📚 Documentación

Consulta la carpeta `docs/` para documentación específica de cada componente.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
