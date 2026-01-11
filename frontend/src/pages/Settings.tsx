import React, { useState } from 'react';
import { useSaida } from '../context/SaidaContext';
import { toast } from 'react-toastify';
import { Plus, MapPin } from 'lucide-react';

const Settings: React.FC = () => {
    const { locais, adicionarLocal } = useSaida();
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



    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Parâmetros e Configurações</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Gerencie os parâmetros do sistema.</p>
            </div>

            <div className="card-base">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--accent-primary)' }}>
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Locais de Saída</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Destinos para movimentação.</p>
                    </div>
                </div>

                <form onSubmit={handleAdicionarLocal} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nome do Local</label>
                        <input
                            type="text"
                            value={novoLocal}
                            onChange={(e) => setNovoLocal(e.target.value)}
                            placeholder="Ex: Cozinha"
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Descrição (Opcional)</label>
                        <input
                            type="text"
                            value={novaDescricao}
                            onChange={(e) => setNovaDescricao(e.target.value)}
                            placeholder="Detalhes..."
                            className="input-field"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ height: '42px' }}>
                        <Plus size={18} /> Adicionar
                    </button>
                </form>

                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Locais Cadastrados
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {locais.length > 0 ? (
                            locais.map((local) => (
                                <div key={local.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    backgroundColor: 'var(--bg-primary)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div>
                                        <span style={{ fontWeight: 500 }}>{local.nome}</span>
                                        {local.descricao && <span style={{ color: 'var(--text-secondary)', marginLeft: '10px', fontSize: '0.9rem' }}>— {local.descricao}</span>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Nenhum local cadastrado.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
