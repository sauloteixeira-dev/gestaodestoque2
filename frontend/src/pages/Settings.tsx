import React, { useState, useMemo } from 'react';
import { useSaida } from '../context/SaidaContext';
import { toast } from 'react-toastify';
import { MapPin, Plus, Search } from 'lucide-react';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 10;

const Settings: React.FC = () => {
    const { locais, adicionarLocal } = useSaida();
    const [novoLocal, setNovoLocal] = useState('');
    const [novaDescricao, setNovaDescricao] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLocais = useMemo(() => {
        if (!searchTerm) return locais;
        const term = searchTerm.toLowerCase();
        return locais.filter(local =>
            local.nome.toLowerCase().includes(term) ||
            local.descricao?.toLowerCase().includes(term)
        );
    }, [locais, searchTerm]);

    const paginatedLocais = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredLocais.slice(startIndex, endIndex);
    }, [filteredLocais, currentPage]);

    const totalPages = Math.ceil(filteredLocais.length / ITEMS_PER_PAGE);

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
        <div>
            <div className="page-header">
                <h1 className="page-title">Parâmetros do Sistema</h1>
                <p className="page-subtitle">Configure locais e ajustes do sistema</p>
            </div>

            <div className="card-base">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--space-4)'
                }}>
                    <div className="icon-container">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h2 style={{
                            fontSize: 'var(--text-lg)',
                            fontWeight: 'var(--font-semibold)',
                            color: 'var(--text-primary)',
                            marginBottom: 'var(--space-1)'
                        }}>
                            Gerenciar Locais de Saída
                        </h2>
                        <p style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--text-muted)'
                        }}>
                            Cadastre os locais para onde os produtos podem ser enviados
                        </p>
                    </div>
                </div>

                <form onSubmit={handleAdicionarLocal} style={{
                    marginBottom: 'var(--space-6)',
                    paddingTop: 'var(--space-4)',
                    borderTop: '1px solid var(--border)'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr auto',
                        gap: 'var(--space-3)',
                        alignItems: 'end'
                    }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="label">
                                Nome do Local
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                value={novoLocal}
                                onChange={(e) => setNovoLocal(e.target.value)}
                                placeholder="Ex: Cozinha, Manutenção..."
                            />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="label">Descrição (Opcional)</label>
                            <input
                                type="text"
                                className="input-field"
                                value={novaDescricao}
                                onChange={(e) => setNovaDescricao(e.target.value)}
                                placeholder="Detalhes sobre o local"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'var(--space-2)',
                                whiteSpace: 'nowrap',
                                height: '44px',
                                padding: '0 var(--space-4)'
                            }}
                        >
                            <Plus size={18} />
                            {loading ? 'Salvando...' : 'Adicionar'}
                        </button>
                    </div>
                </form>

                <div style={{
                    paddingTop: 'var(--space-6)',
                    borderTop: '1px solid var(--border)'
                }}>
                    <h3 style={{
                        fontSize: 'var(--text-md)',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-4)'
                    }}>
                        Locais Cadastrados ({locais.length})
                    </h3>
                    {locais.length > 0 ? (
                        <>
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <div style={{ position: 'relative', maxWidth: '400px' }}>
                                    <Search
                                        size={18}
                                        style={{
                                            position: 'absolute',
                                            left: 'var(--space-3)',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-muted)',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Buscar local..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="input-field"
                                        style={{
                                            paddingLeft: 'calc(var(--space-3) + 24px)'
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px' }}>ID</th>
                                        <th>Local</th>
                                        <th>Descrição</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedLocais.map((local) => (
                                        <tr key={local.id}>
                                            <td className="mono" style={{
                                                fontWeight: 'var(--font-semibold)',
                                                color: 'var(--text-muted)'
                                            }}>
                                                {local.id}
                                            </td>
                                            <td style={{
                                                fontWeight: 'var(--font-semibold)',
                                                color: 'var(--text-primary)'
                                            }}>
                                                {local.nome}
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>
                                                {local.descricao || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        </>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: 'var(--space-8)',
                            color: 'var(--text-muted)'
                        }}>
                            Nenhum local cadastrado ainda.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
