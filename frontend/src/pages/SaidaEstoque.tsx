import React, { useState } from 'react';
import { useProdutos } from '../context/ProdutoContext';
import { useSaida } from '../context/SaidaContext';
import './SaidaEstoque.css';

const SaidaEstoque: React.FC = () => {
  const { produtos } = useProdutos();
  const { locais, adicionarLocal, registrarSaida } = useSaida();
  const [localSelecionado, setLocalSelecionado] = useState<number | null>(null);
  const [novoLocal, setNovoLocal] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [usuario, setUsuario] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [itensSelecionados, setItensSelecionados] = useState<{[key: number]: number}>({});
  const [mostrarAdicionarLocal, setMostrarAdicionarLocal] = useState(false);

  const capitalizarPrimeiraLetra = (texto: string): string => {
    if (!texto) return texto;
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  const handleAdicionarLocal = async () => {
    if (!novoLocal.trim()) return;
    
    try {
      await adicionarLocal(capitalizarPrimeiraLetra(novoLocal), novaDescricao);
      setNovoLocal('');
      setNovaDescricao('');
      setMostrarAdicionarLocal(false);
    } catch (error) {
      // Erro já tratado no contexto
    }
  };

  const handleQuantidadeChange = (produtoId: number, quantidade: number) => {
    setItensSelecionados(prev => ({
      ...prev,
      [produtoId]: quantidade
    }));
  };

  const handleRegistrarSaida = async () => {
    if (!localSelecionado || !usuario.trim()) {
      alert('Selecione um local e informe o nome do usuário');
      return;
    }

    const itens = Object.entries(itensSelecionados)
      .filter(([_, quantidade]) => quantidade > 0)
      .map(([produtoId, quantidade]) => ({
        produto_id: parseInt(produtoId),
        quantidade
      }));

    if (itens.length === 0) {
      alert('Selecione pelo menos um item para retirada');
      return;
    }

    try {
      await registrarSaida(localSelecionado, capitalizarPrimeiraLetra(usuario), itens, observacoes);
      setLocalSelecionado(null);
      setUsuario('');
      setObservacoes('');
      setItensSelecionados({});
    } catch (error) {
      // Erro já tratado no contexto
    }
  };

  return (
    <div className="saida-estoque-container">
      <div className="card">
        <h2>Registrar Saída de Estoque</h2>
        
        {/* Seleção de Local */}
        <div className="form-group">
          <label>Local de Destino</label>
          <div className="local-selection">
            <select 
              value={localSelecionado || ''} 
              onChange={(e) => setLocalSelecionado(parseInt(e.target.value))}
              className="local-select"
            >
              <option value="">Selecione um local...</option>
              {locais.map(local => (
                <option key={local.id} value={local.id}>
                  {local.nome}
                </option>
              ))}
            </select>
            <button 
              type="button" 
              onClick={() => setMostrarAdicionarLocal(true)}
              className="btn-add-local"
            >
              + Adicionar Local
            </button>
          </div>
        </div>

        {/* Formulário para adicionar novo local */}
        {mostrarAdicionarLocal && (
          <div className="novo-local-form">
            <h3>Adicionar Novo Local</h3>
            <div className="form-group">
              <label>Nome do Local</label>
              <input
                type="text"
                value={novoLocal}
                onChange={(e) => setNovoLocal(e.target.value)}
                placeholder="Ex: Cozinha Comunitária"
              />
            </div>
            <div className="form-group">
              <label>Descrição (opcional)</label>
              <input
                type="text"
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                placeholder="Descrição do local"
              />
            </div>
            <div className="form-buttons">
              <button onClick={handleAdicionarLocal} className="btn-confirmar">
                Adicionar
              </button>
              <button onClick={() => setMostrarAdicionarLocal(false)} className="btn-cancelar">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Informações da Retirada */}
        <div className="form-group">
          <label>Nome do Usuário</label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Nome de quem está retirando"
          />
        </div>

        <div className="form-group">
          <label>Observações (opcional)</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Observações sobre a retirada"
            rows={3}
          />
        </div>

        {/* Seleção de Produtos */}
        <div className="produtos-section">
          <h3>Selecionar Produtos</h3>
          <div className="produtos-grid">
            {produtos.map(produto => (
              <div key={produto.id} className="produto-item">
                <div className="produto-info">
                  <strong>{produto.nome}</strong>
                  <span>Cód: {produto.codigo_barras}</span>
                  <span>Estoque: {produto.quantidade}</span>
                </div>
                <div className="quantidade-control">
                  <button 
                    onClick={() => handleQuantidadeChange(produto.id, Math.max(0, (itensSelecionados[produto.id] || 0) - 1))}
                    disabled={(itensSelecionados[produto.id] || 0) === 0}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={itensSelecionados[produto.id] || 0}
                    onChange={(e) => handleQuantidadeChange(produto.id, parseInt(e.target.value) || 0)}
                    min="0"
                    max={produto.quantidade}
                  />
                  <button 
                    onClick={() => handleQuantidadeChange(produto.id, Math.min(produto.quantidade, (itensSelecionados[produto.id] || 0) + 1))}
                    disabled={(itensSelecionados[produto.id] || 0) >= produto.quantidade}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={handleRegistrarSaida}
          className="btn-registrar-saida"
          disabled={!localSelecionado || !usuario.trim()}
        >
          Registrar Saída
        </button>
      </div>
    </div>
  );
};

export default SaidaEstoque;
