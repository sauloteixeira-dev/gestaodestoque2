import React, { useState } from 'react';
import { useProdutos } from '../context/ProdutoContext';
import { PackagePlus, Barcode, Box, PlusCircle, AlertCircle, Save } from 'lucide-react';

const CadastroProduto: React.FC = () => {
  const { produtos, adicionarProduto, darEntradaEstoque } = useProdutos();
  const [codigoBarras, setCodigoBarras] = useState('');
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [produtoExistente, setProdutoExistente] = useState<any>(null);
  const [quantidadeAdicional, setQuantidadeAdicional] = useState(1);
  const [isAddingToExisting, setIsAddingToExisting] = useState(false);



  const handleCodigoBarrasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCodigoBarras(value);

    const encontrado = produtos.find(p => p.codigo_barras === value);

    if (encontrado) {
      setProdutoExistente(encontrado);
      setNome(encontrado.nome.toUpperCase());
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
        setIsAddingToExisting(false);
      } else {
        await adicionarProduto(codigoBarras, nome, quantidade);
        setCodigoBarras('');
        setNome('');
        setQuantidade(1);
      }
      setProdutoExistente(null);
    } catch (error) {
      // Erro já tratado no contexto
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Novo Produto</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Cadastre novos itens ou adicione estoque.</p>
      </div>

      <div className="card-base">
        <form onSubmit={handleSubmit}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', alignItems: 'start' }}>

            {/* Coluna 1: Identificação */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Código de Barras */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                  <Barcode size={16} color="var(--accent-primary)" />
                  Código de Barras
                </label>
                <input
                  type="text"
                  value={codigoBarras}
                  onChange={handleCodigoBarrasChange}
                  placeholder="Escaneie ou digite..."
                  className="input-field"
                  required
                  autoFocus
                />
              </div>

              {/* Nome do Produto (Renderizado aqui se não existir) */}
              {!produtoExistente && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                    <PackagePlus size={16} color="var(--accent-primary)" />
                    Nome do Produto
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value.toUpperCase())}
                    placeholder="EX: TECLADO MECÂNICO"
                    className="input-field"
                    required
                  />
                </div>
              )}
            </div>

            {/* Coluna 2: Detalhes ou Feedback */}
            <div>
              {produtoExistente ? (
                <div style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '2rem'
                }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <AlertCircle size={32} color="var(--accent-primary)" />
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>Produto Encontrado!</h3>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{produtoExistente.nome}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Estoque Atual: <b style={{ color: 'white' }}>{produtoExistente.quantidade}</b></div>
                    </div>
                  </div>

                  {!isAddingToExisting ? (
                    <button
                      type="button"
                      onClick={() => setIsAddingToExisting(true)}
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', background: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
                    >
                      <PlusCircle size={18} /> Adicionar Mais Estoque
                    </button>
                  ) : (
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Quantidade a Adicionar</label>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                          type="number"
                          value={quantidadeAdicional}
                          onChange={(e) => setQuantidadeAdicional(parseInt(e.target.value) || 1)}
                          className="input-field"
                          min="1"
                          required
                          style={{ flex: 1, textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}
                        />
                        <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '0 2rem' }}>
                          <Save size={18} /> Confirmar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Quantidade Inicial */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                      <Box size={16} color="var(--accent-primary)" />
                      Quantidade Inicial
                    </label>
                    <input
                      type="number"
                      value={quantidade}
                      onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                      className="input-field"
                      min="1"
                      required
                    />
                  </div>

                  <div style={{ paddingTop: '0' }}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '1rem', marginTop: '1.4rem' }}
                    >
                      <Save size={20} />
                      {isSubmitting ? 'Cadastrando...' : 'Cadastrar Produto'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroProduto;
