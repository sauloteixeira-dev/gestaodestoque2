import React, { useState } from 'react';
import { useSaida } from '../context/SaidaContext';
import { type SaidaEstoque } from '../types';
import { FileText, X, Printer, User, Calendar, MapPin, Package, ChevronDown, ChevronUp, Search, Info } from 'lucide-react';

const HistoricoSaidas: React.FC = () => {
  const { saidas, loading } = useSaida();
  const [saidaSelecionada, setSaidaSelecionada] = useState<SaidaEstoque | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [termoBusca, setTermoBusca] = useState('');

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const gerarDocumento = (e: React.MouseEvent, saida: SaidaEstoque) => {
    e.stopPropagation();
    setSaidaSelecionada(saida);
  };

  const fecharDocumento = () => {
    setSaidaSelecionada(null);
  };

  const saidasFiltradas = saidas.filter(s =>
    s.usuario_retirada.toLowerCase().includes(termoBusca.toLowerCase()) ||
    s.local?.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Carregando histórico...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Histórico de Retiradas</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log completo de movimentações.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Filtrar por nome ou local..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="input-field"
            style={{ width: '300px', paddingLeft: '38px' }}
          />
        </div>
      </div>

      <div className="card-base" style={{ padding: 0, overflow: 'hidden', overflowX: 'auto' }}>
        <div style={{ minWidth: '800px' }}> {/* Ensure minimum width to maintain layout integrity */}
          {saidasFiltradas.length > 0 ? (
            <div>
              {/* Header da Tabela (Visual) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 100px 50px',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <div>Data</div>
                <div>Local</div>
                <div>Responsável</div>
                <div style={{ textAlign: 'center' }}>Qtd. Itens</div>
                <div></div>
              </div>

              {saidasFiltradas.map((saida) => {
                const isExpanded = expandedId === saida.id;
                const totalItens = saida.itens?.reduce((acc, item) => acc + item.quantidade, 0) || 0;

                return (
                  <div key={saida.id} style={{
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: isExpanded ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}>
                    {/* Linha Resumo (Clicável) */}
                    <div
                      onClick={() => toggleExpand(saida.id)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 100px 50px',
                        padding: '1.2rem 1.5rem',
                        alignItems: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                        <Calendar size={16} color="var(--accent-primary)" />
                        {formatarData(saida.data_saida)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} color="var(--text-secondary)" />
                        {saida.local?.nome || '—'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={16} color="var(--text-secondary)" />
                        {saida.usuario_retirada}
                      </div>
                      <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>
                        {totalItens}
                      </div>
                      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    {/* Área Expandida (Detalhes) */}
                    {isExpanded && (
                      <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', animation: 'fadeIn 0.3s ease-in-out' }}>
                        <div style={{
                          backgroundColor: 'var(--bg-primary)',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          border: '1px solid var(--border-color)'
                        }}>

                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Detalhes da Solicitação</h4>
                              {saida.observacoes ? (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--text-primary)', fontStyle: 'italic', maxWidth: '500px' }}>
                                  <Info size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                                  "{saida.observacoes}"
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sem observações.</span>
                              )}
                            </div>
                            <button
                              onClick={(e) => gerarDocumento(e, saida)}
                              className="btn-primary"
                              style={{ height: 'fit-content' }}
                            >
                              <Printer size={16} /> Imprimir Comprovante
                            </button>
                          </div>

                          <table style={{ width: '100%', fontSize: '0.9rem' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)' }}>Produto</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-secondary)' }}>Código</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-secondary)' }}>Qtd. Retirada</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem', color: 'var(--text-secondary)' }}>Saldo Estoque</th>
                              </tr>
                            </thead>
                            <tbody>
                              {saida.itens?.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                  <td style={{ padding: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Package size={14} color="var(--accent-primary)" />
                                    {item.produto_nome}
                                  </td>
                                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{item.produto_codigo_barras}</td>
                                  <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-primary)' }}>{item.quantidade}</td>
                                  <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>{item.produto_quantidade_antes - item.quantidade}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Nenhum registro encontrado.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal do Documento Corrigido */}
      {saidaSelecionada && (
        <div className="documento-modal-overlay">
          <div className="documento-modal">

            {/* HEADER FIXO */}
            <div className="documento-header no-print" style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'white',
              borderRadius: '8px 8px 0 0',
              flexShrink: 0
            }}>
              <h2 style={{ color: '#1e293b', fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>Visualização de Impressão</h2>
              <button
                onClick={fecharDocumento}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}>
                <X size={20} />
              </button>
            </div>

            {/* CONTEÚDO COM SCROLL */}
            <div className="documento-content-scroll" style={{
              background: '#475569',
              padding: '2rem',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}>
              {(() => {
                const ITENS_POR_PAGINA = 10;
                const itens = saidaSelecionada.itens || [];
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
                      padding: '2cm',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      minHeight: '29.7cm',
                      width: '21cm',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      color: 'black'
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
                      <div className="logo-esq" style={{ width: '80px', textAlign: 'center' }}>
                        <img src="/images/brasao.png" alt="Brasão" style={{ width: '100%', height: 'auto' }} />
                      </div>
                      <div className="titulo-centro" style={{ flex: 1, textAlign: 'center', color: '#000' }}>
                        <h2 style={{ margin: '0 0 5px 0', fontSize: '14pt', textTransform: 'uppercase', fontWeight: 'bold', color: '#000' }}>Prefeitura Municipal de Alfenas</h2>
                        <h3 style={{ margin: '0', fontSize: '10pt', textTransform: 'uppercase', fontWeight: 'normal', color: '#000' }}>Secretaria de Ação Social</h3>
                      </div>
                      <div className="logo-dir" style={{ width: '100px', textAlign: 'center' }}>
                        <img src="/images/cras-logo.png" alt="Logo" style={{ width: '100%', height: 'auto' }} />
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                      <h2 style={{ fontSize: '16pt', fontWeight: 'bold', textDecoration: 'underline', color: '#000', textTransform: 'uppercase' }}>Entrega de Mercadoria</h2>
                    </div>

                    {/* Dados */}
                    <div className="documento-info" style={{ marginBottom: '30px', fontSize: '11pt', lineHeight: '1.5' }}>
                      <div className="info-row" style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#000' }}><strong>Local de Destino:</strong> {saidaSelecionada.local?.nome}</span>
                      </div>
                      <div className="info-row" style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#000' }}><strong>Responsável:</strong> {saidaSelecionada.usuario_retirada}</span>
                      </div>
                      <div className="info-row" style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#000' }}><strong>Data da Saída:</strong> {formatarData(saidaSelecionada.data_saida)}</span>
                      </div>
                      {saidaSelecionada.observacoes && (
                        <div className="info-row" style={{ marginBottom: '8px' }}>
                          <span style={{ color: '#000' }}><strong>Observações:</strong> {saidaSelecionada.observacoes}</span>
                        </div>
                      )}
                    </div>

                    {/* Tabela */}
                    <div className="documentos-itens" style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '12pt', marginBottom: '10px', color: '#000', fontWeight: 'bold' }}>Relação de Itens (Página {pageIndex + 1}/{chunks.length})</h3>
                      <table className="print-table">
                        <thead>
                          <tr style={{ background: '#f0f0f0' }}>
                            <th style={{ textAlign: 'left', padding: '8px', color: '#000', border: '1px solid #000' }}>Produto</th>
                            <th style={{ textAlign: 'center', padding: '8px', width: '100px', whiteSpace: 'nowrap', color: '#000', border: '1px solid #000' }}>Qtde</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chunk.map((item, index) => (
                            <tr key={index}>
                              <td style={{ padding: '8px', color: '#000', border: '1px solid #000' }}>{item.produto_nome}</td>
                              <td style={{ padding: '8px', textAlign: 'center', color: '#000', border: '1px solid #000', fontWeight: 'bold' }}>{item.quantidade}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Rodapé */}
                    <div className="documento-footer" style={{ marginTop: 'auto', paddingTop: '40px', textAlign: 'center' }}>
                      <div className="assinatura" style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '60%', borderTop: '1px solid #000', marginBottom: '5px' }}></div>
                        <p style={{ fontWeight: 'bold', fontSize: '11pt', color: '#000', margin: 0 }}>Assinatura do Recebedor</p>
                      </div>
                      <div className="data-documento" style={{ marginTop: '30px', fontSize: '9pt', color: '#666' }}>
                        <p>Documento gerado em: {formatarData(new Date().toISOString())}</p>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* FOOTER FIXO */}
            <div className="documento-actions no-print" style={{
              padding: '1.5rem',
              background: 'white',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              borderRadius: '0 0 8px 8px',
              flexShrink: 0
            }}>
              <button
                onClick={fecharDocumento}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#475569',
                  fontSize: '0.95rem'
                }}>
                Cancelar
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.95rem',
                  padding: '0.75rem 2rem'
                }}>
                <Printer size={20} />
                Imprimir Documento
              </button>
            </div>

            <style>{`
              .documento-modal-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(4px);
                display: flex !important; justify-content: center !important; align-items: center !important;
                z-index: 9999;
              }
              .documento-modal {
                background: white; padding: 0; border-radius: 8px;
                width: 95%; max-width: 1000px; 
                max-height: 85vh; /* Reduced height to ensure margins */
                height: 100%;
                margin: auto; /* Fallback centering */
                display: flex; flex-direction: column;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                color: black;
              }
              table.print-table {
                width: 100% !important; border-collapse: collapse !important; border: 1px solid black !important;
                margin-top: 10px !important; background: white !important; color: black !important;
                box-shadow: none !important; border-radius: 0 !important; fontSize: 11pt !important;
              }
              table.print-table th, table.print-table td {
                background: white !important; color: black !important; border: 1px solid black !important;
                padding: 10px !important; text-align: left;
              }
              @media print {
                @page { margin: 0; size: A4; }
                body { background: white !important; }
                body * { visibility: hidden; }
                
                .documento-modal-overlay { 
                    position: absolute; left: 0; top: 0; width: 100%; height: auto; 
                    background: white !important; backdrop-filter: none; z-index: 9999; display: block;
                }
                .documento-modal-overlay * { visibility: visible; }
                
                .documento-modal { 
                    box-shadow: none; width: 100%; max-width: none; height: auto; 
                    border-radius: 0; display: block; overflow: visible;
                }
                
                .documento-header, .documento-actions, .no-print { display: none !important; }
                
                .documento-content-scroll {
                    background: white !important; padding: 0 !important; overflow: visible !important; display: block !important;
                }

                .print-page {
                    box-shadow: none !important; margin: 0 !important; 
                    min-height: 297mm; height: auto; 
                    width: 100% !important; max-width: 210mm !important;
                    page-break-after: always; break-after: page;
                    padding: 15mm !important;
                }
                .print-page:last-child { page-break-after: auto; break-after: auto; }
                
                * { color: black !important; text-shadow: none !important; box-shadow: none !important; }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricoSaidas;
