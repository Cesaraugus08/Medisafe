const { body, validationResult } = require('express-validator');

// Validaciones para autenticación
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El usuario solo puede contener letras, números y guiones bajos'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('El email debe tener un formato válido')
    .normalizeEmail()
];

const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El usuario es requerido'),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Validaciones para medicamentos
const validateMedication = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre del medicamento es requerido y no puede exceder 100 caracteres'),
  
  body('dose')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('La dosis es requerida y no puede exceder 100 caracteres'),
  
  body('frequency')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('La frecuencia es requerida y no puede exceder 100 caracteres'),
  
  body('time')
    .trim()
    .notEmpty()
    .withMessage('El horario es requerido'),
  
  body('expiry_date')
    .optional()
    .isISO8601()
    .withMessage('La fecha de caducidad debe tener formato ISO válido'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
];

// Validaciones para recordatorios
const validateReminder = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El título es requerido y no puede exceder 100 caracteres'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  
  body('date')
    .trim()
    .isISO8601()
    .withMessage('La fecha debe tener formato ISO válido'),
  
  body('reminder_time')
    .trim()
    .notEmpty()
    .withMessage('El horario del recordatorio es requerido')
];

// Validaciones para metas
const validateGoal = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El título es requerido y no puede exceder 200 caracteres'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('La fecha límite debe tener formato ISO válido'),
  
  body('priority')
    .optional()
    .isIn(['baja', 'media', 'alta'])
    .withMessage('La prioridad debe ser: baja, media o alta')
];

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateMedication,
  validateReminder,
  validateGoal,
  handleValidationErrors
};
