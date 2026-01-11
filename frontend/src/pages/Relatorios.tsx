import React, { useState, useEffect, useMemo } from 'react';
import { useSaida } from '../context/SaidaContext';
import { Printer, Filter, ArrowUpCircle, ArrowDownCircle, Search } from 'lucide-react';
const brasao = '/images/brasao.png';
const crasLogo = '/images/cras-logo.png';

interface Movimentacao {
    id: string; // Composite ID for key
    tipo: 'entrada' | 'saida';
    data: string;
    produto: string;
    codigo: string;
    quantidade: number;
    responsavel?: string; // Only for outputs
    local?: string; // Only for outputs
    motivo?: string; // Only for inputs
}

const Relatorios: React.FC = () => {
    const { saidas } = useSaida();
    const [entradas, setEntradas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos');
    const [termoBusca, setTermoBusca] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:3001/entradas-estoque');
                const data = await res.json();
                setEntradas(data);
            } catch (error) {
                console.error('Erro ao buscar entradas:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const dadosUnificados = useMemo(() => {
        const listaMovimentacoes: Movimentacao[] = [];

        // Processar Saídas
        saidas.forEach(saida => {
            saida.itens?.forEach((item, index) => {
                listaMovimentacoes.push({
                    id: `S-${saida.id}-${index}`,
                    tipo: 'saida',
                    data: saida.data_saida,
                    produto: item.produto_nome || 'Produto Desconhecido',
                    codigo: item.produto_codigo_barras || 'N/A',
                    quantidade: item.quantidade,
                    responsavel: saida.usuario_retirada,
                    local: saida.local?.nome
                });
            });
        });

        // Processar Entradas
        entradas.forEach(entrada => {
            listaMovimentacoes.push({
                id: `E-${entrada.id}`,
                tipo: 'entrada',
                data: entrada.data_entrada,
                produto: entrada.produto?.nome || 'Produto Removido',
                codigo: entrada.produto?.codigo_barras || 'N/A',
                quantidade: entrada.quantidade,
                motivo: entrada.motivo
            });
        });

        // Ordenar por data (mais recente primeiro)
        return listaMovimentacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }, [saidas, entradas]);

    const dadosFiltrados = dadosUnificados.filter(item => {
        const matchesType = filtroTipo === 'todos' || item.tipo === filtroTipo;
        const searchLower = termoBusca.toLowerCase();
        const matchesSearch =
            item.produto.toLowerCase().includes(searchLower) ||
            item.codigo.toLowerCase().includes(searchLower) ||
            (item.responsavel && item.responsavel.toLowerCase().includes(searchLower)) ||
            (item.local && item.local.toLowerCase().includes(searchLower));

        return matchesType && matchesSearch;
    });

    const formatarData = (data: string) => {
        return new Date(data).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Carregando dados...</div>;

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }} className="no-print">
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Relatórios de Movimentação</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Visão completa de entradas e saídas do estoque.</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="btn-primary"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}
                >
                    <Printer size={18} />
                    Imprimir Relatório
                </button>
            </div>

            {/* Filtros */}
            <div className="card no-print" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <Filter size={16} color="var(--text-secondary)" />
                    <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value as any)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="todos">Todos os Tipos</option>
                        <option value="entrada">Apenas Entradas</option>
                        <option value="saida">Apenas Saídas</option>
                    </select>
                </div>

                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Buscar por produto, responsável ou local..."
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                        className="input-field"
                        style={{ width: '100%', paddingLeft: '36px' }}
                    />
                </div>
            </div>

            {/* Tabela de Dados */}
            <div className="card">
                <div className="table-container no-print">
                    <table>
                        <thead>
                            <tr>
                                <th>Data/Hora</th>
                                <th style={{ textAlign: 'center' }}>Tipo</th>
                                <th>Produto</th>
                                <th>Detalhes (Origem/Destino)</th>
                                <th style={{ textAlign: 'right' }}>Quantidade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dadosFiltrados.map((item) => (
                                <tr key={item.id}>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        {formatarData(item.data)}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                                            background: item.tipo === 'entrada' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                            color: item.tipo === 'entrada' ? '#10b981' : '#8b5cf6',
                                            border: `1px solid ${item.tipo === 'entrada' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(139, 92, 246, 0.2)'}`
                                        }}>
                                            {item.tipo === 'entrada' ? <ArrowDownCircle size={12} /> : <ArrowUpCircle size={12} />}
                                            {item.tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{item.produto}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.codigo}</div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>
                                        {item.tipo === 'entrada' ? (
                                            <span>{item.motivo || 'Entrada Manual'}</span>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span><span style={{ fontWeight: 600 }}>Local:</span> {item.local}</span>
                                                <span><span style={{ fontWeight: 600 }}>Resp:</span> {item.responsavel}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: item.tipo === 'entrada' ? '#10b981' : '#f87171' }}>
                                        {item.tipo === 'entrada' ? '+' : '-'}{item.quantidade}
                                    </td>
                                </tr>
                            ))}
                            {dadosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                        Nenhum registro encontrado para os filtros selecionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Conteúdo Exclusivo para Impressão */}
                <div className="print-layout">
                    {(() => {
                        const ITENS_POR_PAGINA = 14;
                        const itens = dadosFiltrados;

                        if (itens.length === 0) return (
                            <div className="print-page">
                                <p>Não há itens para imprimir.</p>
                            </div>
                        );

                        const chunks = Array.from({ length: Math.ceil(itens.length / ITENS_POR_PAGINA) }, (_, i) =>
                            itens.slice(i * ITENS_POR_PAGINA, i * ITENS_POR_PAGINA + ITENS_POR_PAGINA)
                        );

                        return chunks.map((chunk, pageIndex) => (
                            <div key={pageIndex} className="print-page">
                                {/* Cabeçalho */}
                                <div className="print-header">
                                    <div className="logo-esq">
                                        <img src={brasao} alt="Brasão Alfenas" />
                                    </div>
                                    <div className="titulo-centro">
                                        <h2>Prefeitura Municipal de Alfenas</h2>
                                        <h3>Secretaria de Ação Social</h3>
                                    </div>
                                    <div className="logo-dir">
                                        <img src={crasLogo} alt="Logo CRAS" />
                                    </div>
                                </div>

                                <div className="titulo-documento">
                                    <h2>Relatório Geral de Movimentação</h2>
                                </div>

                                {/* Tabela */}
                                <div className="tabela-container">
                                    <h3>Página {pageIndex + 1}/{chunks.length}</h3>
                                    <table className="print-table">
                                        <thead>
                                            <tr>
                                                <th>Data/Hora</th>
                                                <th>Tipo</th>
                                                <th>Produto</th>
                                                <th>Detalhes</th>
                                                <th style={{ textAlign: 'center' }}>Qtd</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chunk.map((item) => (
                                                <tr key={item.id}>
                                                    <td style={{ fontSize: '12px' }}>{formatarData(item.data)}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                        {item.tipo === 'entrada' ? 'ENTRADA' : 'SAÍDA'}
                                                    </td>
                                                    <td>
                                                        {item.produto}
                                                        <div style={{ fontSize: '10px' }}>{item.codigo}</div>
                                                    </td>
                                                    <td style={{ fontSize: '11px' }}>
                                                        {item.tipo === 'entrada' ? (
                                                            item.motivo || 'Entrada Manual'
                                                        ) : (
                                                            <>
                                                                <div>Local: {item.local}</div>
                                                                <div>Resp: {item.responsavel}</div>
                                                            </>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                        {item.tipo === 'entrada' ? '+' : '-'}{item.quantidade}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Rodapé */}
                                <div className="print-footer">
                                    <div className="assinatura">
                                        <p className="linha">_______________________________________</p>
                                        <p className="cargo">Responsável pelo Estoque</p>
                                    </div>
                                    <div className="data">
                                        <p>Emitido em: {new Date().toLocaleString('pt-BR')} - Página {pageIndex + 1}/{chunks.length}</p>
                                    </div>
                                </div>
                            </div>
                        ));
                    })()}
                </div>

                <style>{`
                /* Estilos padrão (tela) */
                .print-layout {
                    display: none;
                }

                /* Estilos de impressão - PADRONIZADO */
                @media print {
                    @page {
                        margin: 0;
                        size: A4 landscape;
                    }

                    body {
                        background: white;
                    }

                    /* Ocultar tudo do corpo */
                    body * {
                        visibility: hidden;
                    }

                    /* Mostrar apenas o layout de impressão */
                    .print-layout, .print-layout * {
                        visibility: visible;
                        height: auto;
                        overflow: visible;
                    }

                    .print-layout {
                        display: block;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }

                    .print-page {
                        width: 297mm;
                        min-height: 210mm;
                        padding: 10mm;
                        margin: 0 auto;
                        background: white;
                        box-sizing: border-box;
                        page-break-after: always;
                        display: flex;
                        flex-direction: column;
                    }

                    .print-page:last-child {
                        page-break-after: auto;
                    }

                    /* Cabeçalho */
                    .print-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 1px solid black;
                        padding-bottom: 5px;
                        margin-bottom: 10px;
                        width: 100%;
                    }

                    .logo-esq img, .logo-dir img {
                        height: 45px;
                        width: auto;
                        object-fit: contain;
                    }

                    .titulo-centro {
                        text-align: center;
                        flex: 1;
                        padding: 0 10px;
                    }

                    .titulo-centro h2 {
                        font-size: 13px;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin: 0 0 2px 0;
                        color: black;
                    }

                    .titulo-centro h3 {
                        font-size: 11px;
                        font-weight: normal;
                        text-transform: uppercase;
                        margin: 0;
                        color: black;
                    }

                    .titulo-documento {
                        text-align: center;
                        margin-bottom: 8px;
                    }

                    .titulo-documento h2 {
                        font-size: 14px;
                        font-weight: bold;
                        text-decoration: underline;
                        margin: 0;
                        color: black;
                    }

                    /* Tabela */
                    .tabela-container {
                        flex: 1;
                    }
                    
                    .tabela-container h3 {
                         font-size: 9px;
                         margin-bottom: 3px;
                         color: black;
                         text-align: right;
                    }

                    table.print-table {
                        width: 100%;
                        border-collapse: collapse;
                        border: 1px solid black;
                        font-size: 9px;
                        color: black;
                    }

                    table.print-table th, table.print-table td {
                        border: 1px solid black;
                        padding: 3px 4px;
                        color: black;
                        vertical-align: middle;
                    }

                    table.print-table th {
                        background-color: #f0f0f0;
                        font-weight: bold;
                        -webkit-print-color-adjust: exact;
                        text-align: left;
                    }

                    /* Rodapé */
                    .print-footer {
                        margin-top: auto;
                        padding-top: 10px;
                        text-align: center;
                        page-break-inside: avoid;
                    }

                    .assinatura {
                        margin-bottom: 8px;
                    }
                    
                    .assinatura .linha {
                        margin-bottom: 3px;
                        color: black;
                        font-size: 10px;
                    }
                    
                    .assinatura .cargo {
                        font-weight: bold;
                        font-size: 10px;
                        color: black;
                    }

                    .data {
                        font-size: 8px;
                        color: black;
                    }
                }
            `}</style>
            </div>
        </div>
    );
};

export default Relatorios;
