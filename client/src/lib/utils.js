/**
 * Format date to readable string
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = date => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date with time
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateTime = date => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} limit
 * @returns {string}
 */
export const truncateText = (text, limit = 150) => {
  if (text.length <= limit) return text;
  return text.substring(0, limit) + '...';
};

/**
 * Convert image buffer to data URL
 * @param {Object} image - Image object with data (Buffer) and contentType
 * @returns {string}
 */
export const bufferToImageUrl = image => {
  if (!image || !image.data) return null;
  const byteArray = new Uint8Array(image.data);
  const blob = new Blob([byteArray], { type: image.contentType });
  return URL.createObjectURL(blob);
};

/**
 * Estimate reading time in minutes
 * @param {string} text
 * @returns {number}
 */
export const estimateReadingTime = text => {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * Format file size
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = email => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
