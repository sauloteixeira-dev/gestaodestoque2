import React, { useState } from 'react';
import { useSaida } from '../context/SaidaContext';
import './HistoricoSaidas.css';

const HistoricoSaidas: React.FC = () => {
  const { saidas, loading } = useSaida();
  const [saidaSelecionada, setSaidaSelecionada] = useState<any>(null);

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleString('pt-BR');
  };

  const gerarDocumento = (saida: any) => {
    console.log('Dados da saída selecionada:', saida);
    console.log('Itens da saída:', saida.itens);
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
            <div className="documento-header">
              <h2>Documento de Saída</h2>
              <button onClick={fecharDocumento} className="btn-fechar">✕</button>
            </div>
            
            <div className="documento-content">
              <div className="documento-info">
                <div className="info-row">
                  <span><strong>Local:</strong> {saidaSelecionada.local?.nome}</span>
                </div>
                <div className="info-row">
                  <span><strong>Usuário:</strong> {saidaSelecionada.usuario_retirada}</span>
                </div>
                <div className="info-row">
                  <span><strong>Data:</strong> {formatarData(saidaSelecionada.data_saida)}</span>
                </div>
                {saidaSelecionada.observacoes && (
                  <div className="info-row">
                    <span><strong>Observações:</strong> {saidaSelecionada.observacoes}</span>
                  </div>
                )}
              </div>

              <div className="documentos-itens">
                <h3>Relação de Itens Retirados</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th style={{ display: 'none' }}>Código</th>
                      <th>Quantidade</th>
                      <th style={{ display: 'none' }}>Estoque Anterior</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saidaSelecionada.itens && saidaSelecionada.itens.length > 0 ? (
                      saidaSelecionada.itens.map((item: any, index: number) => (
                        <tr key={index}>
                          <td>{item.produto_nome}</td>
                          <td style={{ display: 'none' }}>{item.produto_codigo_barras}</td>
                          <td>{item.quantidade}</td>
                          <td style={{ display: 'none' }}>{item.produto_quantidade_antes}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4}>Nenhum item registrado nesta saída.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="documento-footer">
                <div className="assinatura">
                  <p>_______________________________________</p>
                  <p>Assinatura do Responsável</p>
                </div>
                <div className="data-documento">
                  <p>Emitido em: {formatarData(new Date().toISOString())}</p>
                </div>
              </div>
            </div>

            <div className="documento-actions">
              <button onClick={() => window.print()} className="btn-imprimir">
                🖨️ Imprimir
              </button>
              <button onClick={fecharDocumento} className="btn-fechar-doc">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricoSaidas;
