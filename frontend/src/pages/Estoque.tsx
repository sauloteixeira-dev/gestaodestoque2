import React, { useState } from 'react';
import { useProdutos } from '../context/ProdutoContext';


const Estoque: React.FC = () => {
  const { produtos, loading, darBaixaEstoque, darEntradaEstoque, excluirProduto } = useProdutos();
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<any>(null);

  if (loading) {
    return <p>Carregando estoque...</p>;
  }

  const handleExcluirClick = (produto: any) => {
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
        <div className="modal-exclusao-overlay">
          <div className="modal-exclusao">
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir o produto <strong>{produtoParaExcluir.nome}</strong>?</p>
            <p>Esta ação não pode ser desfeita.</p>
            <div className="modal-botoes">
              <button onClick={handleCancelarExclusao} className="btn-cancelar">Não</button>
              <button onClick={() => {
                excluirProduto(produtoParaExcluir.id);
                setProdutoParaExcluir(null);
              }} className="btn-confirmar">Sim</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Estoque;
