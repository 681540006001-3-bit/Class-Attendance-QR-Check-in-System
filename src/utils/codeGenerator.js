/**
 * Generates a random uppercase alphanumeric session code.
 * Example format: SE333-8F2K or ATT-9X2Y
 */
export const generateSessionCode = (courseCode = 'ATT') => {
  const cleanCode = courseCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5) || 'ATT';
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${cleanCode}-${randomPart}`;
};

/**
 * Generates a unique string ID with a prefix.
 */
export const generateId = (prefix = 'id') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${timestamp}-${random}`;
};
