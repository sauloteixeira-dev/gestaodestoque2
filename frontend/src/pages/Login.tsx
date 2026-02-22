
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { MessageCircle } from 'lucide-react'; // Usarei MessageCircle provisoriamente caso o lucide-react não tenha a logo específica do WhatsApp

const Login: React.FC = (): React.ReactElement => {
  const { supabase } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Redirecionar para a página que o usuário tentou acessar ou home
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      navigate(from, { replace: true });

    } catch (err: unknown) {
      console.error('Auth Error:', err);
      let msg = 'Falha ao fazer login';

      if (err instanceof Error) {
        msg = err.message;
        if (msg.includes('Invalid login credentials')) {
          msg = 'Email ou senha incorretos.';
        } else if (msg.includes('Email not confirmed')) {
          msg = 'Email não confirmado. Verifique sua caixa de entrada.';
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-area">
            <div className="logo-circle" style={{ padding: '0', background: '#FFFFFF', width: '96px', height: '96px', overflow: 'hidden' }}>
              <img src="/logo.png" alt="STockOS Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
          <h1 className="login-title">STockOS</h1>
          <p className="login-subtitle">by Saulo Teixeira</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
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
              'Entrar no Sistema'
            )}
          </button>

          <a
            href="https://wa.me/+5535999857170?text=Ol%C3%A1%20Saulo%2C%20Preciso%20de%20acesso%20ao%20App%20de%20gest%C3%A3o%20de%20Estoque%20(STockOS)"
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-link"
          >
            <MessageCircle size={18} />
            <span>Precisa de login? Me chame no Whatsapp</span>
          </a>
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
          width: 96px;
          height: 96px;
          border-radius: var(--radius-lg);
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

        .whatsapp-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          color: #25D366; /* Cor oficial do WhatsApp */
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: var(--font-medium);
          margin-top: 1rem;
          width: 100%;
          transition: opacity 0.2s;
        }

        .whatsapp-link:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default Login;
