const express = require('express');
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/v1/auth/register
router.post('/register', 
  validateRegister, 
  handleValidationErrors, 
  authController.register
);

// POST /api/v1/auth/login
router.post('/login', 
  validateLogin, 
  handleValidationErrors, 
  authController.login
);

// GET /api/v1/auth/profile (protegida)
router.get('/profile', 
  authenticateToken, 
  authController.getProfile
);

module.exports = router; 