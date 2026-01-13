import React, { useState } from 'react';
import { useProdutos } from '../context/ProdutoContext';
<<<<<<< HEAD
import { PlusCircle, AlertCircle, Save, Camera } from 'lucide-react';
import BarcodeScanner from '../components/BarcodeScanner';
=======
import { PackagePlus, Barcode, Box, PlusCircle, AlertCircle, Save } from 'lucide-react';
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5

const CadastroProduto: React.FC = () => {
  const { produtos, adicionarProduto, darEntradaEstoque } = useProdutos();
  const [codigoBarras, setCodigoBarras] = useState('');
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [produtoExistente, setProdutoExistente] = useState<any>(null);
  const [quantidadeAdicional, setQuantidadeAdicional] = useState(1);
  const [isAddingToExisting, setIsAddingToExisting] = useState(false);
<<<<<<< HEAD
  const [showScanner, setShowScanner] = useState(false);
=======


>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5

  const handleCodigoBarrasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCodigoBarras(value);

    const encontrado = produtos.find(p => p.codigo_barras === value);

    if (encontrado) {
      setProdutoExistente(encontrado);
      setNome(encontrado.nome.toUpperCase());
<<<<<<< HEAD
    } else {
      setProdutoExistente(null);
      setNome('');
    }
  };

  const handleScan = (code: string) => {
    setCodigoBarras(code);

    const encontrado = produtos.find(p => p.codigo_barras === code);

    if (encontrado) {
      setProdutoExistente(encontrado);
      setNome(encontrado.nome.toUpperCase());
=======
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
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
<<<<<<< HEAD
    <div>
      <div className="page-header">
        <h1 className="page-title">Novo Produto</h1>
        <p className="page-subtitle">Cadastre novos itens ou adicione estoque a produtos existentes</p>
      </div>

      {/* Info Card */}
      <div className="card-base" style={{
        marginBottom: 'var(--space-6)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        padding: 'var(--space-4)'
      }}>
        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          alignItems: 'center'
        }}>
          <div className="icon-container" style={{
            padding: 'var(--space-2)',
            backgroundColor: '#3b82f6',
            color: 'white'
          }}>
            <AlertCircle size={16} />
          </div>
          <div>
            <h4 style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-1)'
            }}>
              Como funciona?
            </h4>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              lineHeight: 1.4
            }}>
              Digite ou escaneie o código de barras. Se o produto já existir no sistema, você poderá adicionar mais estoque. Caso contrário, preencha o nome e a quantidade inicial para cadastrar um novo produto.
            </p>
          </div>
        </div>
=======
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Novo Produto</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Cadastre novos itens ou adicione estoque.</p>
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
      </div>

      <div className="card-base">
        <form onSubmit={handleSubmit}>
<<<<<<< HEAD
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)'
          }}>
            {/* Primeira linha: Código de Barras e Botão de Escanear */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 'var(--space-3)',
              alignItems: 'end'
            }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="label">
=======

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', alignItems: 'start' }}>

            {/* Coluna 1: Identificação */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Código de Barras */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                  <Barcode size={16} color="var(--accent-primary)" />
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
                  Código de Barras
                </label>
                <input
                  type="text"
                  value={codigoBarras}
                  onChange={handleCodigoBarrasChange}
<<<<<<< HEAD
                  placeholder="Escanear ou digitar código"
                  className="input-field mono"
=======
                  placeholder="Escaneie ou digite..."
                  className="input-field"
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
                  required
                  autoFocus
                />
              </div>
<<<<<<< HEAD
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-3)',
                  whiteSpace: 'nowrap',
                  height: '44px'
                }}
              >
                <Camera size={18} />
                Escanear Código
              </button>
            </div>

            {/* Produto Existente - Feedback */}
            {produtoExistente && (
              <div className="card-elevated" style={{
                backgroundColor: 'var(--status-info-bg)',
                borderColor: 'var(--status-info)',
                padding: 'var(--space-6)'
              }}>
                <div style={{
                  display: 'flex',
                  gap: 'var(--space-3)',
                  alignItems: 'flex-start',
                  marginBottom: 'var(--space-6)'
                }}>
                  <div className="icon-container" style={{
                    padding: 'var(--space-2)'
                  }}>
                    <AlertCircle size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: 'var(--text-md)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--accent-primary)',
                      marginBottom: 'var(--space-1)'
                    }}>
                      Produto Encontrado
                    </h3>
                    <div style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-bold)',
                      marginBottom: 'var(--space-2)',
                      color: 'var(--text-primary)'
                    }}>
                      {produtoExistente.nome}
                    </div>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)'
                    }}>
                      Estoque Atual:{' '}
                      <span className="mono" style={{
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--text-primary)'
                      }}>
                        {produtoExistente.quantidade}
                      </span>
                    </div>
                  </div>
                </div>

                {!isAddingToExisting ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingToExisting(true)}
                    className="btn-secondary"
                    style={{
                      width: '100%',
                      padding: 'var(--space-3)',
                      borderColor: 'var(--accent-primary)',
                      color: 'var(--accent-primary)'
                    }}
                  >
                    <PlusCircle size={18} />
                    Adicionar Mais Estoque
                  </button>
                ) : (
                  <div style={{
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)'
                  }}>
                    <label className="label">
                      Quantidade a Adicionar
                    </label>
                    <div style={{
                      display: 'flex',
                      gap: 'var(--space-3)'
                    }}>
                      <input
                        type="number"
                        value={quantidadeAdicional}
                        onChange={(e) => setQuantidadeAdicional(parseInt(e.target.value) || 1)}
                        className="input-field mono"
                        min="1"
                        required
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          fontSize: 'var(--text-lg)',
                          fontWeight: 'var(--font-bold)'
                        }}
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                        style={{
                          padding: '0 var(--space-6)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Save size={18} />
                        Confirmar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Segunda linha: Nome do Produto e Quantidade (apenas se produto não existir) */}
            {!produtoExistente && (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: 'var(--space-4)'
                }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">
                      Nome do Produto
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value.toUpperCase())}
                      placeholder="Ex: Teclado Mecânico"
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="label">
=======

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
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
                      Quantidade Inicial
                    </label>
                    <input
                      type="number"
                      value={quantidade}
                      onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
<<<<<<< HEAD
                      className="input-field mono"
                      min="1"
                      required
                      style={{
                        textAlign: 'center',
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-semibold)'
                      }}
                    />
                  </div>
                </div>

                {/* Terceira linha: Botão Cadastrar (canto esquerdo) */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{
                      padding: 'var(--space-4) var(--space-8)',
                      fontSize: 'var(--text-md)'
                    }}
                  >
                    <Save size={20} />
                    {isSubmitting ? 'Cadastrando...' : 'Cadastrar Produto'}
                  </button>
                </div>
              </>
            )}
=======
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

>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
          </div>
        </form>
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default CadastroProduto;
