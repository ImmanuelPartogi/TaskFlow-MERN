/**
 * Format tanggal ke string lokal
 * @param {Date|string} date - Tanggal atau string tanggal yang akan diformat
 * @param {object} options - Opsi formatting
 * @returns {string} Tanggal terformat
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions = {
    dateStyle: 'medium',
    timeStyle: 'short'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  return new Intl.DateTimeFormat('id-ID', mergedOptions).format(dateObj);
};

/**
 * Format tanggal ke format relatif (misalnya "5 menit yang lalu")
 * @param {Date|string} date - Tanggal atau string tanggal yang akan diformat
 * @returns {string} Format relatif
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  if (diffInSeconds < 60) {
    return 'baru saja';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} jam yang lalu`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} hari yang lalu`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} bulan yang lalu`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} tahun yang lalu`;
};

/**
 * Format tanggal ke format kalender (misalnya "Hari ini", "Kemarin")
 * @param {Date|string} date - Tanggal atau string tanggal yang akan diformat
 * @returns {string} Format kalender
 */
export const formatCalendarDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  const isToday = dateObj.toDateString() === now.toDateString();
  if (isToday) {
    return 'Hari ini';
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = dateObj.toDateString() === yesterday.toDateString();
  if (isYesterday) {
    return 'Kemarin';
  }
  
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();
  if (isTomorrow) {
    return 'Besok';
  }
  
  return formatDate(dateObj, { dateStyle: 'medium' });
};