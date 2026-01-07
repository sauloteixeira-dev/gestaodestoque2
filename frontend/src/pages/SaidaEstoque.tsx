import React, { useState } from 'react';
import { useProdutos } from '../context/ProdutoContext';
import { useSaida } from '../context/SaidaContext';


const SaidaEstoque: React.FC = () => {
  const { produtos } = useProdutos();
  const { locais, registrarSaida } = useSaida();
  const [localSelecionado, setLocalSelecionado] = useState<number | null>(null);
  const [usuario, setUsuario] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [itensSelecionados, setItensSelecionados] = useState<{ [key: number]: number }>({});
  const [termoBusca, setTermoBusca] = useState('');
  const [ocultarSemEstoque, setOcultarSemEstoque] = useState(false);

  const capitalizarPrimeiraLetra = (texto: string): string => {
    if (!texto) return texto;
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
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
      .filter(([, quantidade]) => quantidade > 0)
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
    } catch {
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
          </div>
        </div>

        {/* Informações da Retirada */}
        <div className="form-group">
          <label>Nome do Responsável</label>
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

        <button
          onClick={handleRegistrarSaida}
          className="btn-registrar-saida"
          disabled={!localSelecionado || !usuario.trim()}
          style={{ marginTop: '20px', marginBottom: '30px' }}
        >
          Registrar Saída
        </button>

        {/* Seleção de Produtos */}
        <div className="produtos-section">
          <h3>Selecionar Produtos</h3>

          <div className="search-bar" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="🔍 Buscar produto por nome ou código..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #444',
                background: '#2a2a2e',
                color: 'white'
              }}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc', cursor: 'pointer', fontSize: '0.9em' }}>
              <input
                type="checkbox"
                checked={ocultarSemEstoque}
                onChange={(e) => setOcultarSemEstoque(e.target.checked)}
                style={{ width: 'auto' }}
              />
              Ocultar produtos sem estoque (Qtd = 0)
            </label>
          </div>

          <div className="produtos-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {produtos
              .filter(p =>
                (p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
                  p.codigo_barras?.toLowerCase().includes(termoBusca.toLowerCase())) &&
                (!ocultarSemEstoque || p.quantidade > 0)
              )
              .map(produto => (
                <div key={produto.id} className="produto-item-lista" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px',
                  background: '#2a2a2e',
                  borderRadius: '8px',
                  border: '1px solid #444'
                }}>
                  <div className="produto-info" style={{ flex: 1 }}>
                    <strong style={{ fontSize: '1.1em', display: 'block', marginBottom: '4px', color: 'white' }}>{produto.nome}</strong>
                    <div style={{ fontSize: '0.9em', color: '#aaa' }}>
                      <span style={{ marginRight: '15px' }}>Cód: {produto.codigo_barras}</span>
                      <span style={{ color: produto.quantidade > 0 ? '#4caf50' : '#f44336' }}>
                        Estoque: {produto.quantidade}
                      </span>
                    </div>
                  </div>

                  <div className="quantidade-control" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => handleQuantidadeChange(produto.id, Math.max(0, (itensSelecionados[produto.id] || 0) - 1))}
                      disabled={(itensSelecionados[produto.id] || 0) === 0}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2em' }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={itensSelecionados[produto.id] || 0}
                      onChange={(e) => handleQuantidadeChange(produto.id, parseInt(e.target.value) || 0)}
                      min="0"
                      max={produto.quantidade}
                      style={{ width: '60px', textAlign: 'center', padding: '8px', margin: '0' }}
                    />
                    <button
                      onClick={() => handleQuantidadeChange(produto.id, Math.min(produto.quantidade, (itensSelecionados[produto.id] || 0) + 1))}
                      disabled={(itensSelecionados[produto.id] || 0) >= produto.quantidade}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2em' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            {produtos.filter(p => p.nome.toLowerCase().includes(termoBusca.toLowerCase())).length === 0 && (
              <p style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>Nenhum produto encontrado.</p>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default SaidaEstoque;
