import React, { useState } from 'react';
import { useProdutos } from '../context/ProdutoContext';
import { type Produto } from '../types';


const Estoque: React.FC = () => {
  const { produtos, loading, darBaixaEstoque, darEntradaEstoque, excluirProduto } = useProdutos();
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null);

  if (loading) {
    return <p>Carregando estoque...</p>;
  }

  const handleExcluirClick = (produto: Produto) => {
    setProdutoParaExcluir(produto);
  };

  const handleCancelarExclusao = () => {
    setProdutoParaExcluir(null);
  };

  return (
    <>
      <div className="card">
        <h2>Estoque Atual</h2>
        <ul>
          {produtos.length > 0 ? (
            produtos.map((produto) => (
              <li key={produto.id}>
                <div className="product-info">
                  <strong>{produto.nome}</strong>
                  <span>
                    <span>Cód: {produto.codigo_barras}</span>
                    <span>Qtd: {produto.quantidade}</span>
                  </span>
                </div>
                <div className="botoes-estoque">
                  <button onClick={() => darEntradaEstoque(produto, 1)}>+</button>
                  <button onClick={() => darBaixaEstoque(produto.id, 1)} disabled={produto.quantidade <= 0}>-</button>
                  <button className="btn-excluir" onClick={() => handleExcluirClick(produto)}>
                    ×
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p>Nenhum produto cadastrado.</p>
          )}
        </ul>
      </div>

      {produtoParaExcluir && (
        <div className="modal-exclusao-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-exclusao" style={{
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 var(--space-3) 0' }}>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir o produto <strong>{produtoParaExcluir.nome}</strong>?</p>
            <p>Esta ação não pode ser desfeita.</p>
            <div className="modal-botoes" style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
              <button onClick={handleCancelarExclusao} className="btn-primary">Não</button>
              <button onClick={() => {
                excluirProduto(produtoParaExcluir.id);
                setProdutoParaExcluir(null);
              }} className="btn-primary" style={{ background: 'var(--status-error)' }}>Sim</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Estoque;
