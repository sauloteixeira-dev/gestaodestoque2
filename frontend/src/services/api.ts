import { supabase } from '../lib/supabase';

// Define API_URL based on environment
// Prioritize VITE_API_URL, fallback to localhost for development if not set
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper for making authenticated requests
export const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    }).catch(err => {
        console.error(`Falha na rede ao chamar ${endpoint}:`, err);
        throw new Error(`Erro de rede ao conectar com o servidor para ${endpoint}. Verifique sua conexão.`);
    });

    return response;
};
