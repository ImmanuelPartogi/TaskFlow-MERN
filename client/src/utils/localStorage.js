/**
 * Menyimpan item ke localStorage dengan key tertentu
 * @param {string} key - Key untuk menyimpan item
 * @param {any} value - Nilai yang akan disimpan (akan dikonversi ke JSON)
 */
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error menyimpan ke localStorage:', error);
  }
};

/**
 * Mengambil item dari localStorage berdasarkan key
 * @param {string} key - Key item yang akan diambil
 * @param {any} defaultValue - Nilai default jika item tidak ditemukan
 * @returns {any} Item yang diambil (sudah dikonversi dari JSON)
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error mengambil dari localStorage:', error);
    return defaultValue;
  }
};

/**
 * Menghapus item dari localStorage berdasarkan key
 * @param {string} key - Key item yang akan dihapus
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error menghapus dari localStorage:', error);
  }
};

/**
 * Menghapus semua item dari localStorage
 */
export const clearAll = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error menghapus semua dari localStorage:', error);
  }
};