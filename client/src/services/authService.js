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

        // TAMBAHAN: Simpan user di localStorage untuk penggunaan di client-side filter
        if (res.data) {
            localStorage.setItem('user', JSON.stringify(res.data));
        }

        return res.data;
    } catch (err) {
        // Hapus user dari localStorage jika error
        localStorage.removeItem('user');
        throw err.response?.data || { msg: 'Gagal memuat data pengguna' };
    }
};

// Logout
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // TAMBAHAN: Hapus juga data user
};