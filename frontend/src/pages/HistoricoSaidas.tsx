import React, { useState, useMemo } from 'react';
import { useSaida } from '../context/SaidaContext';
import { useDevolucao } from '../context/DevolucaoContext';
import { useAuth } from '../context/AuthContext';
import { type SaidaEstoque, type Devolucao } from '../types';
import Pagination from '../components/Pagination';
import { Search } from 'lucide-react';
import ProcessarDevolucao from './ProcessarDevolucao';

const ITEMS_PER_PAGE = 10;

const HistoricoSaidas: React.FC = () => {
  const { saidas, loading, buscarSaidas } = useSaida();
  const { buscarDevolucao } = useDevolucao();
  const { profile: currentUserProfile, user: currentUser } = useAuth();
  const [saidaSelecionada, setSaidaSelecionada] = useState<SaidaEstoque | null>(null);
  const [saidaParaDevolucao, setSaidaParaDevolucao] = useState<SaidaEstoque | null>(null);
  const [devolucaoSelecionada, setDevolucaoSelecionada] = useState<Devolucao | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [termoBusca, setTermoBusca] = useState('');
  const [dataFiltro, setDataFiltro] = useState('');


  const formatName = (name: string) => {
    if (!name) return name;
    return name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
  };

  const filteredSaidas = useMemo(() => {
    let filtered = saidas;

    // Aplicar filtro de texto
    if (termoBusca) {
      const term = termoBusca.toLowerCase();
      filtered = filtered.filter(saida =>
        saida.local?.nome.toLowerCase().includes(term) ||
        saida.usuario_retirada.toLowerCase().includes(term)
      );
    }

    // Aplicar filtro de data
    if (dataFiltro) {
      filtered = filtered.filter(saida => {
        const dataSaida = new Date(saida.data_saida);
        const dataFiltroInicio = new Date(dataFiltro + 'T00:00:00');
        const dataFiltroFim = new Date(dataFiltro + 'T23:59:59');
        return dataSaida >= dataFiltroInicio && dataSaida <= dataFiltroFim;
      });
    }

    return filtered;
  }, [saidas, termoBusca, dataFiltro]);

  const paginatedSaidas = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredSaidas.slice(startIndex, endIndex);
  }, [filteredSaidas, currentPage]);

  const totalPages = Math.ceil(filteredSaidas.length / ITEMS_PER_PAGE);

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleString('pt-BR');
  };

  const gerarDocumento = (saida: SaidaEstoque) => {
    setSaidaSelecionada(saida);
  };

  const fecharDocumento = () => {
    setSaidaSelecionada(null);
  };

  const abrirDevolucao = (saida: SaidaEstoque) => {
    setSaidaParaDevolucao(saida);
  };

  const fecharDevolucao = () => {
    setSaidaParaDevolucao(null);
  };

  const handleDevolucaoSuccess = async (resultado?: any) => {
    // Recarregar saídas para garantir que temos os dados mais recentes na lista
    buscarSaidas();
    setSaidaParaDevolucao(null);

    // Se tivermos o resultado da devolução, buscar os detalhes completos para mostrar o comprovante
    if (resultado && resultado.devolucao_id) {
      try {
        const devCompleta = await buscarDevolucao(resultado.devolucao_id);
        if (devCompleta) {
          // Fallback para o usuário logado se o nome não vier na busca da devolução
          if (!devCompleta.usuario?.nome || devCompleta.usuario.nome === 'Usuário desconhecido') {
            const nomeFallback = currentUserProfile?.nickname || currentUser?.email || 'Usuário Logado';
            devCompleta.usuario = {
              ...devCompleta.usuario,
              nome: nomeFallback
            };
          }
          setDevolucaoSelecionada(devCompleta);
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes da devolução para o comprovante:', error);
      }
    }
  };

  if (loading) {
    return <p>Carregando histórico de saídas...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Comprovantes de Saída</h1>
        <p className="page-subtitle">Histórico de movimentações de estoque</p>
      </div>

      <div className="card-base">
        {saidas.length > 0 ? (
          <>
            <div style={{
              display: 'flex',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
              flexWrap: 'wrap',
              alignItems: 'flex-end'
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
                  placeholder="Buscar por local ou responsável..."
                  value={termoBusca}
                  onChange={(e) => {
                    setTermoBusca(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input-field"
                  style={{
                    paddingLeft: 'calc(var(--space-3) + 24px)'
                  }}
                />
              </div>

              <input
                type="date"
                value={dataFiltro}
                onChange={(e) => {
                  setDataFiltro(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field"
                style={{ width: '180px' }}
              />
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Local</th>
                    <th>Responsável</th>
                    <th style={{ textAlign: 'center' }}>Itens</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSaidas.map(saida => (
                    <tr key={saida.id}>
                      <td className="mono">{formatarData(saida.data_saida)}</td>
                      <td>{saida.local?.nome || 'Local não informado'}</td>
                      <td>{formatName(saida.usuario_retirada)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div>
                          <span className="mono" style={{
                            fontWeight: 'var(--font-semibold)',
                            color: 'var(--text-primary)'
                          }}>
                            {saida.itens?.length || 0}
                          </span>
                          {saida.tem_devolucao && (
                            <div style={{
                              marginTop: 'var(--space-1)',
                              fontSize: 'var(--text-xs)',
                              color: 'var(--warning-text)',
                              fontWeight: 'var(--font-medium)'
                            }}>
                              ⚠️ {saida.total_itens_devolvidos} devolvidos
                            </div>
                          )}
                          {saida.devolucoes && saida.devolucoes.length > 0 && (
                            <div style={{ marginTop: 'var(--space-2)' }}>
                              {saida.devolucoes.map((dev) => (
                                <button
                                  key={dev.id}
                                  onClick={async () => {
                                    const devCompleta = await buscarDevolucao(dev.id);
                                    if (devCompleta) {
                                      // Garantir que temos um nome de usuário
                                      if (!devCompleta.usuario?.nome || devCompleta.usuario.nome === 'Usuário desconhecido') {
                                        const nomeFallback = currentUserProfile?.nickname || currentUser?.email || 'Usuário Logado';
                                        devCompleta.usuario = {
                                          ...devCompleta.usuario,
                                          nome: nomeFallback
                                        };
                                      }
                                      setDevolucaoSelecionada(devCompleta);
                                    } else {
                                      setDevolucaoSelecionada(dev);
                                    }
                                  }}
                                  className="btn-info"
                                  style={{
                                    padding: '2px 6px',
                                    fontSize: '10px',
                                    marginBottom: '2px',
                                    display: 'block',
                                    width: '100%',
                                    background: 'var(--info-bg)',
                                    color: 'var(--info-text)',
                                    border: '1px solid var(--info-border)',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  📄 {dev.comprovante_numero}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => abrirDevolucao(saida)}
                            className="btn-secondary"
                            style={{
                              padding: 'var(--space-2) var(--space-3)',
                              fontSize: 'var(--text-sm)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            ↩️ Devolver
                          </button>
                          <button
                            onClick={() => gerarDocumento(saida)}
                            className="btn-secondary"
                            style={{
                              padding: 'var(--space-2) var(--space-3)',
                              fontSize: 'var(--text-sm)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            📄 Ver Comprovante
                          </button>
                        </div>
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
            Nenhuma saída registrada ainda.
          </div>
        )}
      </div>



      {/* Modal do Documento */}
      {saidaSelecionada && (
        <div className="documento-modal-overlay">
          <div className="documento-modal">

            <div className="documento-header no-print">
              <h2>Documento de Saída</h2>
              <button onClick={fecharDocumento} className="btn-fechar">✕</button>
            </div>

            <div className="documento-content" id="documento-para-impressao" style={{ background: '#eee', padding: '20px' }}>
              {(() => {
                const ITENS_POR_PAGINA = 10;
                const itens = saidaSelecionada.itens || [];
                // Se não tiver itens, cria um array com 1 chunk vazio para renderizar pelo menos o cabeçalho
                const chunks = itens.length > 0
                  ? Array.from({ length: Math.ceil(itens.length / ITENS_POR_PAGINA) }, (_, i) =>
                    itens.slice(i * ITENS_POR_PAGINA, i * ITENS_POR_PAGINA + ITENS_POR_PAGINA)
                  )
                  : [[]];

                return chunks.map((chunk, pageIndex) => (
                  <div
                    key={pageIndex}
                    className="print-page"
                    style={{
                      background: 'white',
                      padding: '40px',
                      marginBottom: '20px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      minHeight: '29.7cm', // Altura A4 aproximada
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Cabeçalho - Repete em todas as páginas */}
                    <div className="print-header" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px',
                      borderBottom: '2px solid #000',
                      paddingBottom: '20px'
                    }}>
                      <div className="logo-esq" style={{ width: '100px', textAlign: 'center' }}>
                        <img src="/images/brasao.png" alt="Brasão Alfenas" style={{ width: '100%', maxWidth: '80px' }} />
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
                      <h2 style={{ fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline', color: '#000' }}>Entrega de Mercadoria</h2>
                    </div>

                    {/* Dados da Saída - Repete em todas as páginas */}
                    <div className="documento-info" style={{ marginBottom: '20px', fontSize: '14px' }}>
                      <div className="info-row" style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#000' }}><strong>Local:</strong> {saidaSelecionada.local?.nome}</span>
                      </div>
                      <div className="info-row" style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#000' }}><strong>Nome do Responsável:</strong> {formatName(saidaSelecionada.usuario_retirada)}</span>
                      </div>
                      <div className="info-row" style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#000' }}><strong>Data:</strong> {formatarData(saidaSelecionada.data_saida)}</span>
                      </div>
                      {saidaSelecionada.observacoes && (
                        <div className="info-row" style={{ marginBottom: '8px' }}>
                          <span style={{ color: '#000' }}><strong>Observações:</strong> {saidaSelecionada.observacoes}</span>
                        </div>
                      )}
                    </div>

                    {/* Tabela de Itens - Apenas itens deste chunk */}
                    <div className="documentos-itens" style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#000' }}>Relação de Itens (Página {pageIndex + 1}/{chunks.length})</h3>
                      <table className="print-table">
                        <thead>
                          <tr style={{ background: '#f0f0f0' }}>
                            <th style={{ textAlign: 'left', padding: '8px', color: '#000', border: '1px solid #000' }}>Produto</th>
                            <th style={{ textAlign: 'center', padding: '8px', minWidth: '100px', whiteSpace: 'nowrap', color: '#000', border: '1px solid #000' }}>Quantidade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chunk.map((item, index) => (
                            <tr key={index}>
                              <td style={{ padding: '8px', color: '#000', border: '1px solid #000' }}>
                                {item.produto_nome}
                                {/* Exibir unidade se disponível e não estiver no nome (para compatibilidade retroativa) */}
                                {item.produto?.unidade && !item.produto_nome.includes(item.produto.unidade) && (
                                  <span style={{ marginLeft: '4px' }}>{item.produto.unidade}</span>
                                )}
                              </td>
                              <td style={{ padding: '8px', textAlign: 'center', color: '#000', border: '1px solid #000', fontWeight: 'bold' }}>{item.quantidade}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>



                    {/* Rodapé - Repete em todas as páginas */}
                    <div className="documento-footer" style={{ marginTop: 'auto', paddingTop: '40px', textAlign: 'center' }}>
                      <div className="assinatura" style={{ marginTop: '20px' }}>
                        <p style={{ marginBottom: '5px', color: '#000' }}>_______________________________________</p>
                        <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#000' }}>Assinatura do Responsável</p>
                      </div>
                      <div className="data-documento" style={{ marginTop: '20px', fontSize: '12px', color: '#000' }}>
                        <p>Emitido em: {formatarData(new Date().toISOString())} - Página {pageIndex + 1}/{chunks.length}</p>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className="documento-actions no-print">
              <button
                onClick={() => {
                  const element = document.getElementById('documento-para-impressao');
                  if (element) {
                    window.print();
                  }
                }}
                className="btn-fechar-doc"
              >
                🖨️ Imprimir Documento de Saída
              </button>
              <button onClick={fecharDocumento} className="btn-fechar-doc">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal do Comprovante de Devolução */}
      {devolucaoSelecionada && (<>
        <div className="documento-modal-overlay">
          <div className="documento-modal">
            <div className="documento-header no-print">
              <h2>Comprovante de Devolução</h2>
              <button onClick={() => setDevolucaoSelecionada(null)} className="btn-fechar">✕</button>
            </div>

            <div className="documento-content" id="documento-devolucao-impressao" style={{ background: 'var(--bg-secondary)', padding: '20px' }}>
              <div className="folha-devolucao" style={{
                background: 'white',
                width: '100%',
                maxWidth: '21cm',
                minHeight: '29.7cm',
                margin: '0 auto',
                padding: '1.5cm',
                display: 'flex',
                flexDirection: 'column',
                color: '#000',
                boxSizing: 'border-box'
              }}>
                <div className="documento-cabecalho" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  borderBottom: '2px solid #000',
                  paddingBottom: '20px'
                }}>
                  <div className="logo-esq" style={{ width: '100px', textAlign: 'center' }}>
                    <img src="/images/brasao.png" alt="Brasão Alfenas" style={{ width: '100%', maxWidth: '80px' }} />
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
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline', color: '#000', margin: 0 }}>Comprovante de Devolução</h2>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold', color: '#000' }}>Nº {devolucaoSelecionada.comprovante_numero}</p>
                </div>

                <div className="documento-info" style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', borderBottom: '1px solid #000', paddingBottom: '5px', marginBottom: '10px', color: '#000' }}>Informações Gerais</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <p style={{ fontSize: '14px', margin: '4px 0', color: '#000' }}><strong>Data da Devolução:</strong> {formatarData(devolucaoSelecionada.data_devolucao)}</p>
                      <p style={{ fontSize: '14px', margin: '4px 0', color: '#000' }}><strong>Processado por:</strong> {formatName(devolucaoSelecionada.usuario?.nome || currentUserProfile?.nickname || currentUser?.email || 'Não informado')}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', margin: '4px 0', color: '#000' }}><strong>Saída Original:</strong> #{devolucaoSelecionada.saida_id}</p>
                      <p style={{ fontSize: '14px', margin: '4px 0', color: '#000' }}><strong>Local:</strong> {devolucaoSelecionada.saida?.local?.nome || 'Não informado'}</p>
                    </div>
                  </div>
                  {devolucaoSelecionada.observacao && (
                    <div style={{ marginTop: '10px', padding: '10px', background: '#f5f5f5', border: '1px solid #ccc' }}>
                      <p style={{ fontSize: '14px', margin: 0, color: '#000' }}><strong>Observações/Motivo:</strong> {devolucaoSelecionada.observacao}</p>
                    </div>
                  )}
                </div>

                <div className="documentos-itens" style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#000' }}>Relação de Itens Devolvidos</h3>
                  <table className="print-table">
                    <thead>
                      <tr style={{ background: '#f0f0f0' }}>
                        <th style={{ padding: '8px', border: '1px solid #000', color: '#000' }}>Produto</th>
                        <th style={{ padding: '8px', border: '1px solid #000', color: '#000' }}>Cód. Barras</th>
                        <th style={{ textAlign: 'center', padding: '8px', width: '80px', border: '1px solid #000', color: '#000' }}>Qtd</th>
                        <th style={{ padding: '8px', border: '1px solid #000', color: '#000' }}>Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devolucaoSelecionada.itens?.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '8px', border: '1px solid #000', color: '#000' }}>
                            {item.produto_nome}
                            {/* Exibir unidade se disponível e não estiver no nome (para compatibilidade retroativa) */}
                            {item.produto?.unidade && !item.produto_nome.includes(item.produto.unidade) && (
                              <span style={{ marginLeft: '4px' }}>{item.produto.unidade}</span>
                            )}
                          </td>
                          <td style={{ padding: '8px', border: '1px solid #000', color: '#000' }} className="mono">{item.produto_codigo_barras || '-'}</td>
                          <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #000', color: '#000' }}>{item.quantidade_devolvida}</td>
                          <td style={{ padding: '8px', fontSize: '12px', border: '1px solid #000', color: '#000' }}>{item.motivo || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="documento-footer" style={{ marginTop: 'auto', paddingTop: '40px', textAlign: 'center' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                    <div className="assinatura">
                      <p style={{ marginBottom: '5px', color: '#000' }}>_______________________________________</p>
                      <p style={{ fontWeight: 'bold', fontSize: '12px', color: '#000' }}>Conferido por</p>
                    </div>
                    <div className="assinatura">
                      <p style={{ marginBottom: '5px', color: '#000' }}>_______________________________________</p>
                      <p style={{ fontWeight: 'bold', fontSize: '12px', color: '#000' }}>Assinatura do Responsável</p>
                    </div>
                  </div>
                  <div className="data-documento" style={{ marginTop: '30px', fontSize: '11px', color: '#000' }}>
                    <p>Documento gerado pelo StockOS em {formatarData(new Date().toISOString())}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="documento-actions no-print">
              <button
                onClick={() => {
                  window.print();
                }}
                className="btn-fechar-doc"
              >
                🖨️ Imprimir Comprovante de Devolução
              </button>
              <button onClick={() => setDevolucaoSelecionada(null)} className="btn-fechar-doc">
                Fechar
              </button>
            </div>
          </div>
        </div>
      </>)
      }

      {/* Modal de Processamento de Devolução */}
      {saidaParaDevolucao && (
        <ProcessarDevolucao
          saida={saidaParaDevolucao}
          onClose={fecharDevolucao}
          onSuccess={handleDevolucaoSuccess}
        />
      )}

      <style>{`
        .documento-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          padding: 20px;
        }

        .documento-modal {
          background: var(--bg-primary);
          color: var(--text-primary);
          padding: 0;
          border-radius: 8px;
          border: 1px solid var(--border);
          width: 95%;
          max-width: 1000px;
          max-height: 95vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          position: relative;
        }

        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }
          
          /* Esconder elementos de interface */
          .sidebar, .mobile-header, .page-header, .card-base, .no-print, .btn-fechar, .documento-header {
            display: none !important;
          }

          .documento-modal-overlay {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            z-index: 9999 !important;
            display: block !important;
          }

          .documento-modal {
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            max-height: none !important;
            overflow-y: visible !important;
          }

          .documento-content {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Estilos específicos para DEVOLUÇÃO - Evita quebrar a Entrega de Mercadoria */
          .folha-devolucao {
            box-shadow: none !important;
            margin: 0 auto !important;
            padding: 1.5cm !important;
            width: 21cm !important;
            min-height: 29.7cm !important;
            background: white !important;
            display: flex !important;
            flex-direction: column !important;
          }

          /* Manter a Entrega de Mercadoria (print-page) como flexbox para o footer funcionar */
          .print-page {
            box-shadow: none !important;
            margin: 0 auto !important;
            padding: 1.5cm !important;
            width: 21cm !important;
            min-height: 29.7cm !important;
            background: white !important;
            display: flex !important;
            flex-direction: column !important;
            box-sizing: border-box !important;
          }

          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color: #000 !important;
          }
        }
      `}</style>
    </div>

  );
};

export default HistoricoSaidas;
