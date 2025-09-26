const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');
const requireRole = require('../middleware/role');

// ✅ Public: Google login
router.post('/google-login', authController.googleLogin);

// ✅ Protected route (any logged-in user)
router.get('/me', verifyToken, (req, res) => {
  res.json({ status: true, user: req.user });
});

// ✅ Role-based route (admin only)
router.get('/admin-only', verifyToken, requireRole('admin'), (req, res) => {
  res.json({ status: true, message: 'Welcome Admin!' });
});

module.exports = router;