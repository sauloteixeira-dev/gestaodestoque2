import React, { useEffect } from 'react';
import { useLogsExclusao } from '../context/LogsExclusaoContext';


interface LogExclusao {
  id: number;
  produto_id: number;
  produto_nome: string;
  produto_codigo_barras: string;
  produto_quantidade: number;
  data_exclusao: string;
  usuario_exclusao: string;
}

const LogsExclusao: React.FC = () => {
  const { logs, loading, refreshLogs } = useLogsExclusao();

  useEffect(() => {
    refreshLogs();
  }, []); // Array vazio para executar apenas uma vez

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  };

  if (loading) {
    return <p>Carregando logs de exclusão...</p>;
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Logs de Exclusão de Produtos</h2>
        <button onClick={refreshLogs} className="btn-atualizar">
          🔄 Atualizar
        </button>
      </div>
      {logs.length > 0 ? (
        <table className="logs-table">
          <thead>
            <tr>
              <th>Data da Exclusão</th>
              <th>Produto</th>
              <th>Código de Barras</th>
              <th>Quantidade</th>
              <th>Usuário</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: LogExclusao) => (
              <tr key={log.id}>
                <td>{formatarData(log.data_exclusao)}</td>
                <td>{log.produto_nome}</td>
                <td>{log.produto_codigo_barras}</td>
                <td>{log.produto_quantidade}</td>
                <td>{log.usuario_exclusao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhum produto foi excluído ainda.</p>
      )}
    </div>
  );
};

export default LogsExclusao;
