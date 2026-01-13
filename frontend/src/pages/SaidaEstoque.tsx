import React, { useState } from 'react';
import { useProdutos } from '../context/ProdutoContext';
import { useSaida } from '../context/SaidaContext';
import { useAuth } from '../context/AuthContext';
import { Package, Minus, Plus, LogOut } from 'lucide-react';

const SaidaEstoque: React.FC = () => {
  const { produtos } = useProdutos();
  const { locais, registrarSaida } = useSaida();
  const { profile } = useAuth();

  const [localSelecionado, setLocalSelecionado] = useState<number | null>(null);
  const [usuario, setUsuario] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [itensSelecionados, setItensSelecionados] = useState<{ [key: number]: number }>({});
  const [termoBusca, setTermoBusca] = useState('');
  const [ocultarSemEstoque, setOcultarSemEstoque] = useState(false);

  React.useEffect(() => {
    if (profile?.nickname) {
      const formattedName = profile.nickname.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
      setUsuario(formattedName);
    }
  }, [profile]);

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

  const totalItens = Object.values(itensSelecionados).reduce((acc, qtd) => acc + qtd, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Saída de Produtos</h1>
        <p className="page-subtitle">Selecione os produtos e registre a movimentação</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 'var(--space-4)',
        alignItems: 'start'
      }} className="responsive-grid-2">
        {/* COLUNA ESQUERDA - Seleção de Produtos */}
        <div className="card-base">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)'
          }}>
            <div className="icon-container">
              <Package size={20} />
            </div>
            <h2 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--text-primary)'
            }}>
              Selecionar Produtos
            </h2>
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Digitar nome ou código..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="input-field"
                style={{ flex: 1, marginBottom: 0, minWidth: '150px' }}
              />
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                whiteSpace: 'nowrap'
              }}>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={ocultarSemEstoque}
                    onChange={(e) => setOcultarSemEstoque(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                Ocultar s/ estoque
              </label>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            maxHeight: '400px',
            overflowY: 'auto',
            paddingRight: 'var(--space-2)'
          }}>
            {produtos
              .filter(p =>
                (p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
                  p.codigo_barras?.toLowerCase().includes(termoBusca.toLowerCase())) &&
                (!ocultarSemEstoque || p.quantidade > 0)
              )
              .map(produto => (
                <div key={produto.id} style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  background: 'var(--surface-raised)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'border-color 0.15s ease'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-1)'
                    }}>
                      {produto.nome}
                    </div>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      gap: 'var(--space-4)',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      <span>Cód: {produto.codigo_barras}</span>
                      <span style={{
                        color: produto.quantidade > 0 ? 'var(--status-success)' : 'var(--status-error)'
                      }}>
                        Estoque: {produto.quantidade}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <button
                      onClick={() => handleQuantidadeChange(produto.id, Math.max(0, (itensSelecionados[produto.id] || 0) - 1))}
                      disabled={(itensSelecionados[produto.id] || 0) === 0}
                      className="btn-secondary"
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 'unset'
                      }}
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={itensSelecionados[produto.id] || 0}
                      onChange={(e) => handleQuantidadeChange(produto.id, parseInt(e.target.value) || 0)}
                      min="0"
                      max={produto.quantidade}
                      className="input-field mono"
                      style={{
                        width: '64px',
                        textAlign: 'center',
                        padding: 'var(--space-2)',
                        fontWeight: 'var(--font-semibold)'
                      }}
                    />
                    <button
                      onClick={() => handleQuantidadeChange(produto.id, Math.min(produto.quantidade, (itensSelecionados[produto.id] || 0) + 1))}
                      disabled={(itensSelecionados[produto.id] || 0) >= produto.quantidade}
                      className="btn-secondary"
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 'unset'
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            {produtos.filter(p =>
              (p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
                p.codigo_barras?.toLowerCase().includes(termoBusca.toLowerCase())) &&
              (!ocultarSemEstoque || p.quantidade > 0)
            ).length === 0 && (
                <div style={{
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  padding: 'var(--space-6)',
                  fontSize: 'var(--text-sm)'
                }}>
                  Nenhum produto encontrado.
                </div>
              )}
          </div>
        </div>

        {/* COLUNA DIREITA - Formulário de Registro */}
        <div style={{ position: 'sticky', top: 'var(--space-4)' }} className="form-sticky">
          <div className="card-base">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-5)'
            }}>
              <div className="icon-container">
                <LogOut size={20} />
              </div>
              <h2 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text-primary)'
              }}>
                Registrar Saída
              </h2>
            </div>

            {/* Resumo dos Itens Selecionados */}
            {totalItens > 0 && (
              <div style={{
                padding: 'var(--space-3)',
                background: 'var(--surface-raised)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: 'var(--space-4)'
              }}>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Itens selecionados
                </div>
                <div style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--accent-primary)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {totalItens} {totalItens === 1 ? 'item' : 'itens'}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="label">
                Local de Destino
              </label>
              <select
                value={localSelecionado || ''}
                onChange={(e) => setLocalSelecionado(parseInt(e.target.value))}
                className="input-field"
              >
                <option value="">selecionar local</option>
                {locais.map(local => (
                  <option key={local.id} value={local.id}>
                    {local.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">
                Nome do Responsável
              </label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Nome do responsável pela retirada"
                className="input-field"
                disabled
                style={{ backgroundColor: 'var(--bg-tertiary)', cursor: 'not-allowed', opacity: 0.8 }}
              />
            </div>

            <div className="form-group">
              <label className="label">
                Observações (opcional)
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações sobre a retirada"
                rows={4}
                className="input-field"
                style={{ resize: 'vertical', minHeight: '100px' }}
              />
            </div>

            <button
              onClick={handleRegistrarSaida}
              className="btn-primary"
              disabled={!localSelecionado || !usuario.trim() || totalItens === 0}
              style={{ marginTop: 'var(--space-4)', width: '100%', height: '48px' }}
            >
              <LogOut size={18} />
              Registrar Saída
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaidaEstoque;
