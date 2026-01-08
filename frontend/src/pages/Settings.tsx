import React, { useState } from 'react';
import { useSaida } from '../context/SaidaContext';
import { toast } from 'react-toastify';


const Settings: React.FC = () => {
    const { locais, adicionarLocal, removerLocal } = useSaida();
    const [novoLocal, setNovoLocal] = useState('');
    const [novaDescricao, setNovaDescricao] = useState('');
    const [loading, setLoading] = useState(false);

    const capitalizarPrimeiraLetra = (texto: string): string => {
        if (!texto) return texto;
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    };

    const handleAdicionarLocal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!novoLocal.trim()) {
            toast.warning('O nome do local é obrigatório');
            return;
        }

        try {
            setLoading(true);
            await adicionarLocal(capitalizarPrimeiraLetra(novoLocal), novaDescricao);
            setNovoLocal('');
            setNovaDescricao('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoverLocal = async (id: number, nome: string) => {
        if (window.confirm(`Tem certeza que deseja remover o local "${nome}"?`)) {
            try {
                await removerLocal(id);
            } catch (error) {
                console.error('Erro ao remover local:', error);
            }
        }
    };

    return (
        <div className="settings-container">
            <h1>Configurações do Sistema</h1>

            <div className="settings-section">
                <h2>Gerenciar Locais de Saída</h2>
                <p>Cadastre aqui os locais para onde os produtos podem ser enviados.</p>

                <form onSubmit={handleAdicionarLocal} className="add-local-form">
                    <div className="form-group">
                        <label htmlFor="nomeLocal">Nome do Local</label>
                        <input
                            id="nomeLocal"
                            type="text"
                            value={novoLocal}
                            onChange={(e) => setNovoLocal(e.target.value)}
                            placeholder="Ex: Cozinha, Manutenção..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="descLocal">Descrição (Opcional)</label>
                        <input
                            id="descLocal"
                            type="text"
                            value={novaDescricao}
                            onChange={(e) => setNovaDescricao(e.target.value)}
                            placeholder="Detalhes sobre o local"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-save">
                        {loading ? 'Salvando...' : 'Adicionar Local'}
                    </button>
                </form>

                <div className="locais-list">
                    <h3 style={{ color: 'white' }}>Locais Cadastrados ({locais.length})</h3>
                    {locais.length > 0 ? (
                        <ul>
                            {locais.map((local) => (
                                <li key={local.id} className="local-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>{local.nome}</strong>
                                        {local.descricao && <span> - {local.descricao}</span>}
                                    </div>
                                    <button
                                        onClick={() => handleRemoverLocal(local.id, local.nome)}
                                        style={{
                                            background: '#ff4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            marginLeft: '10px'
                                        }}
                                        title="Remover local"
                                    >
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-list">Nenhum local cadastrado.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
