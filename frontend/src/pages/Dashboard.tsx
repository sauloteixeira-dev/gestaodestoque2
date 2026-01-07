import React from 'react';
import { useProdutos } from '../context/ProdutoContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { produtos, loading } = useProdutos();

  const getQuantidadeColor = (quantidade: number) => {
    if (quantidade < 10) return 'red';
    if (quantidade > 20) return 'green';
    return '';
  };

  if (loading) {
    return <p>Carregando dashboard...</p>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="summary-card">
        <h2>Total de Produtos Cadastrados</h2>
        <p>{produtos.length}</p>
      </div>
      <div className="card">
        <h2>Itens em Estoque</h2>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Quantidade</th>
              <th>Código de Barras</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length > 0 ? (
              produtos.map(produto => (
                <tr key={produto.id}>
                  <td>{produto.nome}</td>
                  <td className={getQuantidadeColor(produto.quantidade)}>{produto.quantidade}</td>
                  <td>{produto.codigo_barras}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>Nenhum produto em estoque.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;

