const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// @route   POST /api/auth/google-login
// @desc    Authenticate with Google token
// @access  Public
router.post('/google-login', authController.googleLogin);

module.exports = router;