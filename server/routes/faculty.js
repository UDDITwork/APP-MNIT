const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/facultyController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route to verify token
router.get('/verify', auth, (req, res) => {
  res.json({ faculty: req.user });
});

module.exports = router; 