const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../../middleware/auth');
const userController = require('../../controllers/userController');

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post(
  '/',
  [
    check('name', 'Nama wajib diisi').not().isEmpty(),
    check('email', 'Masukkan email yang valid').isEmail(),
    check('password', 'Password harus minimal 6 karakter').isLength({ min: 6 })
  ],
  async (req, res) => {
    // Gunakan handler yang sudah ada di file ini
    // JANGAN UBAH BAGIAN INI
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Cek apakah user sudah ada
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User dengan email ini sudah terdaftar' });
      }

      user = new User({
        name,
        email,
        password
      });

      // Enkripsi password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: config.get('jwtExpiration') },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/users/search
// @desc    Cari user berdasarkan email
// @access  Private
router.get('/search', auth, userController.searchUserByEmail);

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'Pengguna tidak ditemukan' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Pengguna tidak ditemukan' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;