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

  return (
    <div>
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
  );
};

export default ControleEstoque;
