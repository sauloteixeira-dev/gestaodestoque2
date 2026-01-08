import React, { useState } from 'react';
import { useSaida } from '../context/SaidaContext';
import { type SaidaEstoque } from '../types';


const HistoricoSaidas: React.FC = () => {
  const { saidas, loading } = useSaida();
  const [saidaSelecionada, setSaidaSelecionada] = useState<SaidaEstoque | null>(null);

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleString('pt-BR');
  };

  const gerarDocumento = (saida: SaidaEstoque) => {

    setSaidaSelecionada(saida);
  };

  const fecharDocumento = () => {
    setSaidaSelecionada(null);
  };

  if (loading) {
    return <p>Carregando histórico de saídas...</p>;
  }

  return (
    <div className="historico-saidas-container">
      <div className="card">
        <h2>Histórico de Saídas de Estoque</h2>

        {saidas.length > 0 ? (
          <div className="saidas-list">
            {saidas.map(saida => (
              <div key={saida.id} className="saida-item">
                <div className="saida-header">
                  <div className="saida-info">
                    <h3>{saida.local?.nome || 'Local não informado'}</h3>
                    <p>Usuário: {saida.usuario_retirada}</p>
                    <p>Data: {formatarData(saida.data_saida)}</p>
                  </div>
                  <button
                    onClick={() => gerarDocumento(saida)}
                    className="btn-gerar-doc"
                  >
                    📄 Gerar Documento
                  </button>
                </div>

                {saida.observacoes && (
                  <div className="observacoes">
                    <strong>Observações:</strong> {saida.observacoes}
                  </div>
                )}

                <div className="itens-saida">
                  <h4>Itens Retirados:</h4>
                  <ul>
                    {saida.itens?.map((item, index) => (
                      <li key={index}>
                        <span className="item-nome">{item.produto_nome}</span>
                        <span className="item-codigo">Cód: {item.produto_codigo_barras}</span>
                        <span className="item-quantidade">Qtd: {item.quantidade}</span>
                        <span className="item-estoque-anterior">Estoque anterior: {item.produto_quantidade_antes}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhuma saída registrada ainda.</p>
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
                        <span style={{ color: '#000' }}><strong>Nome do Responsável:</strong> {saidaSelecionada.usuario_retirada}</span>
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
                              <td style={{ padding: '8px', color: '#000', border: '1px solid #000' }}>{item.produto_nome}</td>
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
              <button onClick={() => window.print()} className="btn-imprimir">
                🖨️ Imprimir
              </button>
              <button onClick={fecharDocumento} className="btn-fechar-doc">
                Fechar
              </button>
            </div>

            <style>{`
              .documento-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
              }
              .documento-modal {
                background: #f5f5f5; /* Fundo cinza para destacar as folhas */
                padding: 0;
                border-radius: 8px;
                width: 95%;
                max-width: 900px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              
              /* Reset específico para a tabela de impressão (aplica em tela e impressão) */
              table.print-table {
                width: 100% !important;
                border-collapse: collapse !important;
                border: 1px solid black !important;
                margin-top: 10px !important;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                overflow: visible !important;
                font-size: 14px !important;
              }
              
              table.print-table thead,
              table.print-table tbody,
              table.print-table tr,
              table.print-table th,
              table.print-table td {
                background: white !important;
                color: black !important;
                border: 1px solid black !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                padding: 8px !important;
                text-align: left;
              }

              table.print-table th {
                font-weight: bold !important;
                background: #eee !important;
                -webkit-print-color-adjust: exact;
              }

              @media print {
                @page {
                  margin: 0;
                  size: A4;
                }
                body {
                  background: white !important;
                  -webkit-print-color-adjust: exact;
                }
                body * {
                  visibility: hidden;
                }
                .documento-modal-overlay, .documento-modal-overlay * {
                  visibility: visible;
                }
                .documento-modal-overlay {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  height: auto;
                  background: white !important;
                  padding: 0;
                  display: block;
                  z-index: 9999;
                }
                .documento-modal {
                  background: white !important;
                  box-shadow: none;
                  width: 100%;
                  max-width: 100%;
                  max-height: none;
                  overflow: visible;
                  padding: 0;
                  margin: 0;
                }
                #documento-para-impressao {
                  background: white !important;
                  padding: 0 !important;
                }
                
                /* Layout Ajustado para Mobile/Desktop */
                .print-page {
                  box-shadow: none !important;
                  margin-bottom: 0 !important;
                  padding: 1cm !important;
                  min-height: 297mm; /* Altura mínima A4 */
                  height: auto !important; /* Altura flexível */
                  page-break-after: always !important;
                  break-after: page !important;
                  position: relative;
                }

                .print-footer {
                     page-break-inside: avoid;
                     break-inside: avoid;
                }

                .print-page:last-child {
                  page-break-after: auto !important;
                  break-after: auto !important;
                }
                .no-print {
                  display: none !important;
                }
                
                /* Forçar display de tabela na impressão */
                table.print-table { display: table !important; }
                table.print-table thead { display: table-header-group !important; }
                table.print-table tbody { display: table-row-group !important; }
                table.print-table tr { display: table-row !important; page-break-inside: avoid !important; }
                table.print-table td, table.print-table th { display: table-cell !important; }

                * {
                  color: black !important;
                  text-shadow: none !important;
                  box-shadow: none !important;
                }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricoSaidas;
