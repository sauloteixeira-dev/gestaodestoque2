export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const getAuthHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
});
