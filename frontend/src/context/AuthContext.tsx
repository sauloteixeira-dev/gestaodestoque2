
import React, { createContext, useState, useEffect, useContext } from 'react';
import { createClient, type Session, type User } from '@supabase/supabase-js';

// Inicializa o cliente Supabase
// NOTA: Em um projeto real, use variáveis de ambiente (.env)
const supabaseUrl = 'https://fygvwzxplsmarvqulysf.supabase.co';
const supabaseKey = 'sb_publishable_mjSHHVTB07MTwsZrosuHCA_z0o-SAFR';

// Tenta pegar do .env do Vite se disponível
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback para as credenciais fornecidas
const supabase = createClient(
    envUrl || supabaseUrl,
    envKey || supabaseKey
);

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    supabase: typeof supabase;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
    supabase: supabase,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Busca sessão inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Escuta mudanças na autenticação (login, logout, etc)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut, supabase }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
