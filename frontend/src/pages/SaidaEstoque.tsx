import React, { useState } from 'react';
import { useProdutos } from '../context/ProdutoContext';
import { useSaida } from '../context/SaidaContext';
import { Search, Plus, Minus, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const SaidaEstoque: React.FC = () => {
  const { produtos } = useProdutos();
  const { locais, registrarSaida } = useSaida();
  const [localSelecionado, setLocalSelecionado] = useState<number | null>(null);
  const [usuario, setUsuario] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [itensSelecionados, setItensSelecionados] = useState<{ [key: number]: number }>({});
  const [termoBusca, setTermoBusca] = useState('');
  const [ocultarSemEstoque, setOcultarSemEstoque] = useState(false);
  const [erros, setErros] = useState<{ local?: boolean; usuario?: boolean }>({});

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
    const novosErros: { local?: boolean; usuario?: boolean } = {};

    if (!localSelecionado) {
      novosErros.local = true;
    }

    if (!usuario.trim()) {
      novosErros.usuario = true;
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      return;
    }

    setErros({});

    const itens = Object.entries(itensSelecionados)
      .filter(([, quantidade]) => quantidade > 0)
      .map(([produtoId, quantidade]) => ({
        produto_id: parseInt(produtoId),
        quantidade
      }));

    if (itens.length === 0) {
      toast.error('⚠️ Selecione pelo menos um item para retirada');
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
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Saída de Estoque</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Registre a retirada de itens rapidamente.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

        {/* Left Column: Product Selection */}
        <div className="card-base">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Buscar produto..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <div
              onClick={() => setOcultarSemEstoque(!ocultarSemEstoque)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}
            >
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Ocultar itens zerados</span>
              <div style={{
                width: '44px',
                height: '24px',
                backgroundColor: ocultarSemEstoque ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                borderRadius: '99px',
                position: 'relative',
                transition: 'all 0.2s ease',
                border: `1px solid ${ocultarSemEstoque ? 'var(--accent-primary)' : 'var(--border-color)'}`
              }}>
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: ocultarSemEstoque ? '22px' : '2px',
                  width: '18px',
                  height: '18px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {produtos
              .filter(p =>
                (p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
                  p.codigo_barras?.toLowerCase().includes(termoBusca.toLowerCase())) &&
                (!ocultarSemEstoque || p.quantidade > 0)
              )
              .map(produto => (
                <div key={produto.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1rem' }}>{produto.nome}</strong>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <span>#{produto.codigo_barras}</span>
                      <span style={{ color: produto.quantidade > 0 ? '#4ade80' : '#f87171' }}>Estoque: {produto.quantidade}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => handleQuantidadeChange(produto.id, Math.max(0, (itensSelecionados[produto.id] || 0) - 1))}
                      disabled={(itensSelecionados[produto.id] || 0) === 0}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={itensSelecionados[produto.id] || 0}
                      onChange={(e) => handleQuantidadeChange(produto.id, parseInt(e.target.value) || 0)}
                      style={{ width: '40px', textAlign: 'center', background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: '600' }}
                    />
                    <button
                      onClick={() => handleQuantidadeChange(produto.id, Math.min(produto.quantidade, (itensSelecionados[produto.id] || 0) + 1))}
                      disabled={(itensSelecionados[produto.id] || 0) >= produto.quantidade}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '4px' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            {produtos.filter(p => p.nome.toLowerCase().includes(termoBusca.toLowerCase())).length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Nenhum produto encontrado.</div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Form */}
        <div className="card-base" style={{ position: 'sticky', top: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            Detalhes da Retirada
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Local de Destino</label>
              <select
                value={localSelecionado || ''}
                onChange={(e) => { setLocalSelecionado(parseInt(e.target.value)); setErros(prev => ({ ...prev, local: false })); }}
                className="input-field"
                style={{ appearance: 'none', borderColor: erros.local ? '#ef4444' : undefined }}
              >
                <option value="">Selecione...</option>
                {locais.map(local => (
                  <option key={local.id} value={local.id}>{local.nome}</option>
                ))}
              </select>
              {erros.local && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>⚠️ Por favor, selecione um local de destino</p>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Responsável</label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => { setUsuario(e.target.value); setErros(prev => ({ ...prev, usuario: false })); }}
                placeholder="Nome..."
                className="input-field"
                style={{ borderColor: erros.usuario ? '#ef4444' : undefined }}
              />
              {erros.usuario && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>⚠️ Por favor, preencha o nome do responsável</p>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Observações</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Opcional..."
                className="input-field"
                rows={3}
                style={{ resize: 'none' }}
              />
            </div>

            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Itens Selecionados:</span>
                <strong>{Object.values(itensSelecionados).filter(v => v > 0).length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total de Peças:</span>
                <strong>{Object.values(itensSelecionados).reduce((a, b) => a + b, 0)}</strong>
              </div>

              <button
                onClick={handleRegistrarSaida}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Send size={18} />
                Confirmar Saída
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SaidaEstoque;
