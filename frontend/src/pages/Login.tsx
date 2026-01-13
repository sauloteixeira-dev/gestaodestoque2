
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { supabase } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Redirecionar para a página que o usuário tentou acessar ou home
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        if (!nickname || nickname.length < 2) {
          throw new Error('Por favor, insira um nome/apelido válido.');
        }

        // Signup
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;

        // Create profile with nickname
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ nickname: nickname })
            .eq('id', authData.user.id);

          if (profileError) {
            console.error('Erro ao salvar nome:', profileError);
          }
        }

        if (authData.user && !authData.session) {
          alert('Cadastro realizado! Por favor, verifique seu email para confirmar a conta antes de entrar.');
        } else {
          alert('Cadastro realizado com sucesso!');
        }
      }

      navigate(from, { replace: true });
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Auth Error:', err);
      let msg = err.message;
      if (msg.includes('Invalid login credentials')) {
        msg = 'Email ou senha incorretos.';
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Email não confirmado. Verifique sua caixa de entrada.';
      }
      setError(msg || `Falha ao ${isLogin ? 'fazer login' : 'criar conta'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-area">
            <div className="logo-circle">
              <Lock size={32} color="var(--primary-color)" />
            </div>
          </div>
          <h1 className="login-title">{isLogin ? 'Acesso Restrito' : 'Criar Conta'}</h1>
          <p className="login-subtitle">Gestão de Estoque Municipal</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="nickname">Seu Nome / Apelido</label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => {
                  const val = e.target.value;
                  const formatted = val.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
                  setNickname(formatted);
                }}
                placeholder="Como quer ser chamado"
                required={!isLogin}
                className="input-with-icon"
                style={{ paddingLeft: '1rem' }}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@alfenas.mg.gov.br"
                required
                className="input-with-icon"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-with-icon"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processando...
              </>
            ) : (
              isLogin ? 'Entrar no Sistema' : 'Criar Conta'
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none', border: 'none', color: 'var(--primary-color)',
              cursor: 'pointer', fontSize: '0.9rem', marginTop: '1rem', width: '100%'
            }}
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
          </button>
        </form>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-secondary);
          padding: var(--space-4);
        }

        .login-card {
          background: var(--bg-primary);
          padding: var(--space-8);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-width: 400px;
          border: 1px solid var(--border-color);
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }

        .logo-area {
          display: flex;
          justify-content: center;
          margin-bottom: var(--space-4);
        }

        .logo-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
        }

        .login-title {
          font-size: var(--font-2xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin-bottom: var(--space-2);
        }

        .login-subtitle {
          color: var(--text-secondary);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .form-group label {
          font-size: var(--font-sm);
          font-weight: var(--font-medium);
          color: var(--text-secondary);
        }

        .input-icon-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: var(--space-3);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-with-icon {
          width: 100%;
          padding: var(--space-3);
          padding-left: calc(var(--space-3) + 24px + var(--space-2));
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s;
        }

        .input-with-icon:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px var(--primary-color-alpha);
        }

        .w-full {
          width: 100%;
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--status-error);
          color: var(--status-error);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-sm);
        }
      `}</style>
    </div>
  );
};

export default Login;
