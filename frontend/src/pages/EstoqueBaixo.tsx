import React from 'react';
import { useProdutos } from '../context/ProdutoContext';

const EstoqueBaixo: React.FC = () => {
    const { produtos, loading } = useProdutos();

    // Filtrar produtos com estoque baixo (ex: <= 5)
    // Definir limite configurável se necessário, por enquanto hardcoded 5
    const limiteEstoque = 5;
    const produtosBaixoEstoque = produtos.filter(p => p.quantidade <= limiteEstoque);

    const formatarData = (dataString: string) => {
        return new Date(dataString).toLocaleString('pt-BR');
    };

    if (loading) {
        return <div className="loading">Carregando...</div>;
    }

    return (
        <div className="estoque-baixo-container">
            <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0 }}>Relatório de Estoque Baixo</h1>
                <button
                    onClick={() => window.print()}
                    className="btn-imprimir"
                    style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '8px 10px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        maxWidth: '100px',
                        fontSize: '12px',
                        whiteSpace: 'normal',
                        textAlign: 'center',
                        lineHeight: '1.2'
                    }}
                >
                    🖨️ Imprimir
                </button>
            </div>

            {/* Visualização em Tela (Tabela Simples) */}
            <div className="card">
                {produtosBaixoEstoque.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '20px', color: '#aaa' }}>Nenhum produto com estoque baixo (quantidade &le; {limiteEstoque}).</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table-estoque">
                            <thead>
                                <tr>
                                    <th className="hide-mobile">Código</th>
                                    <th>Produto</th>
                                    <th style={{ textAlign: 'center' }}>Quantidade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {produtosBaixoEstoque.map(produto => (
                                    <tr key={produto.id}>
                                        <td className="hide-mobile">{produto.codigo_barras}</td>
                                        <td>{produto.nome}</td>
                                        <td style={{ textAlign: 'center', color: '#ff4444', fontWeight: 'bold' }}>
                                            {produto.quantidade}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Conteúdo Exclusivo para Impressão */}
            <div className="print-layout">
                {(() => {
                    const ITENS_POR_PAGINA = 10;
                    const itens = produtosBaixoEstoque;
                    // Se não tiver itens, não gera nada ou gera mensagem
                    if (itens.length === 0) return (
                        <div className="print-page">
                            <p>Não há itens com estoque baixo para imprimir.</p>
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
                                    <img src="/images/brasao.png" alt="Brasão Alfenas" />
                                </div>
                                <div className="titulo-centro">
                                    <h2>Prefeitura Municipal de Alfenas</h2>
                                    <h3>Secretaria de Ação Social</h3>
                                </div>
                                <div className="logo-dir">
                                    <img src="/images/cras-logo.png" alt="Logo CRAS" />
                                </div>
                            </div>

                            <div className="titulo-documento">
                                <h2>Relatório de Estoque Baixo</h2>
                            </div>

                            {/* Tabela */}
                            <div className="tabela-container">
                                <h3>Itens com Estoque Crítico (Página {pageIndex + 1}/{chunks.length})</h3>
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

                /* Estilos de impressão */
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
