export const CATEGORIES = ['Necklace', 'Ring', 'Earrings', 'Bracelet', 'Bangle', 'Pendant'];

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const API_URL = `${API_BASE_URL}/api`;
