import React, { useState, useEffect } from 'react'; // Add useEffect
import { useSearchParams } from 'react-router-dom'; // Add useSearchParams
import { useProdutos } from '../context/ProdutoContext';
const brasao = '/images/brasao.png';
const crasLogo = '/images/cras-logo.png';
import { AlertTriangle, Printer, Box, CheckCircle } from 'lucide-react'; // Add icons

const EstoqueBaixo: React.FC = () => {
    const { produtos, loading } = useProdutos();
    const [searchParams] = useSearchParams();
    const [filtro, setFiltro] = useState<'todos' | 'estoque' | 'critico' | 'baixo'>(() => {
        const filtroUrl = searchParams.get('filtro');
        if (filtroUrl === 'baixo') return 'baixo';
        if (filtroUrl === 'critico') return 'critico';
        if (filtroUrl === 'estoque') return 'estoque';
        return 'todos';
    });

    // Atualizar filtro se a URL mudar (ex: navegação browser back/forward)
    useEffect(() => {
        const filtroUrl = searchParams.get('filtro');
        if (filtroUrl === 'baixo') {
            setFiltro('baixo');
        } else if (filtroUrl === 'critico') {
            setFiltro('critico');
        } else if (filtroUrl === 'estoque') {
            setFiltro('estoque');
        } else {
            setFiltro('todos');
        }
    }, [searchParams]);

    const limiteEstoque = 5;

    const produtosFiltrados = produtos.filter(p => {
        if (filtro === 'baixo') {
            return p.quantidade === 0; // Apenas itens sem estoque
        }
        if (filtro === 'critico') {
            return p.quantidade > 0 && p.quantidade < 10; // Itens com estoque crítico
        }
        if (filtro === 'estoque') {
            return p.quantidade > 0;
        }
        return true; // mostrar todos
    });

    const formatarData = (dataString: string) => {
        return new Date(dataString).toLocaleString('pt-BR');
    };

    if (loading) {
        return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Carregando...</div>;
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Controle de Estoque</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gerencie e visualize todo o seu inventário.</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="btn-primary"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                >
                    <Printer size={18} />
                    Imprimir Relatório
                </button>
            </div>

            {/* Filtros Toggle */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Grupo 1: Todos */}
                <div className="card-base" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', width: 'fit-content' }}>
                    <button
                        onClick={() => setFiltro('todos')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: filtro === 'todos' ? 'var(--accent-primary)' : 'transparent',
                            color: filtro === 'todos' ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Box size={16} /> TODOS
                    </button>
                </div>

                {/* Grupo 2: Estoque | Crítico | Sem Estoque */}
                <div className="card-base" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', width: 'fit-content' }}>
                    <button
                        onClick={() => setFiltro('estoque')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: filtro === 'estoque' ? '#10b981' : 'transparent',
                            color: filtro === 'estoque' ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <CheckCircle size={16} /> ESTOQUE
                    </button>
                    <button
                        onClick={() => setFiltro('critico')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: filtro === 'critico' ? '#f59e0b' : 'transparent',
                            color: filtro === 'critico' ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <AlertTriangle size={16} /> CRÍTICO
                    </button>
                    <button
                        onClick={() => setFiltro('baixo')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: filtro === 'baixo' ? '#ef4444' : 'transparent',
                            color: filtro === 'baixo' ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <AlertTriangle size={16} /> SEM ESTOQUE
                    </button>
                </div>
            </div>

            {/* Visualização em Tela (Tabela Simples) */}
            <div className="card-base">
                {produtosFiltrados.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        <div style={{ marginBottom: '1rem', color: '#4ade80' }}>
                            <CheckCircle size={48} />
                        </div>
                        <h3>Nenhum item encontrado</h3>
                        <p>{filtro === 'baixo' ? 'Não há produtos sem estoque!' : filtro === 'critico' ? 'Não há produtos com estoque crítico!' : 'Nenhum produto cadastrado no sistema.'}</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th className="hide-mobile">Código</th>
                                    <th>Produto</th>
                                    <th style={{ textAlign: 'center' }}>Quantidade</th>
                                    <th style={{ textAlign: 'right' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {produtosFiltrados.map(produto => (
                                    <tr key={produto.id}>
                                        <td className="hide-mobile" style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{produto.codigo_barras}</td>
                                        <td style={{ fontWeight: 500 }}>{produto.nome}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: produto.quantidade <= 5 ? '#f87171' : 'var(--text-primary)' }}>
                                            {produto.quantidade}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {produto.quantidade <= 5 ? (
                                                <span style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                                    Repor
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: '12px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                                                    Normal
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Conteúdo Exclusivo para Impressão - MANTIDO LOGICA ORIGINAL COM APENAS AJUSTES MINIMOS DE CSS INLINE SE NECESSARIO, MAS A LOGICA DE CHUNKS É CRÍTICA */}
            <div className="print-layout">
                {(() => {
                    const ITENS_POR_PAGINA = 18;
                    // Use produtosFiltrados here to print whatever is currently viewed
                    const itens = produtosFiltrados;
                    // Se não tiver itens, não gera nada ou gera mensagem
                    if (itens.length === 0) return (
                        <div className="print-page">
                            <p>Não há itens para imprimir.</p>
                        </div>
                    );

                    const chunks = Array.from({ length: Math.ceil(itens.length / ITENS_POR_PAGINA) }, (_, i) =>
                        itens.slice(i * ITENS_POR_PAGINA, i * ITENS_POR_PAGINA + ITENS_POR_PAGINA)
                    );

                    return chunks.map((chunk, pageIndex) => (
                        <div
                            key={pageIndex}
                            className="print-page"
                        >
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
                                <h2>
                                    {filtro === 'baixo' ? 'Relatório de Itens Sem Estoque' :
                                        filtro === 'critico' ? 'Relatório de Estoque Crítico' :
                                            filtro === 'estoque' ? 'Relatório de Estoque Disponível' :
                                                'Relatório Geral de Estoque'}
                                </h2>
                            </div>

                            {/* Tabela */}
                            <div className="tabela-container">
                                <h3>
                                    {filtro === 'baixo' ? 'Itens Sem Estoque' :
                                        filtro === 'critico' ? 'Itens com Estoque Crítico (< 10 unidades)' :
                                            filtro === 'estoque' ? 'Itens em Estoque' :
                                                'Todos os Itens'} (Página {pageIndex + 1}/{chunks.length})
                                </h3>
                                <table className="print-table">
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left' }}>Código</th>
                                            <th style={{ textAlign: 'left' }}>Produto</th>
                                            <th style={{ textAlign: 'center' }}>Qtd</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {chunk.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.codigo_barras}</td>
                                                <td>{item.nome}</td>
                                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.quantidade}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {pageIndex === chunks.length - 1 && (
                                        <tfoot>
                                            <tr style={{ borderTop: '2px solid black', fontWeight: 'bold' }}>
                                                <td colSpan={2} style={{ textAlign: 'right', paddingRight: '10px' }}>QUANTIDADE DE PRODUTOS:</td>
                                                <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                                                    {itens.length}
                                                </td>
                                            </tr>
                                            <tr style={{ fontWeight: 'bold' }}>
                                                <td colSpan={2} style={{ textAlign: 'right', paddingRight: '10px' }}>TOTAL DE ITENS:</td>
                                                <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                                                    {itens.reduce((sum, item) => sum + item.quantidade, 0)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>

                            {/* Rodapé */}
                            <div className="print-footer">
                                <div className="assinatura">
                                    <p className="linha">_______________________________________</p>
                                    <p className="cargo">Responsável pelo Almoxarifado</p>
                                </div>
                                <div className="data">
                                    <p>Emitido em: {formatarData(new Date().toISOString())} - Página {pageIndex + 1}/{chunks.length}</p>
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

                /* Estilos de impressão - MANTIDOS DA VERSÃO ORIGINAL */
                @media print {
                    @page {
                        margin: 0;
                        size: A4;
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
                        width: 210mm;
                        min-height: 297mm;
                        padding: 15mm;
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
                        border-bottom: 2px solid black;
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                        width: 100%;
                    }

                    .logo-esq img, .logo-dir img {
                        height: 70px;
                        width: auto;
                        object-fit: contain;
                    }

                    .titulo-centro {
                        text-align: center;
                        flex: 1;
                        padding: 0 10px;
                    }

                    .titulo-centro h2 {
                        font-size: 16px;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin: 0 0 5px 0;
                        color: black;
                    }

                    .titulo-centro h3 {
                        font-size: 14px;
                        font-weight: normal;
                        text-transform: uppercase;
                        margin: 0;
                        color: black;
                    }

                    .titulo-documento {
                        text-align: center;
                        margin-bottom: 20px;
                    }

                    .titulo-documento h2 {
                        font-size: 18px;
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
                         font-size: 14px;
                         margin-bottom: 10px;
                         color: black;
                    }

                    table.print-table {
                        width: 100%;
                        border-collapse: collapse;
                        border: 1px solid black;
                        font-size: 14px;
                        color: black;
                    }

                    table.print-table th, table.print-table td {
                        border: 1px solid black;
                        padding: 8px;
                        color: black;
                    }

                    table.print-table th {
                        background-color: #f0f0f0;
                        font-weight: bold;
                        -webkit-print-color-adjust: exact;
                    }

                    /* Rodapé */
                    .print-footer {
                        margin-top: auto;
                        padding-top: 30px;
                        text-align: center;
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }

                    .assinatura-linha {
                        border-top: 1px solid black;
                        width: 60%;
                        margin: 0 auto 10px auto;
                    }

                    .assinatura {
                        margin-bottom: 20px;
                    }
                    
                    .assinatura .linha {
                        margin-bottom: 5px;
                        color: black;
                    }
                    
                    .assinatura .cargo {
                        font-weight: bold;
                        font-size: 14px;
                        color: black;
                    }

                    .data {
                        font-size: 12px;
                        color: black;
                    }
                }
            `}</style>
        </div>
    );
};

export default EstoqueBaixo;
