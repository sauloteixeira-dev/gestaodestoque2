import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Loader2, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const SetupProfile: React.FC = () => {
    const { user, profile, supabase, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);

    // If profile already has nickname, no need to be here
    React.useEffect(() => {
        if (profile?.nickname) {
            navigate('/');
        }
    }, [profile, navigate]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nickname.trim() || nickname.length < 2) {
            toast.error('O apelido deve ter pelo menos 2 caracteres.');
            return;
        }

        if (!user) return;

        setLoading(true);
        try {
            // Update profile
            const { error } = await supabase
                .from('profiles')
                .update({ nickname: nickname.trim() })
                .eq('id', user.id);

            if (error) throw error;

            await refreshProfile();
            toast.success('Perfil atualizado com sucesso!');
            navigate('/');

        } catch (error: any) {
            console.error('Erro ao salvar perfil:', error);
            toast.error(error.message || 'Erro ao salvar perfil.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="setup-container">
            <div className="setup-card">
                <div className="setup-header">
                    <div className="icon-circle">
                        <User size={32} color="var(--primary-color)" />
                    </div>
                    <h1 className="title">Bem-vindo(a)!</h1>
                    <p className="subtitle">Para continuar, precisamos saber como você gostaria de ser chamado.</p>
                </div>

                <form onSubmit={handleSave} className="setup-form">
                    <div className="form-group">
                        <label htmlFor="nickname">Seu Nome ou Apelido</label>
                        <input
                            id="nickname"
                            type="text"
                            value={nickname}
                            onChange={(e) => {
                                const val = e.target.value;
                                const formatted = val.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
                                setNickname(formatted);
                            }}
                            placeholder="Ex: Saulo Teixeira"
                            required
                            minLength={2}
                            className="input-field"
                            autoFocus
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Salvar e Continuar
                            </>
                        )}
                    </button>
                </form>
            </div>

            <style>{`
                .setup-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: var(--bg-secondary);
                    padding: 1rem;
                }
                .setup-card {
                    background: var(--bg-primary);
                    padding: 2rem;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                    width: 100%;
                    max-width: 450px;
                    border: 1px solid var(--border-color);
                }
                .setup-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .icon-circle {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: var(--bg-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--border-color);
                    margin: 0 auto 1rem;
                }
                .title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                .subtitle {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                .setup-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .input-field {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }
                .input-field:focus {
                    outline: 2px solid var(--primary-color);
                    border-color: transparent;
                }
                .w-full { width: 100%; }
                .btn-primary {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
            `}</style>
        </div>
    );
};

export default SetupProfile;
