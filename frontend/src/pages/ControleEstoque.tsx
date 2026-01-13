import React, { useState, useMemo } from 'react';
import { useProdutos } from '../context/ProdutoContext';
import { Printer, Search } from 'lucide-react';
import Pagination from '../components/Pagination';

type FiltroEstoque = 'todos' | 'critico' | 'sem-estoque';

const ITEMS_PER_PAGE = 10;

const ControleEstoque: React.FC = () => {
  const { produtos, loading } = useProdutos();
  const [filtro, setFiltro] = useState<FiltroEstoque>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const limiteEstoqueCritico = 5;

  const produtosFiltrados = useMemo(() => {
    let filtered = produtos;

    // Aplicar filtro de status
    if (filtro === 'critico') {
      filtered = filtered.filter(p => p.quantidade > 0 && p.quantidade <= limiteEstoqueCritico);
    } else if (filtro === 'sem-estoque') {
      filtered = filtered.filter(p => p.quantidade === 0);
    }

    // Aplicar busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nome.toLowerCase().includes(term) ||
        p.codigo_barras?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [produtos, filtro, searchTerm, limiteEstoqueCritico]);

  const paginatedProdutos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return produtosFiltrados.slice(startIndex, endIndex);
  }, [produtosFiltrados, currentPage]);

  const totalPages = Math.ceil(produtosFiltrados.length / ITEMS_PER_PAGE);

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  const formatarData = (data: Date) => {
    return data.toLocaleString('pt-BR');
  };

  return (
    <div>
      {/* Conteúdo apenas da Tela */}
      <div className="screen-only">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 'var(--space-6)',
          gap: 'var(--space-4)',
          flexWrap: 'wrap'
        }}>
          <div className="page-header">
            <h1 className="page-title">Controle de Estoque</h1>
            <p className="page-subtitle">Gerencie e visualize todo o seu inventário</p>
          </div>
          <button
            onClick={() => window.print()}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}
          >
            <Printer size={18} />
            Imprimir
          </button>
        </div>

        {/* Tabela */}
        <div className="card-base">
          <div style={{
            display: 'flex',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '250px' }}>
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
                placeholder="Buscar por nome ou código..."
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

            <div className="tabs-container">
              <button
                onClick={() => {
                  setFiltro('todos');
                  setCurrentPage(1);
                }}
                className={`tab-button ${filtro === 'todos' ? 'tab-active' : ''}`}
              >
                Todos
              </button>
              <button
                onClick={() => {
                  setFiltro('critico');
                  setCurrentPage(1);
                }}
                className={`tab-button ${filtro === 'critico' ? 'tab-active' : ''}`}
              >
                Estoque Crítico
              </button>
              <button
                onClick={() => {
                  setFiltro('sem-estoque');
                  setCurrentPage(1);
                }}
                className={`tab-button ${filtro === 'sem-estoque' ? 'tab-active' : ''}`}
              >
                Sem Estoque
              </button>
            </div>
          </div>

          {produtosFiltrados.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-8)',
              color: 'var(--text-muted)'
            }}>
              Nenhum produto encontrado nesta categoria.
            </div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th className="hide-mobile">Código</th>
                    <th>Produto</th>
                    <th style={{ textAlign: 'center' }}>Quantidade</th>
                    <th style={{ textAlign: 'center' }} className="hide-mobile">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProdutos.map(produto => {
                    let statusColor = 'var(--status-success)';
                    let statusText = 'Normal';

                    if (produto.quantidade === 0) {
                      statusColor = 'var(--status-error)';
                      statusText = 'Sem Estoque';
                    } else if (produto.quantidade <= limiteEstoqueCritico) {
                      statusColor = 'var(--status-warning)';
                      statusText = 'Crítico';
                    }

                    return (
                      <tr key={produto.id}>
                        <td className="hide-mobile mono">{produto.codigo_barras}</td>
                        <td>{produto.nome}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="mono" style={{
                            color: statusColor,
                            fontWeight: 'var(--font-semibold)'
                          }}>
                            {produto.quantidade}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }} className="hide-mobile">
                          <div className={
                            statusText === 'Normal' ? 'badge badge-success' :
                              statusText === 'Crítico' ? 'badge badge-warning' :
                                'badge badge-error'
                          }>
                            {statusText}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Layout de Impressão (Estilo Comprovante) */}
      <div className="print-only" style={{ display: 'none' }}>
        {(() => {
          const ITENS_POR_PAGINA = 17; // Mais itens por página pois a lista é compacta
          const chunks = produtosFiltrados.length > 0
            ? Array.from({ length: Math.ceil(produtosFiltrados.length / ITENS_POR_PAGINA) }, (_, i) =>
              produtosFiltrados.slice(i * ITENS_POR_PAGINA, i * ITENS_POR_PAGINA + ITENS_POR_PAGINA)
            )
            : [[]];

          return chunks.map((chunk, pageIndex) => (
            <div
              key={pageIndex}
              className="print-page"
              style={{
                background: 'white',
                padding: '40px',
                marginBottom: '0',
                height: 'auto',
                minHeight: '29.7cm',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                pageBreakAfter: 'always'
              }}
            >
              {/* Cabeçalho */}
              <div className="print-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '2px solid #000',
                paddingBottom: '20px'
              }}>
                <div className="logo-esq" style={{ width: '100px', textAlign: 'center' }}>
                  <img src="/images/brasao.png" alt="Brasão" style={{ width: '100%', maxWidth: '80px' }} />
                </div>
                <div className="titulo-centro" style={{ flex: 1, textAlign: 'center', color: '#000' }}>
                  <h2 style={{ margin: '0 0 5px 0', fontSize: '16px', textTransform: 'uppercase', fontWeight: 'bold', color: '#000' }}>Prefeitura Municipal de Alfenas</h2>
                  <h3 style={{ margin: '0', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'normal', color: '#000' }}>Secretaria de Ação Social</h3>
                </div>
                <div className="logo-dir" style={{ width: '100px', textAlign: 'center' }}>
                  <img src="/images/cras-logo.png" alt="Logo CRAS" style={{ width: '100%', maxWidth: '100px' }} />
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline', color: '#000' }}>Controle de Estoque</h2>
              </div>

              {/* Tabela de Itens */}
              <div className="documentos-itens" style={{ flex: 1 }}>
                <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#000' }}>Itens em Estoque (Página {pageIndex + 1}/{chunks.length})</h3>
                <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
                  <thead>
                    <tr style={{ background: '#f0f0f0' }}>
                      <th style={{ textAlign: 'left', padding: '8px', color: '#000', border: '1px solid #000', fontSize: '12px' }}>Cód.</th>
                      <th style={{ textAlign: 'left', padding: '8px', color: '#000', border: '1px solid #000', fontSize: '12px' }}>Produto</th>
                      <th style={{ textAlign: 'center', padding: '8px', color: '#000', border: '1px solid #000', fontSize: '12px', width: '100px' }}>Qtd.</th>
                      <th style={{ textAlign: 'center', padding: '8px', color: '#000', border: '1px solid #000', fontSize: '12px', width: '120px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.map((item) => (
                      <tr key={item.id}>
                        <td style={{ padding: '8px', color: '#000', border: '1px solid #000', fontSize: '12px' }}>{item.codigo_barras || '-'}</td>
                        <td style={{ padding: '8px', color: '#000', border: '1px solid #000', fontSize: '12px' }}>{item.nome}</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#000', border: '1px solid #000', fontSize: '12px', fontWeight: 'bold' }}>{item.quantidade}</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#000', border: '1px solid #000', fontSize: '12px' }}>
                          {item.quantidade === 0 ? 'SEM ESTOQUE' : item.quantidade <= limiteEstoqueCritico ? 'CRÍTICO' : 'NORMAL'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rodapé */}
              <div className="documento-footer" style={{ marginTop: 'auto', paddingTop: '40px', textAlign: 'center' }}>
                <div className="assinatura" style={{ marginTop: '20px' }}>
                  <p style={{ marginBottom: '5px', color: '#000' }}>_______________________________________</p>
                  <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#000' }}>Responsável pelo Estoque</p>
                </div>
                <div className="data-documento" style={{ marginTop: '20px', fontSize: '12px', color: '#000' }}>
                  <p>Emitido em: {formatarData(new Date())} - Página {pageIndex + 1}/{chunks.length}</p>
                </div>
              </div>
            </div>
          ));
        })()}
      </div>

      <style>{`
        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          .sidebar, .screen-only, .no-print, .mobile-header {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .layout-container {
            display: block !important;
            grid-template-columns: 1fr !important;
          }
          .content-area {
            padding: 0 !important;
            background: white !important;
          }
          
          /* Reset Styles */
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
          
          /* Ensure Table Borders Print */
          table { border-collapse: collapse !important; }
          td, th { border: 1px solid black !important; color: black !important; }
        }
      `}</style>
    </div>
  );
};

export default ControleEstoque;
