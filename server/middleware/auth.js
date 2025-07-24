const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  // Ambil token dari header
  const token = req.header('x-auth-token');

  // Periksa jika token tidak ada
  if (!token) {
    return res.status(401).json({ msg: 'Tidak ada token, otorisasi ditolak' });
  }

  // Verifikasi token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token tidak valid' });
  }
};