const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// @route   POST api/users
// @desc    Register user
// @access  Public
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Cek apakah user sudah ada
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User sudah ada' });
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
};

// @route   GET api/users/search
// @desc    Cari user berdasarkan email
// @access  Private
exports.searchUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    
    // Validasi input
    if (!email) {
      return res.status(400).json({ msg: 'Email diperlukan untuk pencarian' });
    }
    
    console.log(`Searching for user with email: ${email}`);
    
    // Cari user berdasarkan email dengan case-insensitive search
    const user = await User.findOne({ 
      email: { $regex: new RegExp('^' + email + '$', 'i') } 
    }).select('-password -date');
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      return res.status(404).json({ msg: 'Pengguna dengan email tersebut tidak ditemukan' });
    }
    
    console.log(`User found: ${user._id}`);
    
    // Jangan mengembalikan pengguna yang sedang melakukan pencarian
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'Anda tidak dapat menambahkan diri sendiri sebagai anggota' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error saat mencari pengguna:', err);
    // Tambahkan detail error untuk debugging
    res.status(500).json({ msg: 'Server error saat mencari pengguna', error: err.message });
  }
};