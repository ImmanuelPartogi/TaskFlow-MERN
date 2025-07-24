import api from './api';

// Login user
export const login = async (email, password) => {
  const body = { email, password };
  try {
    const res = await api.post('/auth', body);
    // Simpan token di localStorage
    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data;
  } catch (err) {
    throw err.response?.data || { msg: 'Terjadi kesalahan saat login' };
  }
};

// Register user
export const register = async (name, email, password) => {
  // Validasi di sisi client
  if (!name || !email || !password) {
    throw { msg: 'Semua field harus diisi' };
  }

  if (password.length < 6) {
    throw { msg: 'Password harus minimal 6 karakter' };
  }

  const body = { name, email, password };
  try {
    const res = await api.post('/users', body);
    // Simpan token di localStorage
    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data;
  } catch (err) {
    console.error('Error pada registrasi:', err.response?.data || err);
    throw err.response?.data || { msg: 'Server error' };
  }
};

// Get authenticated user
export const loadUser = async () => {
  try {
    // Pastikan token sudah ada sebelum melakukan request
    if (!localStorage.getItem('token')) {
      throw { msg: 'Token tidak ditemukan' };
    }

    const res = await api.get('/auth');
    return res.data;
  } catch (err) {
    throw err.response?.data || { msg: 'Gagal memuat data pengguna' };
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
};

// Search user by email
export const searchUserByEmail = async (email) => {
  try {
    console.log(`Searching for user with email: ${email}`);

    const res = await api.get(`/users/search?email=${encodeURIComponent(email)}`);
    console.log('User search response:', res.data);

    return res.data;
  } catch (err) {
    console.error('Error searching for user:', err);

    // Tangani error lebih spesifik
    if (err.response) {
      console.error('Response error:', err.response.data);
      throw err.response.data;
    } else if (err.request) {
      console.error('Request error, no response received');
      throw { msg: 'Tidak dapat menghubungi server. Periksa koneksi internet Anda.' };
    } else {
      console.error('Error setting up request:', err.message);
      throw { msg: 'Terjadi kesalahan saat melakukan pencarian.' };
    }
  }
};

// Fungsi baru untuk cek koneksi ke API
export const checkApiConnection = async () => {
  try {
    const res = await api.get('/auth'); // Endpoint yang pasti ada
    return { connected: true, status: res.status };
  } catch (err) {
    return {
      connected: false,
      error: err.response ? err.response.data : 'Network error'
    };
  }
};

// FUNGSI BARU: Get user by ID
export const getUserById = async (id) => {
  try {
    // Gunakan endpoint /api/users/:id jika tersedia
    // Jika tidak, bisa menggunakan endpoint search dengan parameter ID
    const res = await api.get(`/users/${id}`);
    return res.data;
  } catch (err) {
    console.error('Error fetching user by ID:', err);
    return null;
  }
};