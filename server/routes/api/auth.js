const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../../middleware/auth');
const authController = require('../../controllers/authController');

// @route   POST api/auth
// @desc    Autentikasi user & dapatkan token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Masukkan email yang valid').isEmail(),
    check('password', 'Password diperlukan').exists()
  ],
  authController.authenticateUser
);

// @route   GET api/auth
// @desc    Mendapatkan data user yang terautentikasi
// @access  Private
router.get('/', auth, authController.getAuthUser);

module.exports = router;