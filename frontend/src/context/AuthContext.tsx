import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  nome: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nome: string, role?: 'admin' | 'user') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: any }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Timeout de segurança: 3 segundos para evitar travamento
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('[Auth] Timeout de segurança atingido, liberando loading...');
        setLoading(false);
      }
    }, 3000);

    // Verificação rápida e assíncrona
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error || !session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        await loadUserProfile(session.user.id);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);

        // Se o perfil não existe, fazer logout
        if (error.code === 'PGRST116') {
          console.error('Perfil não encontrado, fazendo logout...');
          await supabase.auth.signOut();
          localStorage.clear();
          setUser(null);
          return;
        }

        throw error;
      }

      if (data) {
        setUser(data);
      } else {
        console.warn('Perfil não encontrado para o usuário');
        await supabase.auth.signOut();
        localStorage.clear();
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      await supabase.auth.signOut();
      localStorage.clear();
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const signup = async (email: string, password: string, nome: string, role: 'admin' | 'user' = 'user') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      throw new Error(error.message || 'Erro ao criar conta');
    }
  };

  const logout = async () => {
    try {
      setUser(null);

      // Limpar localStorage
      localStorage.clear();

      // Limpar sessionStorage
      sessionStorage.clear();

      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer signOut:', error);
      }
    } catch (error: any) {
      console.error('Erro no logout:', error);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
