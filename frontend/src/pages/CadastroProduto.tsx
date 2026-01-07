import React, { useState } from 'react';
import { useProdutos } from '../context/ProdutoContext';


const CadastroProduto: React.FC = () => {
  const { produtos, adicionarProduto, darEntradaEstoque } = useProdutos();
  const [codigoBarras, setCodigoBarras] = useState('');
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [produtoExistente, setProdutoExistente] = useState<any>(null);
  const [quantidadeAdicional, setQuantidadeAdicional] = useState(1);
  const [isAddingToExisting, setIsAddingToExisting] = useState(false);

  const capitalizarPrimeiraLetra = (texto: string): string => {
    if (!texto) return texto;
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  const handleCodigoBarrasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    setCodigoBarras(value);

    console.log('Verificando código:', value);
    console.log('Produtos disponíveis:', produtos);

    const encontrado = produtos.find(p => p.codigo_barras === value);
    console.log('Produto encontrado:', encontrado);

    if (encontrado) {
      setProdutoExistente(encontrado);
      setNome(capitalizarPrimeiraLetra(encontrado.nome));
    } else {
      setProdutoExistente(null);
      setNome('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (produtoExistente) {
        await darEntradaEstoque(produtoExistente, quantidadeAdicional);
        setQuantidadeAdicional(1);
      } else {
        await adicionarProduto(codigoBarras, capitalizarPrimeiraLetra(nome), quantidade);
        setCodigoBarras('');
        setNome('');
        setQuantidade(1);
      }
      setProdutoExistente(null);
    } catch (error) {
      // O erro já é tratado no contexto
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdicionarMais = () => {
    setIsAddingToExisting(true);
  };

  return (
    <div className="cadastro-produto-container">
      <div className="card">
        <h2>Cadastrar Novo Produto</h2>
        <form onSubmit={handleSubmit} className="cadastro-form">
          <div className="form-group">
            <label htmlFor="codigoBarras">Código de Barras</label>
            <input
              id="codigoBarras"
              type="number"
              placeholder="Digite apenas números"
              value={codigoBarras}
              onChange={handleCodigoBarrasChange}
              onKeyPress={(e) => {
                // Impede entrada de caracteres não numéricos
                const char = String.fromCharCode(e.which);
                if (!/[0-9]/.test(char)) {
                  e.preventDefault();
                }
              }}
              required
            />
          </div>
          {produtoExistente ? (
            <div className="produto-existente-aviso">
              <p><strong>Produto já cadastrado!</strong></p>
              <p>Nome: {produtoExistente.nome}</p>
              <p>Quantidade atual: {produtoExistente.quantidade}</p>
              {!isAddingToExisting ? (
                <button type="button" onClick={handleAdicionarMais} className="btn-adicionar-mais">
                  Adicionar mais itens
                </button>
              ) : (
                <div className="form-group">
                  <label htmlFor="quantidadeAdicional">Quantidade a Adicionar</label>
                  <input
                    id="quantidadeAdicional"
                    type="number"
                    value={quantidadeAdicional}
                    onChange={(e) => setQuantidadeAdicional(parseInt(e.target.value) || 1)}
                    min="1"
                    required
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="nome">Nome do Produto</label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Digite o nome do produto"
                  value={capitalizarPrimeiraLetra(nome)}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="quantidade">Quantidade Inicial</label>
                <input
                  id="quantidade"
                  type="number"
                  placeholder="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                  min="1"
                  required
                />
              </div>
            </>
          )}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Processando...' : (produtoExistente ? 'Adicionar ao Estoque' : 'Adicionar')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CadastroProduto;
